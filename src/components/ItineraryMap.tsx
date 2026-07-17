"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export type MapStop = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  day: number;
  order: number;
};

const DAY_COLORS = ["#0F6E56", "#993C1D", "#854F0B"];

function colorForDay(day: number): string {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

let loaderPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (!loaderPromise) {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, v: "weekly" });
    loaderPromise = Promise.all([importLibrary("maps"), importLibrary("marker")]).then(
      () => undefined,
    );
  }
  return loaderPromise;
}

export function ItineraryMap({ stops }: { stops: MapStop[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const markers: google.maps.Marker[] = [];

    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current || stops.length === 0) return;

      const bounds = new google.maps.LatLngBounds();
      stops.forEach((stop) => bounds.extend({ lat: stop.lat, lng: stop.lng }));

      const map = new google.maps.Map(containerRef.current, {
        center: bounds.getCenter(),
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
      });

      stops.forEach((stop) => {
        const marker = new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          label: {
            text: String(stop.order),
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "500",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: colorForDay(stop.day),
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 12,
          },
          title: stop.name,
        });
        markers.push(marker);
      });

      if (stops.length > 1) {
        map.fitBounds(bounds, 40);
      } else {
        map.setCenter(bounds.getCenter());
        map.setZoom(14);
      }
    });

    return () => {
      cancelled = true;
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [stops]);

  return <div ref={containerRef} className="h-56 w-full rounded-xl border border-border" />;
}
