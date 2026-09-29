"use client";

import React, { useEffect, useState } from "react";
import { Navigation, MapPin, Store, Bike, Compass, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapMarkerData {
  id: string;
  type: "pharmacy" | "customer" | "destination" | "rider";
  location: MapCoordinates;
  title: string;
  subtitle?: string;
  status?: "online" | "offline" | "busy" | string;
  details?: Record<string, any>;
}

export interface PlatinoGoogleMapProps {
  center?: MapCoordinates;
  zoom?: number;
  markers?: MapMarkerData[];
  polylinePoints?: MapCoordinates[];
  interactivePin?: boolean;
  onPinChange?: (coords: MapCoordinates) => void;
  onMarkerSelect?: (marker: MapMarkerData) => void;
  className?: string;
  height?: string;
}

export function PlatinoGoogleMap({
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 14,
  markers = [],
  height = "100%",
}: PlatinoGoogleMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);
  const [activeCenter, setActiveCenter] = useState<MapCoordinates>(center);

  useEffect(() => {
    setActiveCenter(center);
  }, [center.lat, center.lng]);

  const googleMapsUrl = `https://maps.google.com/maps?q=${activeCenter.lat},${activeCenter.lng}&z=${zoom}&output=embed`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-card border border-border flex flex-col" style={{ height }}>
      <div className="relative flex-1 w-full h-full min-h-[300px] overflow-hidden bg-muted">
        <iframe
          title="Platino Admin Operations Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={googleMapsUrl}
          className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90 transition-all duration-300"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10 pointer-events-none">
          {markers.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMarker(m)}
              className={cn(
                "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur border text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer text-white",
                m.type === "pharmacy" ? "bg-emerald-600 border-emerald-400/40" : "bg-blue-600 border-blue-400/40"
              )}
            >
              {m.type === "pharmacy" ? <Store className="w-3.5 h-3.5 shrink-0" /> : <MapPin className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate max-w-[120px]">{m.title}</span>
            </button>
          ))}
        </div>

        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl z-30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {selectedMarker.type}
                </span>
                <h4 className="font-display font-bold text-sm text-foreground truncate">
                  {selectedMarker.title}
                </h4>
                {selectedMarker.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{selectedMarker.subtitle}</p>
                )}
              </div>
              <button onClick={() => setSelectedMarker(null)} className="p-1 text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {selectedMarker.details && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedMarker.details).map(([key, val]) => (
                  <div key={key} className="p-2 rounded-xl bg-surface border border-border">
                    <span className="text-[10px] text-muted-foreground block capitalize">{key}</span>
                    <span className="font-bold text-foreground truncate block">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-md px-3 py-1 rounded-xl border border-border text-[11px] font-mono text-muted-foreground shadow-sm pointer-events-none">
          GPS: {activeCenter.lat.toFixed(4)}, {activeCenter.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
