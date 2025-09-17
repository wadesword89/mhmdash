'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ---------- Types ----------
type ApiResponse = {
  site: {
    site_id: number;
    mh_id: string;
    mhm_id: number;
    ref_type: string;
    ref_id: string;
    ref_locId: number;
    coordinates: [number, number];
  };
  timeframe: { start: string; end: string };
  mhm: {
    deviceId: string;
    lastWaterLevelIn: number | null;
    lastFillPercent: number | null;
    timeSeries: { t: number; levelIn: number | null }[];
  };
  ref: {
    entityID: number;
    locationID: number;
    data: {
      dateTime: string;
      reading: number | null;
      quality: number | null;
    }[];
  };
};

// ---------- Helpers ----------
const MINUTE = 60_000;

function toDateFromUnixSeconds(sec: number) {
  return new Date(sec * 1000);
}

function roundTo5Min(date: Date) {
  const ms = date.getTime();
  const rounded = Math.round(ms / (5 * MINUTE)) * (5 * MINUTE);
  return new Date(rounded);
}

function withinMinutes(a: Date, b: Date, minutes: number) {
  return Math.abs(a.getTime() - b.getTime()) <= minutes * MINUTE;
}

function formatTime(d: Date) {
  // Shows local time (your app runs in the browser; server rendering also fine)
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Optional: treat obvious bogus spikes or placeholders */
function isBadLevelIn(val: number | null | undefined) {
  if (val == null) return true;
  if (!isFinite(val)) return true;
  // Domain-specific guards: drop negatives and impossible spikes
  if (val < 0) return true;
  if (val > 200) return true; // adjust if your pipe vertical range > 200"
  return false;
}

function isBadRef(val: number | null | undefined) {
  if (val == null) return true;
  if (!isFinite(val)) return true;
  if (val < 0 || val > 5) return true; // ref here seems ~0.98…1.9…. adjust if needed
  return false;
}

/** Build a 5-min timeline from timeframe.start..end */
function buildTimeline(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const times: Date[] = [];
  let t = roundTo5Min(start).getTime();
  const endT = end.getTime();
  for (; t <= endT; t += 5 * MINUTE) times.push(new Date(t));
  return times;
}

/** Pre-index series by nearest 5-min slot for fast merge */
function indexMhm(series: { t: number; levelIn: number | null }[]) {
  const map = new Map<number, number>(); // timeMs -> levelIn
  for (const p of series) {
    const d = toDateFromUnixSeconds(p.t);
    const slot = roundTo5Min(d).getTime();
    if (!isBadLevelIn(p.levelIn)) map.set(slot, p.levelIn as number);
  }
  return map;
}

function indexRef(
  series: { dateTime: string; reading: number | null; quality: number | null }[]
) {
  const map = new Map<number, { reading: number; quality: number | null }>();
  for (const p of series) {
    const d = new Date(p.dateTime);
    const slot = roundTo5Min(d).getTime();
    if (!isBadRef(p.reading))
      map.set(slot, { reading: p.reading!, quality: p.quality ?? null });
  }
  return map;
}

/** Optionally allow nearest neighbor within ±3 minutes for each slot */
function nearestWithin(
  slot: Date,
  raw: Date[],
  values: Map<number, number>,
  radiusMin = 3
): number | null {
  let best: { dt: number; val: number } | null = null;
  for (const d of raw) {
    if (withinMinutes(slot, d, radiusMin)) {
      const v = values.get(roundTo5Min(d).getTime());
      if (v == null) continue;
      const dist = Math.abs(slot.getTime() - d.getTime());
      if (!best || dist < best.dt) best = { dt: dist, val: v };
    }
  }
  return best ? best.val : null;
}

/** Prepare chart-ready rows: one per 5-minute slot */
function prepareChartData(payload: ApiResponse) {
  const timeline = buildTimeline(
    payload.timeframe.start,
    payload.timeframe.end
  );

  const mhmDates = payload.mhm.timeSeries.map((p) =>
    toDateFromUnixSeconds(p.t)
  );
  const refDates = payload.ref.data.map((p) => new Date(p.dateTime));

  const mhmIdx = indexMhm(payload.mhm.timeSeries);
  const refIdx = indexRef(payload.ref.data);

  return timeline.map((d) => {
    const tkey = d.getTime();
    // Try direct slot first; otherwise allow nearest within ±3 min
    let levelIn = mhmIdx.get(tkey);
    if (levelIn == null) levelIn = nearestWithin(d, mhmDates, mhmIdx, 3);

    let ref = refIdx.get(tkey);
    // no nearest for ref here; add if your ref spacing is > 5 min
    return {
      time: d,
      timeLabel: formatTime(d),
      levelIn: levelIn ?? null,
      refReading: ref?.reading ?? null,
      refQuality: ref?.quality ?? null,
    };
  });
}

// ---------- Component ----------
export default function MHLevelCompare({ data }: { data: ApiResponse }) {
  const rows = React.useMemo(() => prepareChartData(data), [data]);

  // Simple thresholds & zero markers (customize)
  const hasZeros = rows.some((r) => r.levelIn === 0);
  const spikeThresh = 12; // alert line for high levelIn, adjust per pipe diameter

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold">
            MH {data.site.mh_id} — Level vs {data.ref.ref_type}
          </h2>
          <p className="text-sm opacity-70">
            {new Date(data.timeframe.start).toLocaleString()} –{' '}
            {new Date(data.timeframe.end).toLocaleString()}
          </p>
        </div>
        <div className="text-sm opacity-70">
          Device #{data.mhm.deviceId} • Ref{' '}
          {data.ref.ref_id ?? data.site.ref_id}
        </div>
      </div>

      <CardContent className="p-0">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(v) => formatTime(new Date(v))}
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: 'Level (in)',
                  angle: -90,
                  position: 'insideLeft',
                }}
                allowDecimals
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: 'Ref (unitless)',
                  angle: -90,
                  position: 'insideRight',
                }}
                allowDecimals
              />
              <Tooltip
                labelFormatter={(v) => formatTime(new Date(v))}
                formatter={(value: any, name: string) => {
                  if (name === 'levelIn') return [value ?? '—', 'Level (in)'];
                  if (name === 'refReading') return [value ?? '—', 'Ref'];
                  return [value, name];
                }}
              />
              <Legend />

              {/* LevelIn line (left axis) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="levelIn"
                name="Level (in)"
                dot={false}
                strokeWidth={2}
                connectNulls
              />

              {/* Ref reading (right axis). Lower opacity if quality < 15 */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="refReading"
                name={`Ref (${data.ref.ref_type})`}
                dot={false}
                strokeWidth={2}
                connectNulls
              />

              {/* Optional threshold */}
              <ReferenceLine
                yAxisId="left"
                y={spikeThresh}
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Simple quality legend */}
        <div className="mt-2 text-xs opacity-70">
          <div>
            Quality (Ref): 15 = good, 11 = usable (faded), others = check
            calibration
          </div>
          {hasZeros && (
            <div className="mt-1">
              Note: 0-values present in Level — could indicate sensor dropout or
              surcharge reset.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
