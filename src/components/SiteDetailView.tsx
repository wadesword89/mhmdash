'use client';

import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useEffect } from 'react';
import { sites } from '@/lib/sites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SiteDetailView = ({ site, onClose }) => {
  // State to hold MHM data
  const [mhmData, setMhmData] = useState(null);
  const base =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000'
      : process.env.NEXT_PUBLIC_BACKEND_BASE;

  // Calculate default dates for last 24 hours
  const { startTime, endTime } = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Format as YYYY-MM-DD
    const format = (d) => d.toISOString().slice(0, 10);

    return {
      startTime: format(yesterday),
      endTime: format(today),
    };
  }, []);

  // console.log('site:', site);
  // console.log('startTime:', startTime);
  // console.log('endTime:', endTime);

  // Fetch data from MHM Api for the selected site and date range
  useEffect(() => {
    const fetchMhmLevel = async () => {
      try {
        const mhmRes = await fetch(`${base}/api/py/mhm_level`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startTime,
            endTime,
            deviceId: site.mhm_id,
          }),
        });
        const data = await mhmRes.json();
        setMhmData(data);
        console.log('MHM Data:', data);
      } catch (error) {
        console.error('Error fetching MHM level:', error);
      }
    };

    fetchMhmLevel();
  }, [base, startTime, endTime, site.mhm_id]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 shadow-sm bg-gray-100/30">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600 mt-4">MH ID:</p>
            <h2 className="text-xl font-semibold text-gray-900">
              {site.mh_id}
            </h2>
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
          {/* Date Time Pickers */}
          <Card>
            <CardHeader>
              <CardTitle className="">Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="start-date" className="text-sm">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    defaultValue={startTime}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    defaultValue={endTime}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Chart Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="">Sensor Level Comparison</CardTitle>
            </CardHeader>
            <CardContent>{mhmData?.deviceId}</CardContent>
          </Card>

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
                  <p className="text-xs text-gray-500">ID: {site.mhm_id}</p>
                  <p className="text-lg font-bold">MHM Level here</p>
                  <p className="text-xs text-gray-500">MHM Fill%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-600">
                  Reference ({site.ref_type})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">ID: {site.ref_id}</p>
                  <p className="text-lg font-bold">Ref Level here</p>
                  <p className="text-xs text-gray-500">ref fill% full</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
