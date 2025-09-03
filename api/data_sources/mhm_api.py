import requests
from dotenv import load_dotenv
import os
import json
import time
from datetime import datetime, timezone

load_dotenv()

API_BASE = "https://client-device-service.manhole-metrics.com"
API_KEY = os.getenv("NEXT_PUBLIC_MHM_API_TOKEN")


def to_unix_seconds(value):
    """Accepts UNIX seconds, ISO8601 strings, or datetime; returns UNIX seconds (int)."""
    if isinstance(value, (int, float)):
        return int(value)

    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return int(value.timestamp())

    if isinstance(value, str):
        # Try ISO8601, allowing trailing Z
        s = value.strip().replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(s)
        except ValueError:
            # Fallback formats
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    dt = datetime.strptime(value, fmt).replace(tzinfo=timezone.utc)
                    break
                except ValueError:
                    dt = None
            if dt is None:
                raise ValueError(f"Unrecognized datetime string: {value}")
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return int(dt.timestamp())

    raise ValueError(
        "start_time/end_time must be UNIX seconds, ISO8601 string, or datetime"
    )


def fetchMHMLevelData(
    start_time, end_time, device_id, pause_between_requests=0.4, max_retries=2
):
    """
    Return all level measurements for a device within the time window [start_time, end_time].

    Output shape:
    {
      "deviceId": "951",
      "coordinates": [lat, lon] or None,
      "maxDistanceMm": 2108 or None,
      "lastWaterLevelMm": 208.0 or None,
      "lastFillPercent": 9.0 or None,
      "window": {"startUnix": 1748304000, "endUnix": 1748908799},
      "measurements": [{"t": 1748377262, "levelMm": 118.0}, ...]  # t = UNIX seconds
    }
    """
    headers = {"api_key": API_KEY}
    start_unix = to_unix_seconds(start_time)
    end_unix = to_unix_seconds(end_time)
    if end_unix < start_unix:
        raise ValueError("end_time must be greater than or equal to start_time")

    cursor = start_unix
    all_points = []
    meta = None

    def get_with_retries(url):
        for attempt in range(max_retries + 1):
            try:
                resp = requests.get(url, headers=headers, timeout=30)
                # Retry on 5xx; otherwise raise for non-2xx
                if 500 <= resp.status_code < 600 and attempt < max_retries:
                    time.sleep(1.2**attempt)
                    continue
                resp.raise_for_status()
                return resp
            except Exception:
                if attempt == max_retries:
                    raise
                time.sleep(1.2**attempt)

    while True:
        url = f"{API_BASE}/client_device?device_id={device_id}&starting_unix_timestamp={cursor}"
        resp = get_with_retries(url)
        data = resp.json()

        # Save basic metadata once
        if meta is None:
            meta = {
                "deviceId": str(data.get("device_id")),
                "coordinates": data.get("device_coordinates"),
                "maxDistanceMm": data.get("max_distance"),
                "lastWaterLevelMm": data.get("last_water_level"),
                "lastFillPercent": data.get("last_fill_percentage"),
            }

        rows = data.get("water_level_measurements", [])
        if not rows:
            break  # no more data from API

        # Add only points in range; stop if we pass end_unix (API is chronological)
        stop_now = False
        for row in rows:
            ts = int(row.get("measurement_unix_timestamp"))
            lvl = row.get("water_level_mm")
            if ts > end_unix:
                stop_now = True
                break
            if ts >= start_unix:
                all_points.append({"t": ts, "levelMm": lvl})

        # Move the cursor forward for the next page
        last_ts = int(rows[-1]["measurement_unix_timestamp"])
        next_cursor = last_ts + 1

        if stop_now or next_cursor <= cursor or next_cursor > end_unix:
            break

        cursor = next_cursor
        if pause_between_requests:
            time.sleep(pause_between_requests)

    # Sort just in case
    all_points.sort(key=lambda x: x["t"])

    return {
        **(
            meta
            or {
                "deviceId": str(device_id),
                "coordinates": None,
                "maxDistanceMm": None,
                "lastWaterLevelMm": None,
                "lastFillPercent": None,
            }
        ),
        "window": {"startUnix": start_unix, "endUnix": end_unix},
        "measurements": all_points,
    }


# ---- Example usage ----
result = fetchMHMLevelData(
    device_id=951,
    start_time="2025-09-01T00:00:00Z",
    end_time="2025-09-02T23:59:59Z",
)

# Print compact JSON for Next.js frontend
print(json.dumps(result, indent=2))
