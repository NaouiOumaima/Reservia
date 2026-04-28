// components/map/Map.tsx

'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Service } from '@/lib/api';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapProps {
  services: Service[];
  center?: { lat: number; lng: number };
  onServiceClick?: (service: Service) => void;
}

export default function Map({ services, center, onServiceClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const defaultCenter: [number, number] = center 
      ? [center.lng, center.lat]
      : [10.1815, 36.8065]; // Centre Tunisie

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) map.current.remove();
    };
  }, [center]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each service
    services.forEach((service) => {
      const [lng, lat] = service.location.coordinates;
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-gray-900">${service.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${service.location.address}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-yellow-500">⭐</span>
<span class="text-sm font-semibold">${(service.rating ?? 0).toFixed(1)}</span>            <span class="text-gray-400">(${service.reviewCount} avis)</span>
          </div>
          <p class="text-lg font-bold text-blue-600 mt-2">${service.price} DT</p>
        </div>
      `);

      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      if (onServiceClick) {
        marker.getElement().addEventListener('click', () => onServiceClick(service));
      }

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (services.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      services.forEach(service => {
        const [lng, lat] = service.location.coordinates;
        bounds.extend([lng, lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [services, onServiceClick]);

  return <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />;
}