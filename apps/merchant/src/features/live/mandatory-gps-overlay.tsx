"use client";
import React, { useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { usePharmacySettings, useUpdatePharmacySettingsMutation } from "@/hooks/usePharmacyQueries";
import { toast } from "./ui";

export function MandatoryGpsOverlay() {
  const { data: snap, isLoading } = usePharmacySettings();
  const updateMutation = useUpdatePharmacySettingsMutation();
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "error">("idle");

  if (isLoading || !snap) return null;

  // Check if coordinates are missing or using the New Delhi fallback
  const isMissing = snap.lat == null || snap.lng == null;
  const isFallback = snap.lat === 28.613 && snap.lng === 77.209;

  if (!isMissing && !isFallback) return null;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      toast("Browser does not support geolocation", "error");
      return;
    }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateMutation.mutateAsync({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast("Location detected successfully");
          // The query invalidation in mutateAsync will trigger a re-render
          // and hide this overlay since lat/lng are now updated!
        } catch (err: unknown) {
          setLocStatus("error");
          toast((err instanceof Error ? err.message : String(err)) || "Failed to save location", "error");
        }
      },
      () => {
        setLocStatus("error");
        toast("Failed to detect location. Check permissions.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-alert/30 bg-paper p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-alert/10 text-alert">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-center font-display text-xl font-bold text-ink">Action Required</h2>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-ink-muted">
          We need your exact store location to route local deliveries and show your pharmacy to nearby customers. 
          Your dashboard is temporarily locked until your GPS coordinates are captured.
        </p>

        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={detectLocation}
            disabled={locStatus === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-brand-ink disabled:opacity-50"
          >
            {locStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {locStatus === "loading" ? "Detecting location..." : "Detect My Location"}
          </button>
          
          {locStatus === "error" && (
            <p className="mt-3 text-center text-[12px] text-alert">
              Location access denied. Please enable location permissions in your browser settings and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
