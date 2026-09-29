"use client";

import React from "react";
import { Navigation, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerLocationMarkerProps {
  label?: string;
  isGPS?: boolean;
  accuracyRadiusMeters?: number;
  className?: string;
}

export function CustomerLocationMarker({
  label = "Current Location",
  isGPS = true,
  className,
}: CustomerLocationMarkerProps) {
  return (
    <div className={cn("relative flex flex-col items-center group pointer-events-auto", className)}>
      {/* Label Badge */}
      <div className="mb-1 px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur text-white text-[10px] font-extrabold shadow-lg border border-blue-400/30 whitespace-nowrap">
        {label}
      </div>

      {/* Pulsing Outer Accuracy Halo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping" />
        <div className="absolute -inset-2 rounded-full bg-blue-500/30 blur-[1px]" />

        {/* Central Platino GPS Pin */}
        <div className="relative p-2.5 rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-blue-500/30 border-2 border-white">
          <Navigation className="w-4 h-4 fill-current rotate-45 text-white" />
        </div>
      </div>
    </div>
  );
}
