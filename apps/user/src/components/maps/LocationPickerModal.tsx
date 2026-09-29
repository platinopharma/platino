"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Navigation, Crosshair, Check, AlertTriangle, X, ShieldCheck } from "lucide-react";
import { PlatinoGoogleMap, MapCoordinates } from "./PlatinoGoogleMap";
import { defaultLocationProvider, LocationPrediction } from "@/services/locationProvider";
import { cn } from "@/lib/utils";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (addressData: {
    formattedAddress: string;
    addressLine1: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    lat: number;
    lng: number;
    serviceable: boolean;
  }) => void;
}

export function LocationPickerModal({ isOpen, onClose, onSelectAddress }: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<LocationPrediction[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<MapCoordinates>({ lat: 17.385, lng: 78.4867 });
  const [formattedAddress, setFormattedAddress] = useState("Madhapur, Hyderabad, Telangana");
  const [landmark, setLandmark] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isServiceable, setIsServiceable] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  // Handle Autocomplete Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setPredictions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await defaultLocationProvider.searchPlaces(searchQuery);
      setPredictions(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reverse geocode when coordinates change
  const handleCoordsChange = async (coords: MapCoordinates) => {
    setSelectedCoords(coords);
    try {
      const res = await fetch("/api/v1/maps/geocode/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormattedAddress(data.formattedAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      }
    } catch (e) {
      // Fallback
    }

    // Verify serviceability
    checkServiceability(coords);
  };

  const checkServiceability = async (coords: MapCoordinates) => {
    try {
      const res = await fetch("/api/customer/v1/delivery/serviceability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsServiceable(data.serviceable);
      }
    } catch (e) {
      setIsServiceable(true);
    }
  };

  // Browser GPS auto-detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        await handleCoordsChange(coords);
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        alert("Unable to detect current GPS location. Please search address or select on map.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPrediction = async (prediction: LocationPrediction) => {
    setSearchQuery(prediction.fullText);
    setPredictions([]);
    const details = await defaultLocationProvider.getPlaceDetails(prediction.id);
    if (details?.coordinates) {
      await handleCoordsChange(details.coordinates);
    }
  };

  const handleConfirmAddress = () => {
    onSelectAddress({
      formattedAddress,
      addressLine1: formattedAddress.split(",")[0] || formattedAddress,
      landmark,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      serviceable: isServiceable,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 transition-all duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full sm:h-[90vh] max-w-4xl bg-card rounded-none sm:rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-foreground">
                Select Delivery Location
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter address or select exact location on map
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-accent hover:bg-accent/80 text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Search Bar & GPS Auto-Detect Button ── */}
        <div className="p-4 border-b border-border bg-surface/50 space-y-3 z-20">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, apartment, street or landmark..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
            />
            {/* Predictions Dropdown */}
            {predictions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-border">
                {predictions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPrediction(p)}
                    className="w-full p-3 text-left hover:bg-accent flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">{p.primaryText}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{p.secondaryText}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleDetectCurrentLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs hover:bg-primary/20 transition-all cursor-pointer"
          >
            <Crosshair className={cn("w-4 h-4", isDetecting && "animate-spin")} />
            {isDetecting ? "Detecting GPS location..." : "Use Current Location (GPS)"}
          </button>
        </div>

        {/* ── Interactive Map & Address Form Body ── */}
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 w-full h-full min-h-[250px]">
            <PlatinoGoogleMap
              center={selectedCoords}
              interactivePin={true}
              markers={[
                {
                  id: "dest_pin",
                  type: "destination",
                  location: selectedCoords,
                  title: "Selected Destination",
                  subtitle: formattedAddress,
                },
              ]}
              height="100%"
            />
          </div>

          {/* Sidebar Info & Confirmation */}
          <div className="w-full md:w-80 bg-card border-t md:border-t-0 md:border-l border-border p-5 flex flex-col justify-between gap-4 overflow-y-auto shrink-0">
            <div className="space-y-4">
              {/* Serviceability Banner */}
              {isServiceable ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Instant 30-min Delivery Serviceable
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Outside Instant Zone</span>
                    Delivery time may be slightly higher for this location.
                  </div>
                </div>
              )}

              {/* Selected Address Display */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Selected Address
                </label>
                <div className="p-3 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold leading-relaxed">
                  {formattedAddress}
                </div>
              </div>

              {/* Landmark Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Landmark / Flat / House No. (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Flat 402, Near Cyber Towers"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmAddress}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Confirm & Save Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
