'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (color = 'blue') => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const blueIcon = createCustomIcon('blue');
const greenIcon = createCustomIcon('green');
const redIcon = createCustomIcon('red');

export default function MapView({ sites = [], onSiteClick = null }) {
  // Default position (center of your sites area)
  const defaultPosition = [37.8869, -122.2982];

  // Calculate bounds and center to fit all sites
  const mapSettings = useMemo(() => {
    if (sites.length === 0) {
      return {
        center: defaultPosition,
        zoom: 13,
        bounds: null,
      };
    }

    // Calculate bounding box
    const lats = sites.map((site) => site.coordinates[0]);
    const lngs = sites.map((site) => site.coordinates[1]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add padding to the bounds (10% on each side)
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    return {
      center: [(minLat + maxLat) / 2, (minLng + maxLng) / 2],
      zoom: 12, // This will be overridden by bounds
      bounds: [
        [minLat - latPadding, minLng - lngPadding], // Southwest
        [maxLat + latPadding, maxLng + lngPadding], // Northeast
      ],
    };
  }, [sites]);

  // Get icon based on site data availability or status
  const getSiteIcon = (site) => {
    // You can customize this logic based on your needs
    if (site.ref_source === 'EBMUD') return redIcon; // EBMUD sites might not have data
    if (site.ref_source === 'ADS') return greenIcon; // ADS sites have reference data
    return blueIcon; // Default
  };

  return (
    <MapContainer
      center={mapSettings.center}
      zoom={mapSettings.zoom}
      bounds={mapSettings.bounds}
      className="h-96 w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sites.map((site) => (
        <Marker
          key={site.id}
          position={site.coordinates}
          icon={getSiteIcon(site)}
        >
          <Popup className="font-sans">
            <div className="min-w-[200px] p-2">
              <div className="font-semibold text-lg mb-2 text-gray-800">
                MH Site {site.mh_id}
              </div>

              <div className="space-y-1 text-sm">
                {/* <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">MH ID:</span>
                  <span className="text-gray-800">{site.mh_id}</span>
                </div> */}

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">MHM ID:</span>
                  <span className="text-gray-800">{site.mhm_id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">Reference:</span>
                  <span className="text-gray-800">{site.ref_id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">Ref. Source:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      site.ref_source === 'ADS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {site.ref_source}
                  </span>
                </div>

                {/* <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">
                    Location ID:
                  </span>
                  <span className="text-gray-800">{site.ref_locId}</span>
                </div> */}

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">Location:</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${site.coordinates[0]},${site.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    Google Maps Link
                  </a>
                </div>
              </div>

              {onSiteClick && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => onSiteClick(site)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
