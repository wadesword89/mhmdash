'use client';
import { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function DepthChart({ site, data }) {
  const mhmData = data?.mhmData;
  const refData = data?.refData;
  console.log('DepthChart data:', data);

  const hasMhmData = mhmData?.timeSeries && mhmData.timeSeries.length > 0;
  const hasRefData = refData?.data && refData.data.length > 0;

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

  // Process and merge the datasets
  const processedData = useMemo(() => {
    if (!hasRefData && !hasMhmData) return [];

    // Case 1: Only reference data available
    if (!hasMhmData && hasRefData) {
      return refData.data.map((item) => ({
        timestamp: new Date(item.dateTime).getTime(),
        datetime: new Date(item.dateTime).toLocaleString(),
        shortDateTime: (() => {
          const date = new Date(item.dateTime);
          return `${date.getMonth() + 1}/${date.getDate()} ${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
        })(),
        mhmLevel: null,
        refLevel: item.reading,
        quality: item.quality,
      }));
    }

    // Case 2: Only MHM data available
    if (hasMhmData && !hasRefData) {
      return mhmData.timeSeries.map((item) => ({
        timestamp: item.t * 1000,
        datetime: new Date(item.t * 1000).toLocaleString(),
        shortDateTime: (() => {
          const date = new Date(item.t * 1000);
          return `${date.getMonth() + 1}/${date.getDate()} ${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
        })(),
        mhmLevel: item.levelIn,
        refLevel: null,
      }));
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

      combined.push(point);
    }

    return combined.filter(
      (point) => point.mhmLevel !== null || point.refLevel !== null
    );
  }, [mhmData, refData, hasMhmData, hasRefData]);

  const chartConfig = {
    mhmLevel: {
      label: `MHM ${site.mhm_id} Level (inches)`,
      color: '#2563eb', // Blue
    },
    refLevel: {
      label: `${site.ref_type} ${site.ref_id} Level`,
      color: '#dc2626', // Red
    },
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Sewer Level Comparison - Site {site.mh_id}
        </h3>
        <p className="text-sm text-muted-foreground">
          MHM Device {site.mhm_id} vs {site.ref_type} Reference {site.ref_id}
        </p>
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
      </div>

      <ChartContainer config={chartConfig} className="h-[450px] w-full">
        <LineChart data={processedData}>
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
            tick={{ fontSize: 12 }}
            label={{ value: 'Level', angle: -90, position: 'insideLeft' }}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            labelFormatter={(value) => `Time: ${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="mhmLevel"
            stroke={chartConfig.mhmLevel.color}
            strokeWidth={2}
            dot={false}
            name={chartConfig.mhmLevel.label}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="refLevel"
            stroke={chartConfig.refLevel.color}
            strokeWidth={2}
            dot={false}
            name={chartConfig.refLevel.label}
            connectNulls={false}
          />
        </LineChart>
      </ChartContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="font-medium">MHM Device {site.mhm_id}</div>
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
            {site.ref_type} {site.ref_id}
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
      </div>
    </div>
  );
}
