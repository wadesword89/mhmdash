'use client';
import { useMemo } from 'react';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Bar,
  ComposedChart,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function DepthChart({ site, data }) {
  const mhmData = data?.mhmData;
  const refData = data?.refData;
  const rainfallData = data?.rainData;
  console.log('Rainfall data:', rainfallData);

  const hasMhmData = mhmData?.timeSeries && mhmData.timeSeries.length > 0;
  const hasRefData = refData?.data && refData.data.length > 0;
  const hasRainfallData =
    Array.isArray(rainfallData?.data) && rainfallData.data.length > 0;

  // Early return if no data available at all
  if (!hasRefData && !hasMhmData) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-500">No Data Available</p>
          <p className="text-sm text-gray-400">
            No data found for MHM {site.mhm_id} or Reference {site.ref_id}
          </p>
        </div>
      </div>
    );
  }

  // Process and merge the datasets including rainfall
  const processedData = useMemo(() => {
    if (!hasRefData && !hasMhmData) return [];

    // Process rainfall data first
    let processedRainfall: {
      timestamp: number;
      datetime: Date;
      rainfall: number;
    }[] = [];
    if (hasRainfallData) {
      processedRainfall = rainfallData.data.map((item) => {
        const ts = new Date(item.t).getTime();
        return {
          timestamp: ts,
          datetime: new Date(ts),
          rainfall: Number(item.rainIn) || 0,
        };
      });
    }

    // Case 1: Only reference data available
    if (!hasMhmData && hasRefData) {
      return refData.data.map((item) => {
        const timestamp = new Date(item.dateTime).getTime();
        const date = new Date(item.dateTime);

        // Find closest rainfall data point
        let closestRainfall = null;
        if (processedRainfall.length > 0) {
          const closest = processedRainfall.reduce((prev, curr) =>
            Math.abs(curr.timestamp - timestamp) <
            Math.abs(prev.timestamp - timestamp)
              ? curr
              : prev
          );
          if (Math.abs(closest.timestamp - timestamp) < 30 * 60 * 1000) {
            // Within 30 minutes
            closestRainfall = closest.rainfall;
          }
        }

        return {
          timestamp: timestamp,
          datetime: date.toLocaleString(),
          shortDateTime: `${date.getMonth() + 1}/${date.getDate()} ${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}`,
          mhmLevel: null,
          refLevel: item.reading,
          rainfall: closestRainfall || 0,
          quality: item.quality,
        };
      });
    }

    // Case 2: Only MHM data available
    if (hasMhmData && !hasRefData) {
      return mhmData.timeSeries.map((item) => {
        const timestamp = item.t * 1000;
        const date = new Date(timestamp);

        // Find closest rainfall data point
        let closestRainfall = null;
        if (processedRainfall.length > 0) {
          const closest = processedRainfall.reduce((prev, curr) =>
            Math.abs(curr.timestamp - timestamp) <
            Math.abs(prev.timestamp - timestamp)
              ? curr
              : prev
          );
          if (Math.abs(closest.timestamp - timestamp) < 30 * 60 * 1000) {
            // Within 30 minutes
            closestRainfall = closest.rainfall;
          }
        }

        return {
          timestamp: timestamp,
          datetime: date.toLocaleString(),
          shortDateTime: `${date.getMonth() + 1}/${date.getDate()} ${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}`,
          mhmLevel: item.levelIn,
          refLevel: null,
          rainfall: closestRainfall || 0,
        };
      });
    }

    // Case 3: Both datasets available - merge them
    const mhmProcessed = mhmData.timeSeries.map((item) => ({
      timestamp: item.t * 1000, // Convert to milliseconds
      datetime: new Date(item.t * 1000),
      mhmLevel: item.levelIn,
    }));

    const refProcessed = refData.data.map((item) => ({
      timestamp: new Date(item.dateTime).getTime(),
      datetime: new Date(item.dateTime),
      refLevel: item.reading,
      quality: item.quality,
    }));

    // Create a combined dataset by merging on closest timestamps
    const combined = [];
    const timeRange = {
      start: Math.max(
        Math.min(...mhmProcessed.map((d) => d.timestamp)),
        Math.min(...refProcessed.map((d) => d.timestamp))
      ),
      end: Math.min(
        Math.max(...mhmProcessed.map((d) => d.timestamp)),
        Math.max(...refProcessed.map((d) => d.timestamp))
      ),
    };

    // Create time intervals (every 15 minutes for better visualization)
    const interval = 15 * 60 * 1000; // 15 minutes in milliseconds

    for (let time = timeRange.start; time <= timeRange.end; time += interval) {
      const date = new Date(time);
      const point = {
        timestamp: time,
        datetime: date.toLocaleString(),
        shortDateTime: `${date.getMonth() + 1}/${date.getDate()} ${date
          .getHours()
          .toString()
          .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        mhmLevel: null,
        refLevel: null,
        rainfall: 0,
      };

      // Find closest MHM reading
      const closestMhm = mhmProcessed.reduce((prev, curr) =>
        Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time)
          ? curr
          : prev
      );
      if (Math.abs(closestMhm.timestamp - time) < 30 * 60 * 1000) {
        // Within 30 minutes
        point.mhmLevel = closestMhm.mhmLevel;
      }

      // Find closest ref reading
      const closestRef = refProcessed.reduce((prev, curr) =>
        Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time)
          ? curr
          : prev
      );
      if (Math.abs(closestRef.timestamp - time) < 30 * 60 * 1000) {
        // Within 30 minutes
        point.refLevel = closestRef.refLevel;
      }

      // Find closest rainfall reading
      if (processedRainfall.length > 0) {
        const closestRain = processedRainfall.reduce((prev, curr) =>
          Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time)
            ? curr
            : prev
        );
        if (Math.abs(closestRain.timestamp - time) < 30 * 60 * 1000) {
          // Within 30 minutes
          point.rainfall = closestRain.rainfall;
        }
      }

      combined.push(point);
    }

    return combined.filter(
      (p) => p.mhmLevel !== null || p.refLevel !== null || (p.rainfall ?? 0) > 0
    );
  }, [mhmData, refData, rainfallData, hasMhmData, hasRefData, hasRainfallData]);

  // Calculate rainfall statistics
  const rainfallStats = useMemo(() => {
    if (!hasRainfallData) return { total: 0, max: 0, nonZeroEvents: 0 };
    const readings = rainfallData.data.map(
      (d: { rainIn: number }) => Number(d.rainIn) || 0
    );
    return {
      total: readings.reduce((s, v) => s + v, 0),
      max: Math.max(...readings),
      nonZeroEvents: readings.filter((v) => v > 0).length,
    };
  }, [hasRainfallData, rainfallData]);

  const chartConfig = {
    mhmLevel: {
      label: `MHM ${site.mhm_id}`,
      color: '#2563eb', // Blue
    },
    refLevel: {
      label: `${site.ref_source} ${site.ref_id}`,
      color: '#dc2626', // Red
    },
    rainfall: {
      label: 'Rainfall',
      color: '#059669', // Green
    },
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-semibold">MH ID: {site.mh_id}</h3>
        <p className="text-sm text-muted-foreground">
          MHM Device: {site.mhm_id} vs {site.ref_source} Reference:{' '}
          {site.ref_id}
        </p>

        {/* Data availability warnings */}
        {!hasMhmData && hasRefData && (
          <div className="mt-2 px-3 py-1 bg-yellow-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800 text-center">
              ⚠️ MHM sensor data not available for selected time range. Showing
              reference data only.
            </p>
          </div>
        )}
        {hasMhmData && !hasRefData && (
          <div className="mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 text-center">
              ⚠️ Reference sensor data not available (
              {refData?.error || 'No data'}). Showing MHM data only.
            </p>
          </div>
        )}

        {/* Rainfall status */}
        {!hasRainfallData && (
          <div className="mt-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-800 text-center">
              ⚠️ No Rainfall data available
            </p>
          </div>
        )}
      </div>
      <ChartContainer config={chartConfig} className="h-[450px] w-full">
        <ComposedChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="shortDateTime"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{
              value: 'Water Level (in.)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            label={{
              value: 'Rainfall (in.)',
              angle: 90,
              position: 'insideRight',
            }}
            domain={[0, (dataMax: number) => Math.max(dataMax || 0, 0.05)]}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            labelFormatter={(v, payload) => {
              // If you want the full timestamp instead of the short label:
              const p0 = Array.isArray(payload) ? payload[0] : undefined;
              const dt = p0?.payload?.datetime ?? v;
              return `Time: ${dt}`;
            }}
            formatter={(value, _name, item) => {
              const key = item?.dataKey; // <- reliable: 'mhmLevel' | 'refLevel' | 'rainfall'
              if (key === 'rainfall') {
                return [`${Number(value ?? 0).toFixed(3)}" `, 'Rainfall'];
              }
              if (key === 'mhmLevel') {
                return [
                  `${Number(value ?? 0).toFixed(2)}" `,
                  chartConfig.mhmLevel.label,
                ];
              }
              if (key === 'refLevel') {
                return [
                  `${Number(value ?? 0).toFixed(2)}" `,
                  chartConfig.refLevel.label,
                ];
              }
              return [String(value ?? ''), String(_name ?? '')];
            }}
          />
          <Legend />

          {/* Water level lines */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mhmLevel"
            stroke={chartConfig.mhmLevel.color}
            strokeWidth={2}
            dot={false}
            name={chartConfig.mhmLevel.label}
            connectNulls={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="refLevel"
            stroke={chartConfig.refLevel.color}
            strokeWidth={2}
            dot={false}
            name={chartConfig.refLevel.label}
            connectNulls={false}
          />

          {/* Rainfall bars */}
          <Bar
            yAxisId="right"
            dataKey="rainfall"
            fill={chartConfig.rainfall.color}
            fillOpacity={0.6}
            name={chartConfig.rainfall.label}
            barSize={5}
          />
        </ComposedChart>
      </ChartContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <div className="font-medium">MHM Device: {site.mhm_id}</div>
          {hasMhmData ? (
            <>
              <div className="text-muted-foreground">
                Last Level: {mhmData.lastWaterLevelIn || 'N/A'} inches
              </div>
              <div className="text-muted-foreground">
                Data Points: {mhmData.timeSeries?.length || 0}
              </div>
              {mhmData.lastFillPercent !== null && (
                <div className="text-muted-foreground">
                  Fill: {mhmData.lastFillPercent}%
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground text-xs">
              No data available
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="font-medium">
            {site.ref_source}: {site.ref_id}
          </div>
          {hasRefData ? (
            <>
              <div className="text-muted-foreground">
                Location ID: {site.ref_locId}
              </div>
              <div className="text-muted-foreground">
                Data Points: {refData.data?.length || 0}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-xs">
              {refData?.error || 'No data available'}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="font-medium">Rainfall Data</div>
          {hasRainfallData ? (
            <>
              <div className="text-muted-foreground">
                Total: {rainfallStats.total.toFixed(3)}"
              </div>
              <div className="text-muted-foreground">
                Max: {rainfallStats.max.toFixed(3)}"
              </div>
              <div className="text-muted-foreground">
                Events: {rainfallStats.nonZeroEvents}
              </div>
              <div className="text-muted-foreground">
                Data Points: {rainfallData.data.length}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-xs">
              No rainfall data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
