'use client';
import { useState } from 'react';
import { Header } from './Header';
import LeafletMap from './MapView';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SiteTable } from './SiteTable';

// Mock time series data
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

export default function Dashboard() {
  const [selectedSite, setSelectedSite] = useState(null);

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 transition-all duration-300 ${
            selectedSite ? 'lg:w-1/2' : 'w-full'
          } overflow-auto`}
        >
          <div className="p-3 sm:p-6 space-y-6">
            <LeafletMap />
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Manhole Sites
                  </CardTitle>
                  <div>SearchAndFilter</div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4 p-4">
                  <div>Site Card (mobile)</div>
                </div>

                {/* Desktop Table View */}
                <SiteTable site={"MH01"} onSiteSelect={handleSiteSelect} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail Panel - Right Side */}
        {selectedSite && (
          <div className="hidden lg:block w-1/2 border-l border-gray-200 bg-white overflow-auto">
            Side Detail View
          </div>
        )}
      </div>

      {/* Mobile Detail Modal */}
      {selectedSite && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-3/4 rounded-t-lg overflow-auto">
            <div>Side Detail View Mobile</div>
          </div>
        </div>
      )}
    </div>
  );
}
