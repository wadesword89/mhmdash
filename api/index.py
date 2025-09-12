from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from api.data_sources.prism_api import requestPrismDepthData
from api.data_sources.mhm_api import fetchMHMLevelData
from datetime import datetime

app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mm_to_inches(mm):
    if mm is None:
        return None
    return round(mm / 25.4, 2)


@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}


# Get Flow Meter Depth Data (From PRISM API)
@app.post("/api/py/prism_depth")
async def prism_depth(request: Request):
    try:
        body = await request.json()
        startTime = body.get("startTime")
        endTime = body.get("endTime")
        locationId = body.get("locationId")

        if not startTime or not endTime:
            raise HTTPException(
                status_code=400, detail="startTime and endTime are required"
            )

        result = requestPrismDepthData(startTime, endTime, locationId)

        if not result:
            raise HTTPException(status_code=404, detail="Data not found in PRISM API")
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get MHM Level Data (From MHM API)
@app.post("/api/py/mhm_level")
async def mhm_level(request: Request):
    try:
        body = await request.json()
        startTime = body.get("startTime")
        endTime = body.get("endTime")
        deviceId = body.get("deviceId")

        if not startTime or not endTime:
            raise HTTPException(
                status_code=400, detail="startTime and endTime are required"
            )
        data = fetchMHMLevelData(startTime, endTime, deviceId)

        # Convert level to inches
        series = [
            {"t": p["t"], "levelIn": mm_to_inches(p["levelMm"])}
            for p in data["measurements"]
            if p.get("levelMm") is not None
        ]

        result = {
            "deviceId": data["deviceId"],
            "coordinates": data["coordinates"],
            "maxDistanceIn": mm_to_inches(data["maxDistanceMm"]),
            "lastWaterLevelIn": mm_to_inches(data["lastWaterLevelMm"]),
            "lastFillPercent": data["lastFillPercent"],
            "window": data["window"],
            "timeSeries": series,
        }
        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/py/site_data")
async def site_data(req: Request):
    body = await req.json()
    site = body.get("site")
    startTime = body.get("startTime")
    endTime = body.get("endTime")

    # --- MHM (always) ---
    try:
        mhm_raw = fetchMHMLevelData(startTime, endTime, site["mhm_id"])
        mhm_series = [
            {"t": p["t"], "levelIn": mm_to_inches(p.get("levelMm"))}
            for p in mhm_raw.get("measurements", [])
            if p.get("levelMm") is not None
        ]
        mhm = {
            "deviceId": mhm_raw.get("deviceId"),
            "lastWaterLevelIn": mm_to_inches(mhm_raw.get("lastWaterLevelMm")),
            "lastFillPercent": mhm_raw.get("lastFillPercent"),
            "timeSeries": mhm_series,
        }
    except Exception as e:
        mhm = {"error": str(e), "timeSeries": []}

    # --- Reference (branch ADS/LMS/None) ---
    ref_type = site.get("ref_type")
    reference = {"type": None, "meta": {}, "timeSeries": []}

    if ref_type == "ADS":
        try:
            prism_raw = requestPrismDepthData(startTime, endTime, site.get("ref_locId"))

            reference = prism_raw[0]["entityData"][0]

        except Exception as e:
            reference = {"type": "ADS", "meta": {}, "timeSeries": [], "error": str(e)}

    elif ref_type == "LMS":
        # Stub until you wire it up
        reference = {
            "type": "LMS",
            "meta": {},
            "timeSeries": [],
            "error": "LMS not implemented",
        }

    return {
        "site": {
            "site_id": site.get("id"),
            "mh_id": site.get("mh_id"),
            "mhm_id": site.get("mhm_id"),
            "ref_type": site.get("ref_type"),
            "ref_id": site.get("ref_id"),
            "ref_locId": site.get("ref_locId"),
            "coordinates": site.get("coordinates"),
        },
        "timeframe": {"start": startTime, "end": endTime},
        "mhm": mhm,
        "ref": reference,
    }
