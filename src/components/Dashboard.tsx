'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from './Header';
import { SitesTable } from './SitesTable';
import { SiteDetailView } from './SiteDetailView';
import { sites } from '@/lib/sites';
import dynamic from 'next/dynamic';
// Dynamically import Leaflet Map with SSR disabled (avoids ReferenceError: window is not defined)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
});

export default function EBMUDDashboard() {
  const [selectedSite, setSelectedSite] = useState(null);

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
  };
  const base =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000'
      : process.env.NEXT_PUBLIC_BACKEND_BASE;

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
            <MapView />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Manhole Sites</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SitesTable
                  onSiteSelect={handleSiteSelect}
                  selectedSiteId={selectedSite?.id}
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
              onClose={() => setSelectedSite(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
