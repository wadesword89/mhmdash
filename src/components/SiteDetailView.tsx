'use client';

import { X, Download, Loader2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useEffect } from 'react';
import { sites } from '@/lib/sites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DepthChart } from './DepthChart';

dayjs.extend(utc); //add UTC (Coordinated Universal Time) support to parse, manipulate, and display dates in UTC format

export const SiteDetailView = ({ site, onClose }) => {
  // State to hold MHM data
  const [mhmData, setMhmData] = useState(null);
  const [prismData, setPrismData] = useState(null);
  const [loading, setLoading] = useState(false);

  const base =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000'
      : process.env.NEXT_PUBLIC_BACKEND_BASE;

  // Initialize startDate and endDate from sessionStorage or default values
  // If no date in sessionStorage, use yesterday as startDate and today as endDate
  const [startDate, setStartDate] = useState(() => {
    const savedDate = sessionStorage.getItem('startDate');
    return savedDate
      ? new Date(savedDate) // create js Date Object
      : dayjs().subtract(1, 'day').toDate(); //if not date in session storage, use yesterday as startDate
  });
  const [endDate, setEndDate] = useState(() => {
    const savedDate = sessionStorage.getItem('endDate');
    return savedDate ? new Date(savedDate) : new Date();
  });

  // Format start and end dates to match the API requirements
  // Create date object, set the start time to the beginning of the day, and end time to the end of the day
  // The format is YYYY-MM-DDTHH:mm:ss, which is the standard ISO 8601 format (but in not UTC)
  const startTime = dayjs(startDate)
    .startOf('day')
    .format('YYYY-MM-DDTHH:mm:ss');

  const endTime = dayjs(endDate)
    .hour(23)
    .minute(59)
    .second(0)
    .format('YYYY-MM-DDTHH:mm:ss');

  // Handle date changes and update sessionStorage
  const handleStartDateChange = (date) => {
    if (date) {
      setStartDate(date);
      sessionStorage.setItem('startDate', date.toISOString()); // convert Date to ISO string for storage
    }
  };
  const handleEndDateChange = (date) => {
    if (date) {
      setEndDate(date);
      sessionStorage.setItem('endDate', date.toISOString());
    }
  };

  // Fetch data from MHM Api for the selected site and date range
  const fetchMhmData = async (startTime, endTime) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch PRISM depth data for the selected location and date range
  const fetchPrismData = async (startTime, endTime) => {
    setLoading(true);
    try {
      const prismRes = await fetch(`${base}/api/py/prism_depth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime,
          endTime,
          locationId: site.ref_locId,
        }),
      });
      const data = await prismRes.json();
      setPrismData(data);
      // console.log('PRISM Data:', data);
    } catch (error) {
      console.error('Error fetching PRISM depth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchMhmData(startTime, endTime);
    if (site.ref_type === 'ADS') {
      fetchPrismData(startTime, endTime);
    }
  }, [base, site.mhm_id, startTime, endTime, site.ref_id]);

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, 'MMM dd, yyyy')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, 'MMM dd, yyyy')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="">Sensor Level Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-gray-600">
                    Loading sensor data...
                  </span>
                </div>
              ) : mhmData || prismData ? (
                <DepthChart data={{ mhmData, prismData }} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Data Could Not Be Loaded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sensor Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="">
                <CardTitle className="text-sm text-blue-600">
                  Manhole Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">ID: {site.mhm_id}</p>
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-bold">
                        {mhmData?.lastWaterLevelIn}"
                      </p>
                      <p className="text-xs text-gray-500">
                        Fill: {mhmData?.lastFillPercent}%
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="">
                <CardTitle className="text-sm text-purple-600">
                  Reference ({site.ref_type})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">ID: {site.ref_id}</p>
                  <p className="text-lg font-bold">Ref Level here</p>
                  {/* <p className="text-xs text-gray-500">Fill: Ref Fill%</p> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
