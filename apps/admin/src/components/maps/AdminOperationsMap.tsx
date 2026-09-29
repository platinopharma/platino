"use client";

import React, { useEffect, useState } from "react";
import { Store, MapPin, ShieldCheck, Activity, AlertTriangle, Layers, Filter } from "lucide-react";
import { PlatinoGoogleMap, MapMarkerData, MapCoordinates } from "@/components/maps/PlatinoGoogleMap";

export function AdminOperationsMap() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "pharmacies" | "orders">("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pharmRes, orderRes] = await Promise.all([
          fetch("/api/customer/admin/pharmacies"),
          fetch("/api/customer/v1/admin/orders"),
        ]);
        if (pharmRes.ok) {
          const pData = await pharmRes.json();
          setPharmacies(pData.pharmacies || pData.data || []);
        }
        if (orderRes.ok) {
          const oData = await orderRes.json();
          setOrders(oData.orders || oData.data || []);
        }
      } catch (e) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const markers: MapMarkerData[] = [];

  if (filterType === "all" || filterType === "pharmacies") {
    pharmacies.forEach((p, idx) => {
      const lat = p.address?.location?.coordinates?.[1] || p.address?.geo?.lat || 17.385 + (idx % 5) * 0.01;
      const lng = p.address?.location?.coordinates?.[0] || p.address?.geo?.lng || 78.4867 + (idx % 5) * 0.01;
      markers.push({
        id: `pharm_${p._id}`,
        type: "pharmacy",
        location: { lat, lng },
        title: p.name || "Partner Chemist",
        subtitle: p.address?.city || "Hyderabad",
        status: p.isOnline ? "online" : "offline",
        details: {
          status: p.isOnline ? "Online" : "Offline",
          verification: p.verificationStatus || "Approved",
          deliveryRadius: `${p.deliveryRadius || 15} km`,
        },
      });
    });
  }

  if (filterType === "all" || filterType === "orders") {
    orders.forEach((o, idx) => {
      const lat = o.deliveryAddress?.location?.coordinates?.[1] || o.deliveryAddress?.lat || 17.44 + (idx % 3) * 0.01;
      const lng = o.deliveryAddress?.location?.coordinates?.[0] || o.deliveryAddress?.lng || 78.35 + (idx % 3) * 0.01;
      markers.push({
        id: `ord_${o._id}`,
        type: "destination",
        location: { lat, lng },
        title: `Order #${(o._id || "").slice(-6)}`,
        subtitle: o.orderStatus || "PLACED",
        details: {
          status: o.orderStatus,
          payment: o.paymentStatus,
          total: `₹${o.totalAmount || 0}`,
        },
      });
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Control Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground">
              Operations & Serviceability Map
            </h3>
            <p className="text-xs text-muted-foreground">
              Live geographic monitoring of active pharmacies and instant delivery fulfillment
            </p>
          </div>
        </div>

        {/* Filter Toggle Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "all" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({pharmacies.length + orders.length})
          </button>
          <button
            onClick={() => setFilterType("pharmacies")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "pharmacies" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pharmacies ({pharmacies.length})
          </button>
          <button
            onClick={() => setFilterType("orders")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === "orders" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* ── Map Display ── */}
      <PlatinoGoogleMap
        center={{ lat: 17.385, lng: 78.4867 }}
        zoom={12}
        markers={markers}
        height="500px"
      />
    </div>
  );
}
