"use client";

import { useEffect } from "react";
import { X, Navigation, Phone, MapPin, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { formatDistance } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PharmacyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: any;
}

export function PharmacyMapModal({ isOpen, onClose, pharmacy }: PharmacyMapModalProps) {
  // Listen for Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pharmacy) return null;

  const rawLat = pharmacy.lat ?? pharmacy.latitude;
  const rawLng = pharmacy.lng ?? pharmacy.longitude;
  const lat = rawLat != null ? Number(rawLat) : null;
  const lng = rawLng != null ? Number(rawLng) : null;
  const hasValidCoords = lat != null && lng != null && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  const googleMapsUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(pharmacy.name || "Pharmacy")}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([pharmacy.name, pharmacy.address, pharmacy.city].filter(Boolean).join(", "))}`;

  const handleCall = () => {
    if (pharmacy.phone) {
      window.open(`tel:${pharmacy.phone}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 md:p-6 transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pharmacy-map-modal-title"
    >
      <div className="relative w-full h-full sm:h-[92vh] max-w-6xl bg-card rounded-none sm:rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* ── Modal Top Navigation Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-card/95 backdrop-blur z-20">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="pharmacy-map-modal-title"
                  className="font-display font-extrabold text-base sm:text-lg text-foreground truncate"
                >
                  {pharmacy.name || "Local Partnered Chemist"}
                </h2>
                {pharmacy.badges?.includes("verified") && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    <ShieldCheck className="w-3 h-3 text-primary" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {pharmacy.address || `${pharmacy.area || "Madhapur"}, ${pharmacy.city || "Hyderabad"}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close map"
            className="p-2 rounded-full bg-accent hover:bg-accent/80 text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Interactive Map Body & Info Sidebar/Drawer ── */}
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Map Container */}
          <div className="relative flex-1 w-full h-full min-h-[350px] bg-muted overflow-hidden">
            {hasValidCoords ? (
              <>
                <iframe
                  title={`Google Maps location for ${pharmacy.name}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                  className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90 transition-all"
                />

                {/* Floating GPS Badge overlay */}
                <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border text-[11px] font-mono text-muted-foreground shadow-sm pointer-events-none">
                  GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>
              </>
            ) : (
              /* Fallback state when coordinates are unavailable */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-surface">
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Location Unavailable</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Exact map coordinates are currently unavailable for this store, but you can navigate using the full address below.
                </p>
              </div>
            )}
          </div>

          {/* Side Panel (Desktop) / Bottom Sheet Drawer (Mobile) */}
          <div className="w-full md:w-80 lg:w-96 bg-card border-t md:border-t-0 md:border-l border-border p-5 flex flex-col justify-between gap-5 overflow-y-auto max-h-[50vh] md:max-h-none shrink-0 shadow-lg">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Store Details
                </span>
                <h3 className="font-display text-lg font-extrabold text-foreground mt-0.5">
                  {pharmacy.name}
                </h3>
              </div>

              {/* Complete Address */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Store Address
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                  {pharmacy.address || `${pharmacy.area}, ${pharmacy.city}`}
                  {pharmacy.pincode ? ` - ${pharmacy.pincode}` : ""}
                </p>
              </div>

              {/* Distance & Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] text-muted-foreground block font-medium">Distance</span>
                  <span className="text-xs font-bold text-foreground">
                    {pharmacy.distanceKm ? formatDistance(pharmacy.distanceKm) : "Distance unavailable"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] text-muted-foreground block font-medium">Hours</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {pharmacy.hours || "9:00 AM - 10:00 PM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-border">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Directions"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-98"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
              {pharmacy.phone && (
                <button
                  onClick={handleCall}
                  aria-label="Call Pharmacy"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-card border border-border text-foreground font-semibold text-xs hover:bg-accent transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" /> Call {pharmacy.phone}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
