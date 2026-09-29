'use client';
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { reverseGeocode, type GeocodedAddress } from "@/services/geocodingService";
import { useLocation } from "@/stores";
import { catalogService } from "@/services";
import { AREA_COORDS, distanceKm } from "@/lib/geo";
import { analytics } from "@/lib/analytics";

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  address: GeocodedAddress | null;
  isLoading: boolean;
  error: string | null;
  permissionState: PermissionState | "unknown";
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    address: null,
    isLoading: false,
    error: null,
    permissionState: "unknown",
  });

  const setArea = useLocation((s) => s.setArea);
  const setCoords = useLocation((s) => s.setCoords);
  const setDetectStatus = useLocation((s) => s.setDetectStatus);
  const areas = catalogService.areas();

  const isFetchingRef = useRef(false);

  const requestLocation = useCallback(async () => {
    if (isFetchingRef.current) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const err = "Location isn't available on this device";
      setState((s) => ({ ...s, error: err }));
      setDetectStatus("unavailable");
      toast.error(err);
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      const err = "Location needs a secure (https) connection";
      setState((s) => ({ ...s, error: err }));
      setDetectStatus("unavailable");
      toast.error(err);
      return;
    }

    isFetchingRef.current = true;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    setDetectStatus("detecting");

    const t = toast.loading("Detecting your location…");

    try {
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        setState((s) => ({ ...s, permissionState: permission.state }));
      }
    } catch (e) {
      console.warn("Permissions API not fully supported.");
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords = { lat, lng };
        console.log("Raw Browser Coordinates:", coords);

        setState((s) => ({ ...s, coordinates: coords, permissionState: "granted" }));
        setCoords({ lat, lng, accuracy: position.coords.accuracy });
        setDetectStatus("granted");

        // 1. Calculate nearest delivery area
        let best: { id: string; area: string; dist: number } | null = null;
        for (const a of areas) {
          const c = AREA_COORDS[a.id];
          if (!c) continue;
          const d = distanceKm(coords, c);
          if (!best || d < best.dist) best = { id: a.id, area: a.area, dist: d };
        }

        toast.dismiss(t);

        if (best) {
          setArea(best.id);
          analytics.track("location_detect", {
            areaId: best.id,
            distanceKm: Number(best.dist.toFixed(2)),
            accuracy: position.coords.accuracy,
          });

          if (best.dist > 40) {
            toast.message(`We deliver in Hyderabad — set to nearest area: ${best.area}`);
          } else {
            toast.success(`Delivering to ${best.area} (${best.dist.toFixed(1)} km away)`);
          }
        } else {
          toast.error("Couldn't match a nearby service area");
        }

        // 2. Fetch exact street address from Google Maps
        try {
          const address = await reverseGeocode(lat, lng);
          setState((s) => ({ ...s, address, isLoading: false }));
        } catch (error: unknown) {
          console.error("Reverse Geocoding Hook Error:", error);
          setState((s) => ({
            ...s,
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to decode address from coordinates."
          }));
        } finally {
          isFetchingRef.current = false;
        }
      },
      (error) => {
        let errorMessage = "Couldn't detect your location";
        toast.dismiss(t);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Enable it in your browser to auto-detect.";
            setState((s) => ({ ...s, permissionState: "denied" }));
            setDetectStatus("denied");
            analytics.track("location_detect", { status: "denied" });
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is currently unavailable.";
            setDetectStatus("error");
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Try again.";
            setDetectStatus("error");
            analytics.track("location_detect", { status: "timeout" });
            break;
        }

        toast.error(errorMessage);
        setState((s) => ({ ...s, error: errorMessage, isLoading: false }));
        isFetchingRef.current = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [areas, setArea, setCoords, setDetectStatus]);

  const resetError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    requestLocation,
    detecting: state.isLoading, // Backwards compatibility alias
    resetError,
  };
}
