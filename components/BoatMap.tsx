'use client';

import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Boat } from '@/data/boats';
import { PORT_CENTER } from '@/data/boats';

interface BoatMapProps {
  boats: Boat[];
  selectedBoatId?: string | null;
  onSelectBoat?: (id: string) => void;
  height?: number | string;
}

export default function BoatMap({ boats, selectedBoatId, onSelectBoat, height = 480 }: BoatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const onSelectRef = useRef(onSelectBoat);
  onSelectRef.current = onSelectBoat;

  useEffect(() => {
    let cancelled = false;
    let map: any;

    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !containerRef.current) return;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        console.warn('Missing NEXT_PUBLIC_MAPBOX_TOKEN');
        return;
      }
      mapboxgl.accessToken = token;

      const styleUrl =
        process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL ||
        'mapbox://styles/mapbox/streets-v12';

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: PORT_CENTER,
        zoom: 14.5,
        attributionControl: true,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        boats.forEach((b) => {
          const el = document.createElement('button');
          el.type = 'button';
          el.setAttribute('aria-label', `Boat ${b.name}`);
          el.style.cssText = `
            cursor: pointer; border: 0; background: transparent; padding: 0;
            transform: translate(-50%, -100%);
          `;
          el.innerHTML = markerSvg(b.status === 'available' ? '#FF0039' : b.status === 'booked' ? '#9CA3AF' : '#4B5563');

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelectRef.current?.(b.id);
          });

          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([b.lng, b.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 28, closeButton: false }).setHTML(
                `<div style="font-family: system-ui, sans-serif; min-width: 180px;">
                  <div style="font-weight: 600; font-size: 14px;">${escapeHtml(b.name)}</div>
                  <div style="font-size: 12px; color: #6B7280;">${escapeHtml(b.operator)} · ${b.capacity} guests</div>
                  <div style="margin-top: 4px; font-weight: 600; color: #FF0039;">$${b.pricePerDayUsd}/day</div>
                  <div style="font-size: 11px; color: ${b.status === 'available' ? '#10B981' : '#9CA3AF'}; margin-top: 2px; text-transform: capitalize;">${b.status}</div>
                </div>`
              )
            )
            .addTo(map);

          markersRef.current[b.id] = marker;
        });
      });
    })();

    return () => {
      cancelled = true;
      Object.values(markersRef.current).forEach((m: any) => m?.remove?.());
      markersRef.current = {};
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [boats]);

  // Fly to selected boat
  useEffect(() => {
    if (!selectedBoatId || !mapRef.current) return;
    const boat = boats.find((b) => b.id === selectedBoatId);
    if (!boat) return;
    mapRef.current.flyTo({ center: [boat.lng, boat.lat], zoom: 16, speed: 1.2 });
    markersRef.current[selectedBoatId]?.togglePopup?.();
  }, [selectedBoatId, boats]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height, borderRadius: 16, overflow: 'hidden' }}
    />
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

function markerSvg(color: string): string {
  return `<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 24 16 24s16-13 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
    <path d="M13 16l3 -5 3 5z" fill="${color}"/>
  </svg>`;
}
