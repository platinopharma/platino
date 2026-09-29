'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface LocationResult {
  lat: number;
  lng: number;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formattedAddress?: string;
  placeId?: string;
}

export interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: LocationResult) => void;
  title?: string;
  subtitle?: string;
}

export type MapProvider = 'GOOGLE' | 'SATELLITE';

interface SearchPrediction {
  id: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

export const googleMapsDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b687a" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b687a" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c4595" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d96" }] },
];

export function LocationPicker({
  initialLat = 17.3850,
  initialLng = 78.4867,
  onLocationSelect,
  title = "Pharmacy Storefront Location Picker",
  subtitle = "Search your pharmacy address, then fine-tune the pin directly over your store entrance.",
}: LocationPickerProps) {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [zoomLevel, setZoomLevel] = useState(16);
  const [provider, setProvider] = useState<MapProvider>('GOOGLE');

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<SearchPrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);

  const [loadingReverse, setLoadingReverse] = useState(false);
  const [previewAddress, setPreviewAddress] = useState<string>("Position pin on map");
  const [previewDetails, setPreviewDetails] = useState<{ city?: string; state?: string; pincode?: string }>({});

  const [gpsConfirmOpen, setGpsConfirmOpen] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

  // Dynamic Google Maps JS Loader
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = "google-maps-js-sdk";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = () => console.warn("Google Maps SDK script failed to load. Operating in high-reliability mode.");
    document.head.appendChild(script);
  }, [apiKey]);

  // Sync state if initial coordinates change
  useEffect(() => {
    if (initialLat && initialLng && (initialLat !== lat || initialLng !== lng)) {
      setLat(initialLat);
      setLng(initialLng);
    }
  }, [initialLat, initialLng]);

  // Theme observer for dark mode map styles
  const applyThemeStyle = useCallback((map: any) => {
    if (!map) return;
    const isDark =
      typeof document !== "undefined" &&
      (document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    map.setOptions({
      styles: isDark && provider === "GOOGLE" ? googleMapsDarkStyle : [],
    });
  }, [provider]);

  // Google Maps JS Canvas initialization
  useEffect(() => {
    if (googleMapsLoaded && mapContainerRef.current && (window as any).google?.maps) {
      try {
        const google = (window as any).google;
        const isDark =
          typeof document !== "undefined" &&
          (document.documentElement.classList.contains("dark") ||
            window.matchMedia("(prefers-color-scheme: dark)").matches);

        const mapOptions = {
          center: { lat, lng },
          zoom: zoomLevel,
          mapTypeId: provider === 'SATELLITE' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
          styles: isDark && provider === 'GOOGLE' ? googleMapsDarkStyle : [],
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: "greedy",
        };

        if (!mapInstanceRef.current) {
          const map = new google.maps.Map(mapContainerRef.current, mapOptions);
          mapInstanceRef.current = map;

          map.addListener("idle", () => {
            const center = map.getCenter();
            if (center) {
              const newLat = Number(center.lat().toFixed(6));
              const newLng = Number(center.lng().toFixed(6));
              setLat(newLat);
              setLng(newLng);
              triggerReverseGeocode(newLat, newLng);
            }
          });
        } else {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setMapTypeId(
            provider === 'SATELLITE' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
          );
          applyThemeStyle(mapInstanceRef.current);
        }
      } catch (err) {
        console.warn("Google Maps canvas initialization error:", err);
      }
    }
  }, [googleMapsLoaded, provider, applyThemeStyle]);

  // Debounced reverse geocoding using Google Geocoder API
  const triggerReverseGeocode = useCallback(async (newLat: number, newLng: number) => {
    setLoadingReverse(true);
    try {
      if ((window as any).google?.maps?.Geocoder) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any[], status: string) => {
          if (status === "OK" && results && results[0]) {
            const res = results[0];
            const components = res.address_components || [];
            let streetNumber = "";
            let route = "";
            let city = "";
            let state = "";
            let pincode = "";

            for (const c of components) {
              const types: string[] = c.types || [];
              if (types.includes("street_number")) streetNumber = c.long_name;
              if (types.includes("route")) route = c.long_name;
              if (types.includes("locality") || types.includes("sublocality")) city = c.long_name;
              if (types.includes("administrative_area_level_1")) state = c.long_name;
              if (types.includes("postal_code")) pincode = c.long_name;
            }

            const line1 = [streetNumber, route].filter(Boolean).join(" ") || res.formatted_address.split(",")[0] || "Selected Location";
            setPreviewAddress(line1);
            setPreviewDetails({ city, state, pincode });

            onLocationSelect({
              lat: newLat,
              lng: newLng,
              addressLine1: line1,
              city,
              state,
              pincode,
              formattedAddress: res.formatted_address,
              placeId: res.place_id,
            });
            setLoadingReverse(false);
            return;
          }
        });
      }

      // Edge API Geocode Proxy Fallback
      const res = await fetch(`/api/geocode?lat=${newLat}&lng=${newLng}`);
      if (res.ok) {
        const data = await res.json();
        const line1 = data.formattedAddress?.split(",")[0] || data.route || "Selected Storefront";
        setPreviewAddress(line1);
        setPreviewDetails({
          city: data.locality || "",
          state: data.administrativeAreaLevel1 || "",
          pincode: data.postalCode || "",
        });

        onLocationSelect({
          lat: newLat,
          lng: newLng,
          addressLine1: line1,
          city: data.locality,
          state: data.administrativeAreaLevel1,
          pincode: data.postalCode,
          formattedAddress: data.formattedAddress,
        });
      }
    } catch (err) {
      console.warn("Reverse geocode error:", err);
      onLocationSelect({ lat: newLat, lng: newLng });
    } finally {
      setLoadingReverse(false);
    }
  }, [onLocationSelect]);

  const updateCoords = (newLat: number, newLng: number) => {
    const cleanLat = Number(newLat.toFixed(6));
    const cleanLng = Number(newLng.toFixed(6));
    setLat(cleanLat);
    setLng(cleanLng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: cleanLat, lng: cleanLng });
    }
    triggerReverseGeocode(cleanLat, cleanLng);
  };

  // Google Places Autocomplete search (India restricted)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        if ((window as any).google?.maps?.places?.AutocompleteService) {
          const service = new (window as any).google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            { input: searchQuery, componentRestrictions: { country: "in" } },
            (results: any[], status: string) => {
              if (status === "OK" && Array.isArray(results)) {
                setPredictions(
                  results.map((r) => ({
                    id: r.place_id,
                    primaryText: r.structured_formatting?.main_text || r.description.split(",")[0],
                    secondaryText: r.structured_formatting?.secondary_text || "",
                    fullText: r.description,
                  }))
                );
                setShowPredictions(true);
              } else {
                setPredictions([]);
              }
              setIsSearching(false);
            }
          );
          return;
        }

        // Edge API Proxy Fallback
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPredictions(
              data.map((item: any) => ({
                id: item.id || item.place_id || String(Math.random()),
                primaryText: item.primaryText || item.formattedAddress?.split(",")[0] || searchQuery,
                secondaryText: item.secondaryText || item.formattedAddress || "",
                fullText: item.formattedAddress || searchQuery,
              }))
            );
            setShowPredictions(true);
          }
        }
      } catch (e) {
        console.warn("Places search error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPrediction = (item: SearchPrediction) => {
    setSearchQuery("");
    setShowPredictions(false);

    if ((window as any).google?.maps?.places?.PlacesService) {
      try {
        const dummyDiv = document.createElement("div");
        const service = new (window as any).google.maps.places.PlacesService(dummyDiv);
        service.getDetails({ placeId: item.id, fields: ["geometry", "formatted_address", "address_components"] }, (place: any, status: string) => {
          if (status === "OK" && place?.geometry?.location) {
            const itemLat = place.geometry.location.lat();
            const itemLng = place.geometry.location.lng();
            updateCoords(itemLat, itemLng);
            toast.success(`Positioned at ${item.primaryText}`);
          }
        });
        return;
      } catch (err) {
        console.warn("Place details error:", err);
      }
    }

    toast.info(`Positioning at ${item.primaryText}`);
  };

  const handleConfirmGps = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      setGpsConfirmOpen(false);
      return;
    }

    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateCoords(latitude, longitude);
        setLoadingGps(false);
        setGpsConfirmOpen(false);
        toast.success("Positioned using device location.");
      },
      (err) => {
        setLoadingGps(false);
        setGpsConfirmOpen(false);
        toast.error(`Unable to get location: ${err.message}. Please search or move map manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3.5 rounded-2xl border border-border bg-surface-elevated p-4">
      {/* Header & Helper banner */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" /> {title}
          </label>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGpsConfirmOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Navigation className="h-3.5 w-3.5" /> Use my current location
        </button>
      </div>

      {/* Address Search Bar with Live Autocomplete */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (predictions.length > 0) setShowPredictions(true);
            }}
            placeholder="Search address, street, landmark or area on Google Maps..."
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-8 text-xs text-foreground outline-none focus:border-primary"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-primary" />
          )}
        </div>

        {/* Autocomplete Predictions Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute left-0 right-0 top-11 z-30 max-h-52 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
            {predictions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPrediction(p)}
                className="w-full rounded-lg p-2 text-left text-xs transition-colors hover:bg-muted"
              >
                <div className="font-semibold text-foreground truncate">{p.primaryText}</div>
                <div className="text-[11px] text-muted-foreground truncate">{p.fullText}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Engine Container */}
      <div className="relative h-60 w-full overflow-hidden rounded-xl border border-border bg-slate-950">
        {/* Layer Controls & Zoom Buttons */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-700/60 p-0.5 shadow-md">
            <button
              type="button"
              onClick={() => setProvider('GOOGLE')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${provider === 'GOOGLE' ? 'bg-primary text-primary-foreground' : 'text-slate-300 hover:text-white'}`}
            >
              Google Roadmap
            </button>
            <button
              type="button"
              onClick={() => setProvider('SATELLITE')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${provider === 'SATELLITE' ? 'bg-primary text-primary-foreground' : 'text-slate-300 hover:text-white'}`}
            >
              Satellite
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-700/60 shadow-md">
            <button
              type="button"
              onClick={() => {
                const newZoom = Math.min(20, zoomLevel + 1);
                setZoomLevel(newZoom);
                if (mapInstanceRef.current) mapInstanceRef.current.setZoom(newZoom);
              }}
              className="p-1 text-slate-300 hover:text-primary transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const newZoom = Math.max(10, zoomLevel - 1);
                setZoomLevel(newZoom);
                if (mapInstanceRef.current) mapInstanceRef.current.setZoom(newZoom);
              }}
              className="p-1 text-slate-300 hover:text-primary transition-colors border-l border-slate-700/60"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Google Maps JS Canvas Container */}
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />

        {/* Centered Pin Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <div className="relative -mt-7 flex flex-col items-center">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-0.5 text-[10.5px] font-bold text-white shadow-xl border border-primary/40 backdrop-blur-xs animate-bounce">
              <MapPin className="h-3 w-3 text-primary" /> Storefront Entrance Pin
            </div>
            <div className="h-3 w-3 rotate-45 bg-slate-900 -mt-1 border-r border-b border-primary/40" />
            <div className="mt-1 flex items-center justify-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
            </div>
          </div>
        </div>

        {/* Directional Micro-Nudge Controls */}
        <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-700/60 text-[11px] shadow-md">
          <button
            type="button"
            onClick={() => updateCoords(lat + 0.0003, lng)}
            className="h-6 w-6 rounded bg-slate-800 text-white hover:bg-primary hover:text-primary-foreground font-bold flex items-center justify-center"
            title="Nudge North"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => updateCoords(lat - 0.0003, lng)}
            className="h-6 w-6 rounded bg-slate-800 text-white hover:bg-primary hover:text-primary-foreground font-bold flex items-center justify-center"
            title="Nudge South"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => updateCoords(lat, lng - 0.0003)}
            className="h-6 w-6 rounded bg-slate-800 text-white hover:bg-primary hover:text-primary-foreground font-bold flex items-center justify-center"
            title="Nudge West"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => updateCoords(lat, lng + 0.0003)}
            className="h-6 w-6 rounded bg-slate-800 text-white hover:bg-primary hover:text-primary-foreground font-bold flex items-center justify-center"
            title="Nudge East"
          >
            →
          </button>
        </div>
      </div>

      {/* Formatted Address Preview & Selected Coords */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{previewAddress}</span>
            {loadingReverse && <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />}
          </div>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground truncate">
            {[previewDetails.city, previewDetails.state, previewDetails.pincode].filter(Boolean).join(", ") || "Move pin on Google Map to update address preview"}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-mono text-[10.5px] text-muted-foreground">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </div>
          <button
            type="button"
            onClick={() => {
              onLocationSelect({
                lat,
                lng,
                addressLine1: previewAddress,
                city: previewDetails.city,
                state: previewDetails.state,
                pincode: previewDetails.pincode,
              });
              toast.success("Pharmacy storefront location confirmed!");
            }}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:opacity-90"
          >
            Confirm Location <CheckCircle2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Current Device Location */}
      <Dialog open={gpsConfirmOpen} onOpenChange={setGpsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Navigation className="h-4 w-4 text-primary" /> Use device location?
            </DialogTitle>
            <DialogDescription className="mt-2 text-xs leading-relaxed text-muted-foreground">
              We'll use your device location to position the map. Use this only if you are currently at your physical pharmacy storefront.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setGpsConfirmOpen(false)}
              className="rounded-full border border-border bg-surface-elevated px-4 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmGps}
              disabled={loadingGps}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loadingGps && <Loader2 className="h-3 w-3 animate-spin" />}
              Yes, I'm at the pharmacy
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
