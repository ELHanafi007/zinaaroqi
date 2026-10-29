"use client";

/* Leaflet is loaded from its CDN at runtime and has no local TypeScript package. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { mapCoordinates } from "@/lib/map-coordinates";

const DEFAULT_CENTER: [number, number] = [27.1536, -13.2033];

type Props = { value: string; onChange: (url: string) => void };

export function LocationPicker({ value, onChange }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(() => mapCoordinates(value));

  useEffect(() => {
    const linkId = "leaflet-picker-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const init = () => {
      if (!elementRef.current || mapRef.current || !(window as any).L) return;
      const L = (window as any).L;
      const center = coordinates || DEFAULT_CENTER;
      const map = L.map(elementRef.current, { zoomControl: true }).setView(center, coordinates ? 16 : 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const marker = L.marker(center, { draggable: true }).addTo(map);
      markerRef.current = marker;
      mapRef.current = map;

      const savePoint = (lat: number, lng: number) => {
        const point: [number, number] = [Number(lat.toFixed(7)), Number(lng.toFixed(7))];
        setCoordinates(point);
        onChange(`https://maps.google.com/?q=${point[0]},${point[1]}`);
      };
      map.on("click", (event: any) => {
        marker.setLatLng(event.latlng);
        savePoint(event.latlng.lat, event.latlng.lng);
      });
      marker.on("dragend", () => {
        const point = marker.getLatLng();
        savePoint(point.lat, point.lng);
      });
      setTimeout(() => map.invalidateSize(), 100);
    };

    if ((window as any).L) init();
    else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is intentionally initialized once per form mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next = mapCoordinates(value);
    if (!next || !markerRef.current || !mapRef.current) return;
    markerRef.current.setLatLng(next);
    mapRef.current.setView(next, Math.max(mapRef.current.getZoom(), 16));
    setCoordinates(next);
  }, [value]);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-stone-50">
      <div ref={elementRef} className="h-64 w-full" aria-label="Select exact property location on map" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 bg-white px-3 py-2 text-xs text-ink-500">
        <span>{coordinates ? `Pinned: ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}` : "Click the map or drag the pin to set the exact location"}</span>
        {coordinates && <button type="button" className="font-semibold text-rust-500 hover:underline" onClick={() => { setCoordinates(null); onChange(""); }}>Clear pin</button>}
      </div>
    </div>
  );
}
