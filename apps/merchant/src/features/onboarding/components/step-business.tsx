"use client";
import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2, Loader2, Navigation, Edit3, AlertCircle } from "lucide-react";
import { FormState } from "@/features/onboarding/types";
import { Field, inputCls } from "./ui-helpers";
import { LocationPicker } from "@/components/ui/location-picker";

export function BusinessStep({
  state,
  update,
  errors,
}: {
  state: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Record<string, string>;
}) {
  const hasCoords = state.lat != null && state.lng != null && !isNaN(Number(state.lat)) && !isNaN(Number(state.lng));
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">(hasCoords ? "success" : "idle");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (state.lat != null && state.lng != null) {
      setLocStatus("success");
    }
  }, [state.lat, state.lng]);

  const detectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocStatus("error");
      setShowManual(true);
      return;
    }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("lat", Number(pos.coords.latitude.toFixed(6)));
        update("lng", Number(pos.coords.longitude.toFixed(6)));
        setLocStatus("success");
      },
      () => {
        setLocStatus("error");
        setShowManual(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <div>
      <h3 className="font-display text-2xl text-ink">Tell us about your pharmacy</h3>
      <p className="mt-1 text-sm text-ink-muted">
        We validate GST and drug license against government registries in real time.
      </p>

      {errors.submit && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-alert/30 bg-alert/10 p-3 text-xs text-alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Pharmacy name" error={errors.pharmacyName}>
          <input
            value={state.pharmacyName}
            onChange={(e) => update("pharmacyName", e.target.value)}
            placeholder="Green Cross Apothecary"
            className={inputCls(errors.pharmacyName)}
          />
        </Field>
        <Field label="Owner name" error={errors.ownerName}>
          <input
            value={state.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            placeholder="Rohan Menon"
            className={inputCls(errors.ownerName)}
          />
        </Field>
        <Field label="GST number" error={errors.gst}>
          <input
            value={state.gst}
            onChange={(e) => update("gst", e.target.value.toUpperCase())}
            placeholder="27AABCU9603R1ZX"
            className={inputCls(errors.gst)}
          />
        </Field>
        <Field label="Drug license" error={errors.license}>
          <input
            value={state.license}
            onChange={(e) => update("license", e.target.value.toUpperCase())}
            placeholder="MH-BND-20B / 21B"
            className={inputCls(errors.license)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Address Line 1" error={errors.address}>
            <input
              value={state.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Shop 4, Linking Rd"
              className={inputCls(errors.address)}
            />
          </Field>
        </div>
        <Field label="Address Line 2 (Optional)" error={errors.addressLine2}>
          <input
            value={state.addressLine2 || ""}
            onChange={(e) => update("addressLine2", e.target.value)}
            placeholder="Bandra West"
            className={inputCls(errors.addressLine2)}
          />
        </Field>
        <Field label="Landmark (Optional)" error={errors.landmark}>
          <input
            value={state.landmark || ""}
            onChange={(e) => update("landmark", e.target.value)}
            placeholder="Opposite Metro Station"
            className={inputCls(errors.landmark)}
          />
        </Field>
        <Field label="City" error={errors.city}>
          <input
            value={state.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Mumbai"
            className={inputCls(errors.city)}
          />
        </Field>
        <Field label="State" error={errors.addressState}>
          <input
            value={state.addressState || ""}
            onChange={(e) => update("addressState", e.target.value)}
            placeholder="Maharashtra"
            className={inputCls(errors.addressState)}
          />
        </Field>
        <Field label="Pincode" error={errors.pincode}>
          <input
            value={state.pincode || ""}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="400050"
            className={inputCls(errors.pincode)}
          />
        </Field>

        {/* GPS Location & Map Picker Section */}
        <div className="md:col-span-2 pt-3 border-t border-line/30 space-y-3">
          <LocationPicker
            initialLat={state.lat ? Number(state.lat) : undefined}
            initialLng={state.lng ? Number(state.lng) : undefined}
            onLocationSelect={(loc) => {
              update("lat", loc.lat);
              update("lng", loc.lng);
              if (loc.addressLine1 && !state.address) update("address", loc.addressLine1);
              if (loc.city && !state.city) update("city", loc.city);
              if (loc.state && !state.addressState) update("addressState", loc.state);
              if (loc.pincode && !state.pincode) update("pincode", loc.pincode);
            }}
          />

          {errors.location && (
            <div className="text-xs text-alert">{errors.location}</div>
          )}
        </div>
      </div>
    </div>
  );
}
