'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  CheckCircle2,
  Package,
  Bike,
  Building2,
  PhoneCall,
  Share2,
} from 'lucide-react';
import { useActiveOrder } from '@/hooks/useActiveOrder';
import { cn } from '@/lib/utils';

export function ActiveOrderFloatingBanner() {
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showItemsDetail, setShowItemsDetail] = useState(false);

  const {
    activeOrder,
    isLive,
    formattedTimeRemaining,
    progressStep,
  } = useActiveOrder();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isDismissed) return null;

  const statusLabel =
    activeOrder.status === 'OUT_FOR_DELIVERY'
      ? 'On The Way'
      : activeOrder.status === 'PACKED'
      ? 'Packed & Ready'
      : 'Order Confirmed';

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50 pointer-events-none transition-colors duration-300">
        <motion.div
          initial={{ y: 70, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 70, opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="pointer-events-auto w-full"
        >
          {isCollapsed ? (
            /* MINIMIZED ULTRA-COMPACT FLOATING BOTTOM CAPSULE PILL */
            <div className="mx-auto flex items-center justify-between gap-3 rounded-full border border-slate-200/60 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/85 p-2 pl-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors duration-300">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <div className="flex items-center gap-2 truncate text-xs font-semibold text-slate-900 dark:text-white">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="h-3 w-3 fill-emerald-600 dark:fill-emerald-400" />
                    <span>{statusLabel}</span>
                  </span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    {formattedTimeRemaining}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/orders/${activeOrder.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Track <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  aria-label="Expand banner"
                  className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* FULL EXPANDED ZOMATO / INSTAMART / iOS LIVE ACTIVITIES CARD */
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/85 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl text-slate-900 dark:text-white transition-colors duration-300">
              
              {/* TOP PILL BAR: Pulsing Radar Dot + Status Pill + Order ID + Controls */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                    <Zap className="h-3 w-3 fill-emerald-600 dark:fill-emerald-400" /> {statusLabel}
                  </span>

                  <span className="hidden sm:inline-block text-xs font-mono text-slate-400 dark:text-zinc-500 truncate">
                    {activeOrder.displayId}
                  </span>

                  {isLive && (
                    <span className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      LIVE SOCKET
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    title="Minimize banner"
                    aria-label="Minimize banner"
                    className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDismissed(true)}
                    title="Dismiss for session"
                    aria-label="Dismiss banner"
                    className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* MAIN INFO SECTION + APPLE WATCH / LIVE ACTIVITY STYLE ETA COUNTDOWN */}
              <div className="mt-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Store / Courier Icon Circle */}
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    <Building2 className="h-5.5 w-5.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate font-semibold text-slate-900 dark:text-white text-sm">
                        {activeOrder.store.name}
                      </h4>
                      <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400 shrink-0">
                        {activeOrder.store.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{activeOrder.deliveryLocation.address} ({activeOrder.deliveryLocation.distanceKm} km)</span>
                    </p>
                  </div>
                </div>

                {/* Apple Watch Style High-Contrast EST. ARRIVAL Timer Container */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500">
                    Est. Arrival
                  </span>
                  <div className="mt-0.5 flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-zinc-950 px-3 py-1 text-white border border-slate-800 dark:border-zinc-800 shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span className="font-mono text-sm font-bold tracking-tight text-emerald-400">
                      {formattedTimeRemaining}
                    </span>
                  </div>
                </div>
              </div>

              {/* ITEMS ACCORDION PREVIEW */}
              <div className="relative mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowItemsDetail(!showItemsDetail)}
                  className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {activeOrder.totalItemCount} {activeOrder.totalItemCount === 1 ? 'item' : 'items'}: {activeOrder.items.map((i) => `${i.title} x${i.quantity}`).join(', ')}
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 underline ml-2 shrink-0">
                    {showItemsDetail ? 'Hide' : 'View'}
                  </span>
                </button>

                {showItemsDetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 p-3 text-xs border border-slate-200/60 dark:border-zinc-800 space-y-2"
                  >
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-medium">
                        <span>• {item.title}</span>
                        <span className="font-mono font-bold">x{item.quantity}</span>
                      </div>
                    ))}
                    {activeOrder.courierName && (
                      <div className="pt-1.5 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                        <span>Courier: {activeOrder.courierName}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified Partner ✓</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* POLISHED 3-STAGE PROGRESS STEPPER */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* 3-Stage Visual Stepper */}
                <div className="flex items-center gap-2 flex-1">
                  {/* Step 1: Confirmed */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    <div className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[10px] shadow-xs">
                      ✓
                    </div>
                    <span className="hidden sm:inline">Confirmed</span>
                  </div>

                  {/* Step 1 Bar */}
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div className={cn("h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-xs", progressStep >= 2 ? "w-full" : "w-1/2")} />
                  </div>

                  {/* Step 2: Packed */}
                  <div className={cn("flex items-center gap-1.5 text-xs font-semibold shrink-0", progressStep >= 2 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-600")}>
                    <div className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px]", progressStep >= 2 ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-xs" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600")}>
                      <Package className="h-3 w-3" />
                    </div>
                    <span className="hidden sm:inline">Packed</span>
                  </div>

                  {/* Step 2 Bar */}
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div className={cn("h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-xs", progressStep >= 3 ? "w-full" : "w-0")} />
                  </div>

                  {/* Step 3: On The Way */}
                  <div className={cn("flex items-center gap-1.5 text-xs font-semibold shrink-0", progressStep >= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-600")}>
                    <div className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px]", progressStep >= 3 ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-xs" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600")}>
                      <Bike className="h-3 w-3 animate-pulse" />
                    </div>
                    <span>On The Way</span>
                  </div>
                </div>

                {/* High-Converting Primary CTA Button */}
                <Link
                  href={`/orders/${activeOrder.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 px-5 py-2 text-xs font-bold transition-all active:scale-95 shrink-0"
                >
                  <span>Track Order</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
