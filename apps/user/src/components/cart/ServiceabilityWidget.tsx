"use client";

import React, { useState } from "react";
import axios from "@/lib/axios";

interface ServiceabilityWidgetProps {
  onServiceabilityChange?: (data: {
    serviceable: boolean;
    deliveryFee: number;
    estimatedEtaMinutes: number;
  }) => void;
}

export function ServiceabilityWidget({ onServiceabilityChange }: ServiceabilityWidgetProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    serviceable: boolean;
    distanceKm?: number;
    estimatedEtaMinutes?: number;
    deliveryFee?: number;
    pharmacyName?: string;
    rejectionReason?: string;
  } | null>(null);

  const checkServiceability = async () => {
    if (!address.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/customer/v1/delivery/serviceability", {
        address,
      });

      if (res.data.success) {
        const payload = {
          serviceable: res.data.serviceable,
          distanceKm: res.data.optimalPharmacy?.distanceKm,
          estimatedEtaMinutes: res.data.optimalPharmacy?.estimatedEtaMinutes || 30,
          deliveryFee: res.data.optimalPharmacy?.deliveryFee || 30,
          pharmacyName: res.data.optimalPharmacy?.pharmacyName,
          rejectionReason: res.data.rejectionReason,
        };

        setResult(payload);

        if (onServiceabilityChange) {
          onServiceabilityChange({
            serviceable: payload.serviceable,
            deliveryFee: payload.deliveryFee,
            estimatedEtaMinutes: payload.estimatedEtaMinutes,
          });
        }
      }
    } catch (err) {
      setResult({
        serviceable: false,
        rejectionReason: "Failed to check location serviceability.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-4 my-4 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <h4 className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">
          Instant 30-Min Delivery Check
        </h4>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter street, landmark, or locality..."
          className="flex-1 bg-slate-900/80 border border-emerald-900/60 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          onClick={checkServiceability}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Verify Location"}
        </button>
      </div>

      {result && (
        <div className="mt-3 text-xs border-t border-emerald-900/40 pt-2">
          {result.serviceable ? (
            <div className="space-y-1 text-emerald-300">
              <p className="font-semibold">
                ✓ Serviceable by <span className="text-white">{result.pharmacyName}</span>
              </p>
              <div className="flex items-center justify-between text-slate-300">
                <span>Distance: {result.distanceKm} km</span>
                <span>ETA: ~{result.estimatedEtaMinutes} mins</span>
                <span>Delivery Fee: ₹{result.deliveryFee}</span>
              </div>
            </div>
          ) : (
            <p className="text-rose-400 font-medium">
              ✕ {result.rejectionReason || "Location outside current 30-min instant delivery zone."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
