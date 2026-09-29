"use client";

import React, { useEffect, useState } from "react";
import { Store, MapPin, Clock, Bike, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { PlatinoGoogleMap, MapMarkerData, MapCoordinates } from "./PlatinoGoogleMap";
import { cn } from "@/lib/utils";

interface OrderTrackingMapProps {
  orderId: string;
  className?: string;
}

export function OrderTrackingMap({ orderId, className }: OrderTrackingMapProps) {
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customer/v1/orders/${orderId}/tracking`);
      if (!res.ok) throw new Error("Failed to load order tracking");
      const data = await res.json();
      setTrackingData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Tracking error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTracking();
      // Poll every 15 seconds for status updates
      const interval = setInterval(fetchTracking, 15000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  if (loading && !trackingData) {
    return (
      <div className={cn("w-full h-80 rounded-2xl bg-card border border-border flex items-center justify-center p-6", className)}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-bold">Calculating optimal route & ETA...</span>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className={cn("w-full h-80 rounded-2xl bg-card border border-border flex items-center justify-center p-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center text-amber-500">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm font-bold">{error || "Unable to display tracking map"}</span>
          <button
            onClick={fetchTracking}
            className="mt-2 text-xs font-bold text-primary underline hover:opacity-80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { store, destination, route, eta, status, rider } = trackingData;

  const markers: MapMarkerData[] = [
    {
      id: "store_marker",
      type: "pharmacy",
      location: store.location,
      title: store.name,
      subtitle: store.address,
    },
    {
      id: "dest_marker",
      type: "destination",
      location: destination.location,
      title: destination.recipientName || "Customer Destination",
      subtitle: destination.address,
    },
  ];

  if (rider) {
    markers.push({
      id: "rider_marker",
      type: "rider",
      location: { lat: rider.lat, lng: rider.lng },
      title: "Delivery Partner",
      subtitle: `Speed: ${rider.speed} km/h`,
    });
  }

  const centerCoords: MapCoordinates = rider
    ? { lat: rider.lat, lng: rider.lng }
    : {
        lat: (store.location.lat + destination.location.lat) / 2,
        lng: (store.location.lng + destination.location.lng) / 2,
      };

  return (
    <div className={cn("space-y-4", className)}>
      {/* ── Status Header Card ── */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Instant Delivery Status
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Live
              </span>
            </div>
            <h3 className="font-display font-extrabold text-base text-foreground mt-0.5">
              ETA: {eta?.formattedEta || "30 mins"}
            </h3>
          </div>
        </div>

        {/* Dynamic Status Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
          <span className={cn(
            "px-3 py-1 rounded-full border uppercase tracking-wider text-[11px]",
            status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-primary/10 text-primary border-primary/30"
          )}>
            {status}
          </span>
        </div>
      </div>

      {/* ── Interactive Map Canvas ── */}
      <PlatinoGoogleMap
        center={centerCoords}
        zoom={13}
        markers={markers}
        polylinePoints={route?.polylinePoints || []}
        height="360px"
      />

      {/* ── Route Breakdown Footer ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border">
          <span className="text-[10px] text-muted-foreground block font-bold uppercase">Distance</span>
          <span className="text-xs font-extrabold text-foreground">{route?.distanceKm || 0} km</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <span className="text-[10px] text-muted-foreground block font-bold uppercase">Prep SLA</span>
          <span className="text-xs font-extrabold text-foreground">{eta?.prepMinutes || 0} mins</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <span className="text-[10px] text-muted-foreground block font-bold uppercase">Transit SLA</span>
          <span className="text-xs font-extrabold text-foreground">{eta?.travelMinutes || 0} mins</span>
        </div>
      </div>
    </div>
  );
}
