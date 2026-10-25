import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Geographic Coordinates Knowledge Base (focused on Sangli District, Talukas, and Maharashtra)
export const GEO_COORDINATES = {
  // Sangli District & Talukas
  'sangli': { lat: 16.8524, lon: 74.5815, zoom: 11, nameMr: 'सांगली' },
  'सांगली': { lat: 16.8524, lon: 74.5815, zoom: 11, nameMr: 'सांगली' },
  'miraj': { lat: 16.8273, lon: 74.6468, zoom: 13, nameMr: 'मिरज' },
  'मिरज': { lat: 16.8273, lon: 74.6468, zoom: 13, nameMr: 'मिरज' },
  'walwa': { lat: 17.0543, lon: 74.2625, zoom: 13, nameMr: 'वाळवा' },
  'वाळवा': { lat: 17.0543, lon: 74.2625, zoom: 13, nameMr: 'वाळवा' },
  'islampur': { lat: 17.0543, lon: 74.2625, zoom: 13, nameMr: 'इस्लामपूर' },
  'इस्लामपूर': { lat: 17.0543, lon: 74.2625, zoom: 13, nameMr: 'इस्लामपूर' },
  'tasgaon': { lat: 17.0345, lon: 74.6015, zoom: 13, nameMr: 'तासगाव' },
  'तासगाव': { lat: 17.0345, lon: 74.6015, zoom: 13, nameMr: 'तासगाव' },
  'shirala': { lat: 16.9839, lon: 74.1278, zoom: 13, nameMr: 'शिराळा' },
  'शिराळा': { lat: 16.9839, lon: 74.1278, zoom: 13, nameMr: 'शिराळा' },
  'khanapur': { lat: 17.2721, lon: 74.5376, zoom: 13, nameMr: 'खानापूर' },
  'खानापूर': { lat: 17.2721, lon: 74.5376, zoom: 13, nameMr: 'खानापूर' },
  'vita': { lat: 17.2721, lon: 74.5376, zoom: 13, nameMr: 'विटा' },
  'विटा': { lat: 17.2721, lon: 74.5376, zoom: 13, nameMr: 'विटा' },
  'atpadi': { lat: 17.4208, lon: 74.9538, zoom: 13, nameMr: 'आटपाडी' },
  'आटपाडी': { lat: 17.4208, lon: 74.9538, zoom: 13, nameMr: 'आटपाडी' },
  'jat': { lat: 17.0450, lon: 75.3262, zoom: 13, nameMr: 'जत' },
  'जत': { lat: 17.0450, lon: 75.3262, zoom: 13, nameMr: 'जत' },
  'kavathe mahankal': { lat: 16.9944, lon: 74.8722, zoom: 13, nameMr: 'कवठे महांकाळ' },
  'कवठे महांकाळ': { lat: 16.9944, lon: 74.8722, zoom: 13, nameMr: 'कवठे महांकाळ' },
  'kadegaon': { lat: 17.2974, lon: 74.3312, zoom: 13, nameMr: 'कडेगाव' },
  'कडेगाव': { lat: 17.2974, lon: 74.3312, zoom: 13, nameMr: 'कडेगाव' },
  'palus': { lat: 17.0988, lon: 74.4533, zoom: 13, nameMr: 'पलूस' },
  'पलूस': { lat: 17.0988, lon: 74.4533, zoom: 13, nameMr: 'पलूस' },

  // Major Maharashtra Districts
  'kolhapur': { lat: 16.7050, lon: 74.2433, zoom: 11, nameMr: 'कोल्हापूर' },
  'कोल्हापूर': { lat: 16.7050, lon: 74.2433, zoom: 11, nameMr: 'कोल्हापूर' },
  'satara': { lat: 17.6805, lon: 73.9997, zoom: 11, nameMr: 'सातारा' },
  'सातारा': { lat: 17.6805, lon: 73.9997, zoom: 11, nameMr: 'सातारा' },
  'solapur': { lat: 17.6599, lon: 75.9064, zoom: 11, nameMr: 'सोलापूर' },
  'सोलापूर': { lat: 17.6599, lon: 75.9064, zoom: 11, nameMr: 'सोलापूर' },
  'pune': { lat: 18.5204, lon: 73.8567, zoom: 11, nameMr: 'पुणे' },
  'पुणे': { lat: 18.5204, lon: 73.8567, zoom: 11, nameMr: 'पुणे' },
  'mumbai': { lat: 19.0760, lon: 72.8777, zoom: 11, nameMr: 'मुंबई' },
  'मुंबई': { lat: 19.0760, lon: 72.8777, zoom: 11, nameMr: 'मुंबई' },
  'thane': { lat: 19.2183, lon: 72.9781, zoom: 11, nameMr: 'ठाणे' },
  'nashik': { lat: 19.9975, lon: 73.7898, zoom: 11, nameMr: 'नाशिक' },
  'aurangabad': { lat: 19.8762, lon: 75.3433, zoom: 11, nameMr: 'छत्रपती संभाजीनगर' },
  'ahmednagar': { lat: 19.0948, lon: 74.7480, zoom: 11, nameMr: 'अहिल्यानगर' },
  'ratnagiri': { lat: 16.9902, lon: 73.3120, zoom: 11, nameMr: 'रत्नागिरी' },
  'sindhudurg': { lat: 16.1158, lon: 73.7226, zoom: 11, nameMr: 'सिंधुदुर्ग' },
  'latur': { lat: 18.4088, lon: 76.5604, zoom: 11, nameMr: 'लातूर' },
  'nanded': { lat: 19.1383, lon: 77.3210, zoom: 11, nameMr: 'नांदेड' },
  'nagpur': { lat: 21.1458, lon: 79.0882, zoom: 11, nameMr: 'नागपूर' },
};

export function resolveCoordinates(target) {
  if (!target) return { lat: 16.8524, lon: 74.5815, zoom: 11, title: 'Sangli District', nameMr: 'सांगली' };

  const nameEn = (target.name_en || target.name || '').toLowerCase().trim();
  const nameMr = (target.name_mr || '').trim();
  const distName = (target.district_name || '').toLowerCase().trim();

  // Try exact or partial matches
  for (const [key, val] of Object.entries(GEO_COORDINATES)) {
    if (nameEn.includes(key) || key.includes(nameEn) || (nameMr && nameMr.includes(key))) {
      const zoom = target.type === 'VILLAGE' ? 15 : target.type === 'POLLING_STATION' ? 17 : target.type === 'TALUKA' ? 13 : val.zoom;
      return { lat: val.lat, lon: val.lon, zoom, title: target.name_en || val.nameMr, nameMr: target.name_mr || val.nameMr };
    }
  }

  // Fallback to district if known
  if (distName) {
    for (const [key, val] of Object.entries(GEO_COORDINATES)) {
      if (distName.includes(key)) {
        return { lat: val.lat, lon: val.lon, zoom: 12, title: target.name_en || target.name, nameMr: target.name_mr };
      }
    }
  }

  // Default to Sangli center
  return { lat: 16.8524, lon: 74.5815, zoom: 11, title: target.name_en || 'Sangli District', nameMr: target.name_mr || 'सांगली' };
}

function createPinIcon(type = 'DISTRICT') {
  const iconEmoji = type === 'VILLAGE' ? '🏡' : type === 'TALUKA' ? '📍' : type === 'POLLING_STATION' ? '🎯' : '🏢';
  const bgColor = type === 'VILLAGE' ? '#7c3aed' : type === 'TALUKA' ? '#16a34a' : type === 'POLLING_STATION' ? '#ea580c' : '#2563eb';

  return L.divIcon({
    className: 'interactive-geo-pin',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: ${bgColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.38);
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 19px; line-height: 1; user-select: none;">
          ${iconEmoji}
        </span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36],
  });
}

export default function InteractiveGeographicMap({
  target,
  zoom = 12,
  onZoomChange,
  mapMode = 'roadmap', // 'roadmap' | 'satellite'
  height = '100%',
  language = 'en',
  style = {}
}) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const [internalZoom, setInternalZoom] = useState(zoom);

  const coords = useMemo(() => resolveCoordinates(target), [target]);

  // Keep internal zoom synced with prop if changed externally
  useEffect(() => {
    if (zoom && zoom !== internalZoom) {
      setInternalZoom(zoom);
      if (mapInstanceRef.current && mapInstanceRef.current.getZoom() !== zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [zoom]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: [coords.lat, coords.lon],
        zoom: zoom || coords.zoom || 12,
        zoomControl: false, // We provide modern styled zoom controls
        scrollWheelZoom: true,
        smoothWheelZoom: true,
        attributionControl: false,
      });

      // Track zoom level events
      map.on('zoomend', () => {
        const currentZ = map.getZoom();
        setInternalZoom(currentZ);
        onZoomChange?.(currentZ);
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Apply or switch Tile Layer (Roadmap vs Satellite)
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = mapMode === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = mapMode === 'satellite'
      ? '© Esri Imagery'
      : '© OpenStreetMap contributors';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Marker Update
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const pin = L.marker([coords.lat, coords.lon], {
      icon: createPinIcon(target?.type)
    }).addTo(map);

    const displayName = (language === 'mr' ? (target?.name_mr || coords.nameMr || coords.title) : (target?.name_en || coords.title));
    const targetTypeLabel = target?.type === 'TALUKA' ? (language === 'mr' ? 'तालुका' : 'Taluka')
      : target?.type === 'VILLAGE' ? (language === 'mr' ? 'गाव' : 'Village')
      : target?.type === 'POLLING_STATION' ? (language === 'mr' ? 'मतदान केंद्र' : 'Polling Station')
      : (language === 'mr' ? 'जिल्हा' : 'District');

    pin.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4; color: #1e293b; padding: 2px;">
        <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
          ${displayName}
        </div>
        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">
          ${targetTypeLabel} • महाराष्ट्र
        </div>
        <div style="font-size: 11px; color: #2563eb; font-weight: 600;">
          Lat: ${coords.lat.toFixed(4)}, Lon: ${coords.lon.toFixed(4)}
        </div>
      </div>
    `, { closeButton: false }).openPopup();

    markerRef.current = pin;

    // Smoothly fly / view target
    map.flyTo([coords.lat, coords.lon], zoom || coords.zoom || 12, { duration: 0.8 });

    // Handle resize
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      // Don't destroy on every re-render, unmount handles cleanup
    };
  }, [coords.lat, coords.lon, mapMode]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight: 280,
        background: '#e2e8f0',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Native Leaflet Map Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          zIndex: 1,
          outline: 'none',
        }}
      />
    </div>
  );
}
