"use client";

import React, { useEffect, useState } from "react";
import { Store, MapPin, ShieldCheck, Clock, Navigation } from "lucide-react";

export function PharmacyStoreMap() {
  const [storeDetails, setStoreDetails] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [storeRes, orderRes] = await Promise.all([
          fetch("/api/customer/v1/pharmacy/business-details"),
          fetch("/api/customer/v1/pharmacy/orders"),
        ]);
        if (storeRes.ok) {
          const sData = await storeRes.json();
          setStoreDetails(sData.businessDetails || sData.data || sData);
        }
        if (orderRes.ok) {
          const oData = await orderRes.json();
          setOrders(oData.orders || oData.data || []);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadData();
  }, []);

  const lat = storeDetails?.address?.location?.coordinates?.[1] || 17.385;
  const lng = storeDetails?.address?.location?.coordinates?.[0] || 78.4867;
  const radius = storeDetails?.deliveryRadius || 15;

  const googleMapsUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground">
              {storeDetails?.name || "Store Delivery Coverage"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Delivery zone: <span className="font-bold text-primary">{radius} km radius</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" /> Active Delivery Zone
        </div>
      </div>

      {/* Map Embed Container */}
      <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-border bg-muted">
        <iframe
          title="Store Location & Delivery Zone"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={googleMapsUrl}
          className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90"
        />

        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur px-3 py-1.5 rounded-xl border border-border text-xs font-bold shadow-md">
          Active Store Orders: {orders.length}
        </div>

        <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur px-3 py-1 rounded-xl border border-border text-[11px] font-mono text-muted-foreground shadow-sm">
          Store GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
