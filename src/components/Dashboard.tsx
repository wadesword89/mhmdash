'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Header } from './Header';
import { SitesTable } from './SitesTable';
import { SiteDetailView } from './SiteDetailView';
import MapView from './MapView';
import dynamic from 'next/dynamic';


const mockTimeSeriesData = [
  { time: '00:00', manholeMetrics: 2.1, referenceLevel: 2.0, rainfall: 0 },
  { time: '02:00', manholeMetrics: 3.2, referenceLevel: 3.1, rainfall: 0.2 },
  { time: '04:00', manholeMetrics: 8.5, referenceLevel: 8.8, rainfall: 1.1 },
  { time: '06:00', manholeMetrics: 14.1, referenceLevel: 13.8, rainfall: 0.8 },
  { time: '08:00', manholeMetrics: 12.3, referenceLevel: 12.7, rainfall: 0.3 },
  { time: '10:00', manholeMetrics: 8.7, referenceLevel: 9.1, rainfall: 0 },
  { time: '12:00', manholeMetrics: 4.2, referenceLevel: 4.5, rainfall: 0 },
  { time: '14:00', manholeMetrics: 1.8, referenceLevel: 2.1, rainfall: 0 },
  { time: '16:00', manholeMetrics: 0.2, referenceLevel: 0.5, rainfall: 0 },
];

// Dynamically import Leaflet Map with SSR disabled (avoids ReferenceError: window is not defined)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
});

export default function EBMUDDashboard() {
  const [selectedSite, setSelectedSite] = useState(null);
  const { sites, summaryStats } = useDashboardData();

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Left Side */}
        <div
          className={`flex-1 transition-all duration-300 ${
            selectedSite ? 'w-1/2' : 'w-full'
          } overflow-auto`}
        >
          <div className="p-6">
            <MapView
            // sites={sites}
            // summaryStats={summaryStats}
            // onSiteSelect={handleSiteSelect}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Manhole Sites</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Desktop Table View */}
                <SitesTable
                  sites={sites}
                  onSiteSelect={handleSiteSelect}
                  selectedSiteId={selectedSite?.siteId}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail Panel - Right Side */}
        {selectedSite && (
          <div className="w-1/2 border-l border-gray-200 bg-white overflow-auto">
            <SiteDetailView
              site={selectedSite}
              timeSeriesData={mockTimeSeriesData}
              onClose={() => setSelectedSite(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
