'use client';

import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
//   ReferenceLine,
//   Legend,
// } from 'recharts';

import {
  getLevelDifference,
  getLevelStatus,
  getVarianceDescription,
} from '../utils/calculations'; // Import from utils
import { WARNING_LEVEL, CHART_COLORS } from "../constants/constants"

interface SiteDetailViewProps {
  site: ManholeSite;
  timeSeriesData: TimeSeriesData[];
  onClose: () => void;
}

export const SiteDetailView = ({
  site,
  timeSeriesData,
  onClose,
}: SiteDetailViewProps) => {
  const difference = getLevelDifference(site);
  const status = getLevelStatus(difference);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {site.siteId}
            </h2>
            <p className="text-sm text-gray-600 truncate">{site.siteName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Sensor Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-600">
                  Manhole Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    ID: {site.manholeMetrics.id}
                  </p>
                  <p className="text-lg font-bold">
                    {site.manholeMetrics.currentLevel}"
                  </p>
                  <p className="text-xs text-gray-500">
                    {site.manholeMetrics.fillPercentage}% full
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-600">
                  Reference ({site.referenceLevel.type})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    ID: {site.referenceLevel.id}
                  </p>
                  <p className="text-lg font-bold">
                    {site.referenceLevel.currentLevel}"
                  </p>
                  <p className="text-xs text-gray-500">
                    {site.referenceLevel.fillPercentage}% full
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {site.alerts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600">
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {site.alerts.map((alert) => (
                    <Badge
                      key={alert}
                      variant="destructive"
                      className="text-xs"
                    >
                      {alert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date Time Pickers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-sm">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    defaultValue="2024-01-15T00:00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    defaultValue="2024-01-15T16:00"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Manhole Metrics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span>Reference ({site.referenceLevel.type})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>Rainfall</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Chart */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sensor Level Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={10}
                      label={{
                        value: 'Level (inches)',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <ReferenceLine
                      y={WARNING_LEVEL}
                      stroke={CHART_COLORS.WARNING}
                      strokeDasharray="5 5"
                      label={{
                        value: 'Warning (3\'5.5")',
                        position: 'topRight',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="manholeMetrics"
                      stroke={CHART_COLORS.MANHOLE_METRICS}
                      strokeWidth={2}
                      dot={false}
                      name="MM"
                    />
                    <Line
                      type="monotone"
                      dataKey="referenceLevel"
                      stroke={CHART_COLORS.REFERENCE}
                      strokeWidth={2}
                      dot={false}
                      name={`Ref (${site.referenceLevel.type})`}
                    />
                    <Line
                      type="monotone"
                      dataKey="rainfall"
                      stroke={CHART_COLORS.RAINFALL}
                      strokeWidth={2}
                      dot={false}
                      name="Rain"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};
