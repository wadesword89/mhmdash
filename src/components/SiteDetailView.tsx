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
  const [refData, setRefData] = useState(null);
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

  const fetchSiteData = async (site, startTime, endTime) => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/py/site_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site,

          startTime,
          endTime,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      // console.log('site_data response:', data);

      setMhmData(data.mhm);
      setRefData(data.ref);
    } catch (e) {
      console.error('site_data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData(site, startTime, endTime);
  }, [site, startTime, endTime]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200 shadow-sm bg-gray-100/70">
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
              ) : mhmData || refData ? (
                <DepthChart site={site} data={{ mhmData, refData }} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Data Could Not Be Loaded
                </div>
              )}
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
};
