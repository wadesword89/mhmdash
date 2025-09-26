'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
const violetIcon = createCustomIcon('violet');
const redIcon = createCustomIcon('red');

// Legend component
function Legend() {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: 'topright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create(
        'div',
        'info legend bg-white/80 p-2 rounded-xl shadow-xl'
      );
      div.innerHTML = `
        <div class="text-sm p-2">
          <div class="font-semibold mb-2">Ref. Source:</div>
          <div class="flex items-center mb-1">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" width="20" height="32" />
            <span class="ml-2">ADS</span>
          </div>
          <div class="flex items-center mb-1">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" width="20" height="32" />
            <span class="ml-2">EBMUD</span>
          </div>
          <div class="flex items-center">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" width="20" height="32" />
            <span class="ml-2">Other</span>
          </div>
        </div>
      `;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

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

    const lats = sites.map((site) => site.coordinates[0]);
    const lngs = sites.map((site) => site.coordinates[1]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    return {
      center: [(minLat + maxLat) / 2, (minLng + maxLng) / 2],
      zoom: 12,
      bounds: [
        [minLat - latPadding, minLng - lngPadding],
        [maxLat + latPadding, maxLng + lngPadding],
      ],
    };
  }, [sites]);

  const getSiteIcon = (site) => {
    if (site.ref_source === 'EBMUD') return violetIcon;
    if (site.ref_source === 'ADS') return redIcon;
    return blueIcon;
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
              <div className="font-semibold text-lg mb-2 text-gray-800 text-center border rounded-2xl">
                MH Site {site.mh_id}
              </div>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">MHM ID:</span>
                  <span className="text-gray-800">{site.mhm_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">Reference:</span>
                  <span className="text-gray-800">{site.ref_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-600">
                    Ref. Source:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs text-center font-medium ${
                      site.ref_source === 'ADS'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {site.ref_source}
                  </span>
                </div>
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
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200 hover:cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <Legend />
    </MapContainer>
  );
}
