'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from './Header';
import { SitesTable } from './SitesTable';
import { SiteDetailView } from './SiteDetailView';
import { Footer } from './Footer';

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
  // console.log('Selected Site:', selectedSite);

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
          <div className="p-6 space-y-6">
            <MapView sites={sites} onSiteClick={handleSiteSelect} />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Manhole Sites</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-3">
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
      <Footer />
    </div>
  );
}
