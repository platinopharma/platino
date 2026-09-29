"use client";

import React from "react";
import { MapPin, Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryAddressMarkerProps {
  label?: string;
  address?: string;
  className?: string;
}

export function DeliveryAddressMarker({
  label = "Delivery Destination",
  address,
  className,
}: DeliveryAddressMarkerProps) {
  return (
    <div className={cn("relative flex flex-col items-center group pointer-events-auto", className)}>
      {/* Address Card Preview */}
      <div className="mb-1 px-3 py-1 rounded-xl bg-rose-600/90 backdrop-blur text-white text-[11px] font-extrabold shadow-lg border border-rose-400/30 max-w-[160px] truncate">
        {address || label}
      </div>

      {/* Destination Drop Pin */}
      <div className="relative p-2.5 rounded-2xl bg-rose-600 text-white shadow-2xl ring-4 ring-rose-500/30 border-2 border-white">
        <MapPin className="w-5 h-5 fill-current text-white" />
      </div>
      <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5" />
    </div>
  );
}
