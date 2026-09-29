"use client";

import React from "react";
import { Store, ShieldCheck, Cross } from "lucide-react";
import { cn } from "@/lib/utils";

interface PharmacyMarkerProps {
  name: string;
  isOnline?: boolean;
  isSelected?: boolean;
  inventoryCoveragePercent?: number;
  onClick?: () => void;
  className?: string;
}

export function PharmacyMarker({
  name,
  isOnline = true,
  isSelected = false,
  inventoryCoveragePercent = 100,
  onClick,
  className,
}: PharmacyMarkerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center group pointer-events-auto transition-transform duration-200 active:scale-95 cursor-pointer",
        isSelected && "scale-110 z-30",
        className
      )}
    >
      {/* Pharmacy Name & Badge */}
      <div
        className={cn(
          "mb-1 px-3 py-1 rounded-full backdrop-blur text-xs font-extrabold shadow-xl border flex items-center gap-1.5 transition-colors",
          isOnline
            ? "bg-emerald-600/95 text-white border-emerald-400/40"
            : "bg-gray-700/90 text-gray-200 border-gray-500/30"
        )}
      >
        <Store className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate max-w-[120px]">{name}</span>
        {inventoryCoveragePercent === 100 && (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
        )}
      </div>

      {/* Main Medical Icon Badge */}
      <div
        className={cn(
          "relative p-2.5 rounded-2xl shadow-2xl border-2 transition-all",
          isOnline
            ? "bg-emerald-600 text-white ring-4 ring-emerald-500/30 border-white"
            : "bg-gray-700 text-gray-300 ring-2 ring-gray-600/30 border-gray-400",
          isSelected && "ring-8 ring-emerald-500/50 bg-emerald-500"
        )}
      >
        <Cross className="w-5 h-5 fill-current text-white" />
      </div>

      <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px] mt-0.5" />
    </button>
  );
}
