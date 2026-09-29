"use client";

import React from "react";
import { Bike, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiderMarkerProps {
  heading?: number;
  speed?: number;
  riderName?: string;
  className?: string;
}

export function RiderMarker({
  heading = 0,
  speed = 0,
  riderName = "Delivery Executive",
  className,
}: RiderMarkerProps) {
  return (
    <div className={cn("relative flex flex-col items-center group pointer-events-auto", className)}>
      {/* Rider Name & Speed Badge */}
      <div className="mb-1 px-2.5 py-1 rounded-full bg-teal-600/90 backdrop-blur text-white text-[10px] font-extrabold shadow-lg border border-teal-400/30 whitespace-nowrap flex items-center gap-1">
        <Bike className="w-3 h-3" />
        <span>{riderName}</span>
        {speed > 0 && <span className="opacity-80">({Math.round(speed)} km/h)</span>}
      </div>

      {/* Pulsing Rider Pin */}
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-2 rounded-full bg-teal-500/30 animate-pulse" />
        <div
          className="relative p-2.5 rounded-full bg-teal-600 text-white shadow-2xl ring-4 ring-teal-500/30 border-2 border-white transition-transform duration-300"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <Bike className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}
