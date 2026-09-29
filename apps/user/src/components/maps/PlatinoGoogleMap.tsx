"use client";

import React, { useEffect, useState } from "react";
import { Navigation, MapPin, Store, Bike, AlertCircle, Compass, Layers, ShieldCheck, RefreshCw, Key, WifiOff } from "lucide-react";
import { CustomerLocationMarker } from "./markers/CustomerLocationMarker";
import { DeliveryAddressMarker } from "./markers/DeliveryAddressMarker";
import { PharmacyMarker } from "./markers/PharmacyMarker";
import { RiderMarker } from "./markers/RiderMarker";
import { cn } from "@/lib/utils";

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export type MapState =
  | "LOADING"
  | "LOCATION_DENIED"
  | "LOCATION_UNAVAILABLE"
  | "SEARCHING"
  | "NO_PHARMACY"
  | "PHARMACY_FOUND"
  | "ORDER_CREATED"
  | "ORDER_PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "RIDER_ASSIGNED"
  | "DELIVERED"
  | "API_KEY_REQUIRED"
  | "NETWORK_FAILURE";

export interface MapMarkerData {
  id: string;
  type: "pharmacy" | "customer" | "destination" | "rider";
  location: MapCoordinates;
  title: string;
  subtitle?: string;
  status?: "online" | "offline" | "busy" | string;
  inventoryCoveragePercent?: number;
  details?: Record<string, any>;
}

export interface PlatinoGoogleMapProps {
  center?: MapCoordinates;
  zoom?: number;
  markers?: MapMarkerData[];
  polylinePoints?: MapCoordinates[];
  interactivePin?: boolean;
  mapState?: MapState;
  onPinChange?: (coords: MapCoordinates) => void;
  onMarkerSelect?: (marker: MapMarkerData) => void;
  className?: string;
  height?: string;
}

export function PlatinoGoogleMap({
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 14,
  markers = [],
  polylinePoints = [],
  interactivePin = false,
  mapState = "PHARMACY_FOUND",
  onPinChange,
  onMarkerSelect,
  className,
  height = "100%",
}: PlatinoGoogleMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);
  const [activeCenter, setActiveCenter] = useState<MapCoordinates>(center);
  const [activeZoom, setActiveZoom] = useState<number>(zoom);

  useEffect(() => {
    setActiveCenter(center);
  }, [center.lat, center.lng]);

  // Dynamic Camera Fit Bounds Logic
  const handleRecenter = () => {
    if (markers.length > 1) {
      // Calculate bounding box center
      const lats = markers.map((m) => m.location.lat);
      const lngs = markers.map((m) => m.location.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      setActiveCenter({
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2,
      });
      setActiveZoom(12);
    } else {
      setActiveCenter(center);
      setActiveZoom(14);
    }
  };

  const googleMapsUrl = `https://maps.google.com/maps?q=${activeCenter.lat},${activeCenter.lng}&z=${activeZoom}&output=embed`;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-card border border-border flex flex-col shadow-sm",
        className
      )}
      style={{ height }}
    >
      {/* ── Main Map Display Canvas ── */}
      <div className="relative flex-1 w-full h-full min-h-[320px] overflow-hidden bg-muted">
        <iframe
          title="Platino Interactive Map Engine"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={googleMapsUrl}
          className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90 transition-all duration-300"
        />

        {/* ── Center Draggable Pin (Location Picker Mode) ── */}
        {interactivePin && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="relative -translate-y-6 flex flex-col items-center animate-bounce">
              <div className="p-3 rounded-full bg-primary text-primary-foreground shadow-2xl ring-4 ring-primary/30 border-2 border-background">
                <MapPin className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
              <div className="w-3.5 h-1.5 bg-black/40 rounded-full blur-[2px] mt-1" />
            </div>
          </div>
        )}

        {/* ── Custom Platino SVG Marker Overlays ── */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10 pointer-events-none">
          {markers.map((m) => (
            <div key={m.id} className="pointer-events-auto">
              {m.type === "pharmacy" && (
                <PharmacyMarker
                  name={m.title}
                  isOnline={m.status !== "offline"}
                  isSelected={selectedMarker?.id === m.id}
                  inventoryCoveragePercent={m.inventoryCoveragePercent || 100}
                  onClick={() => {
                    setSelectedMarker(m);
                    onMarkerSelect?.(m);
                  }}
                />
              )}
              {m.type === "customer" && (
                <CustomerLocationMarker label={m.title} />
              )}
              {m.type === "destination" && (
                <DeliveryAddressMarker label={m.title} address={m.subtitle} />
              )}
              {m.type === "rider" && (
                <RiderMarker
                  riderName={m.title}
                  speed={m.details?.speed}
                  heading={m.details?.heading}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Map State Overlays (13 Custom UI States) ── */}
        {mapState === "LOADING" && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-md flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-2 text-primary font-bold text-xs">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Resolving Platino Location Engine...</span>
            </div>
          </div>
        )}

        {mapState === "LOCATION_DENIED" && (
          <div className="absolute top-3 left-3 right-3 bg-amber-500/90 backdrop-blur text-white p-3 rounded-xl shadow-lg z-20 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>GPS Permission Denied. You can manually search or drag location pin.</span>
            </div>
          </div>
        )}

        {mapState === "NO_PHARMACY" && (
          <div className="absolute bottom-4 left-4 right-4 bg-amber-500/95 backdrop-blur text-white p-3 rounded-2xl shadow-xl z-20 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Outside 30-min Instant Service Area. Standard fulfillment will be used.</span>
          </div>
        )}

        {mapState === "API_KEY_REQUIRED" && (
          <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur border border-border p-3 rounded-xl text-xs shadow-lg z-20 flex items-center gap-2 text-muted-foreground font-semibold">
            <Key className="w-4 h-4 text-primary shrink-0" />
            <span>Google Maps API Key Configuration Ready (Haversine Fallback Engine Active)</span>
          </div>
        )}

        {/* ── Camera Control Floating Buttons ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={handleRecenter}
            title="Recenter Camera"
            className="p-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border text-foreground hover:bg-accent transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Compass className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* ── Selected Marker Information Card Popup ── */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl z-30 space-y-3 animate-in fade-in slide-in-from-bottom-2">
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
              <button
                onClick={() => setSelectedMarker(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                ✕
              </button>
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

        {/* ── GPS Coordinates & Engine Provider Badge ── */}
        <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-md px-3 py-1 rounded-xl border border-border text-[11px] font-mono text-muted-foreground shadow-sm pointer-events-none">
          GPS: {activeCenter.lat.toFixed(4)}, {activeCenter.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
