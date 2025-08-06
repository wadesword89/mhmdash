'use client';

import { useMemo } from 'react';
// import type { ManholeSite, SummaryStats } from '../types';

// Mock data with Albany, CA area coordinates
const mockManholes = [
  {
    siteId: 'MH-001',
    siteName: 'San Pablo Ave & Solano Ave',
    manholeMetrics: {
      id: 'MM-951',
      currentLevel: 14.1,
      fillPercentage: 23,
      status: 'normal',
    },
    referenceLevel: {
      id: 'ADS-851',
      type: 'ADS',
      currentLevel: 13.8,
      fillPercentage: 22,
      status: 'normal',
    },
    alerts: ['High Level'],
    lat: 37.8869,
    lng: -122.2982,
  },
  {
    siteId: 'MH-002',
    siteName: 'Marin Ave & The Alameda',
    manholeMetrics: {
      id: 'MM-952',
      currentLevel: 8.3,
      fillPercentage: 45,
      status: 'normal',
    },
    referenceLevel: {
      id: 'LMS-852',
      type: 'LMS',
      currentLevel: 9.1,
      fillPercentage: 48,
      status: 'normal',
    },
    alerts: [],
    lat: 37.8919,
    lng: -122.3012,
  },
  {
    siteId: 'MH-003',
    siteName: 'Buchanan St & Washington Ave',
    manholeMetrics: {
      id: 'MM-953',
      currentLevel: 22.7,
      fillPercentage: 78,
      status: 'warning',
    },
    referenceLevel: {
      id: 'ADS-853',
      type: 'ADS',
      currentLevel: 21.9,
      fillPercentage: 75,
      status: 'warning',
    },
    alerts: ['Battery Low', 'Communication Error'],
    lat: 37.8819,
    lng: -122.2952,
  },
  {
    siteId: 'MH-004',
    siteName: 'Masonic Ave & Brighton Ave',
    manholeMetrics: {
      id: 'MM-954',
      currentLevel: 5.2,
      fillPercentage: 12,
      status: 'normal',
    },
    referenceLevel: {
      id: 'LMS-854',
      type: 'LMS',
      currentLevel: 4.8,
      fillPercentage: 11,
      status: 'normal',
    },
    alerts: [],
    lat: 37.8769,
    lng: -122.3082,
  },
  {
    siteId: 'MH-005',
    siteName: 'Cerrito Creek & Eastshore Fwy',
    manholeMetrics: {
      id: 'MM-955',
      currentLevel: 18.9,
      fillPercentage: 67,
      status: 'normal',
    },
    referenceLevel: {
      id: 'ADS-855',
      type: 'ADS',
      currentLevel: 19.3,
      fillPercentage: 69,
      status: 'normal',
    },
    alerts: ['Maintenance Due'],
    lat: 37.8969,
    lng: -122.3132,
  },
  {
    siteId: 'MH-006',
    siteName: 'Albany Hill Park',
    manholeMetrics: {
      id: 'MM-956',
      currentLevel: 12.4,
      fillPercentage: 35,
      status: 'normal',
    },
    referenceLevel: {
      id: 'LMS-856',
      type: 'LMS',
      currentLevel: 11.8,
      fillPercentage: 33,
      status: 'normal',
    },
    alerts: [],
    lat: 37.8889,
    lng: -122.2892,
  },
];

export const useDashboardData = () => {
  // Summary statistics
  const summaryStats = useMemo(
    () => ({
      manholesSites: mockManholes.length,
      manholeMetricsSensors: mockManholes.length,
      referenceSensors: mockManholes.length,
      batteryOK: mockManholes.filter(
        (site) => !site.alerts.some((a) => a.includes('Battery'))
      ).length,
      telemetryDevices: mockManholes.length * 2,
    }),
    []
  );

  return {
    sites: mockManholes,
    summaryStats,
  };
};
