'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Clock, Star, Truck, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { Pharmacy, PharmacyBadge } from "@/lib/types";
import { useWishlist } from "@/stores";
import { badgeLabel, formatDistance } from "@/lib/format";
import { cn } from "@/lib/utils";

const TRUST_PRIORITY: PharmacyBadge[] = ["verified", "licensed", "24x7", "prescription"];

function pickTrustBadge(badges: PharmacyBadge[] | undefined): {
  label: string;
  key: PharmacyBadge | "community";
} {
  const list = badges ?? [];
  const found = TRUST_PRIORITY.find((b) => list.includes(b));
  if (!found) return { label: "Community Store", key: "community" };
  if (found === "verified") return { label: "Licensed Pharmacy", key: found };
  return { label: badgeLabel[found] ?? "Verified", key: found };
}

export const PharmacyCard = React.memo(function PharmacyCard({
  pharmacy,
  index = 0,
  distanceKmOverride,
  etaMinutesOverride,
  etaClosed,
  showNearBadge,
  loading,
  isOpenOverride,
}: {
  pharmacy: Pharmacy;
  index?: number;
  distanceKmOverride?: number;
  etaMinutesOverride?: number;
  etaClosed?: boolean;
  showNearBadge?: boolean;
  loading?: boolean;
  isOpenOverride?: boolean;
}) {
  const hasWish = useWishlist((s) => s.hasPharmacy(pharmacy.id));
  const toggle = useWishlist((s) => s.togglePharmacy);
  const trust = pickTrustBadge(pharmacy.badges);

  const rating = Number.isFinite(pharmacy.rating) ? pharmacy.rating : 0;
  const hasRating = rating > 0 && (pharmacy.reviewCount ?? 0) > 0;
  const ratingLabel = hasRating
    ? `Rated ${rating.toFixed(1)} out of 5 from ${pharmacy.reviewCount} reviews`
    : "Not yet rated";

  const distanceKmValue = distanceKmOverride ?? pharmacy.distanceKm;
  const distance = Number.isFinite(distanceKmValue) ? formatDistance(distanceKmValue) : "—";
  const etaMinutes = etaMinutesOverride ?? pharmacy.etaMinutes;
  const eta =
    etaClosed
      ? "Opens later"
      : Number.isFinite(etaMinutes)
        ? etaMinutes < 30
          ? `~${etaMinutes} min`
          : `${etaMinutes - 5}–${etaMinutes + 5} min`
        : "—";
  const isNear = showNearBadge && !loading && Number.isFinite(distanceKmValue) && distanceKmValue <= 10;
  const isOpenNow = isOpenOverride ?? pharmacy.isOpen;
  const isExpress = pharmacy.badges.includes("express");
  const is247 = pharmacy.badges.includes("24x7");
  const prepMin = isExpress ? 6 : is247 ? 8 : 12;
  const speedKmh = isExpress ? 32 : 22;
  const etaExplanation = etaClosed
    ? `Currently closed (${pharmacy.hours}). Estimated delivery when open: ${prepMin} min prep + travel at ${speedKmh} km/h.`
    : `Estimated as ${prepMin} min prep${isExpress ? " (express)" : is247 ? " (24×7)" : ""} + travel at ${speedKmh} km/h over ${Number.isFinite(distanceKmValue) ? distanceKmValue.toFixed(1) : "?"} km.`;
  const name = pharmacy.name?.trim() || "Pharmacy";
  const tagline = pharmacy.tagline?.trim() || "Neighborhood pharmacy near you.";
  const isFree = pharmacy.deliveryFee === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        href={`/pharmacy/${pharmacy.slug}`}
        
        aria-label={`${name} — ${trust.label}. ${ratingLabel}. ${distance}, ${eta} away.`}
        data-testid="pharmacy-card-link"
        data-slug={pharmacy.slug}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[28px] border border-primary/15 bg-surface-elevated shadow-soft will-change-transform transform-gpu",
          "transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated",
          "outline-none focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.98]",
        )}
      >
        {/* Hero */}
        <div className="relative h-40 w-full overflow-hidden sm:h-44">
          <Image
            src={pharmacy.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 2}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-black/20" />

          {/* Top row: trust chip + wishlist */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 shadow-sm backdrop-blur-md">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-glow" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                  {trust.label}
                </span>
              </div>
              {isNear && (
                <div
                  className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/25 px-2 py-1 shadow-sm backdrop-blur-md"
                  aria-label="Within 10 kilometres of you"
                >
                  <MapPin className="h-3 w-3 text-white" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                    Within 10 km
                  </span>
                </div>
              )}
            </div>


            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(pharmacy.id);
              }}
              aria-label={hasWish ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
              aria-pressed={hasWish}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/30 text-white/85 backdrop-blur-md",
                "transition-colors hover:bg-primary/20 hover:text-white",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Heart
                className={cn("h-4 w-4", hasWish && "fill-destructive text-destructive")}
                strokeWidth={2}
                aria-hidden
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-[22px] leading-tight tracking-tight text-foreground">
                {name}
              </h3>
              <p className="mt-1 line-clamp-1 text-[13px] font-medium text-primary/70">
                {tagline}
              </p>
            </div>
            {hasRating ? (
              <div
                className="flex shrink-0 items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 px-2 py-1 transition-transform group-hover:scale-105"
                aria-label={ratingLabel}
              >
                <Star className="h-3 w-3 fill-primary text-primary" aria-hidden />
                <span className="text-[13px] font-bold text-primary tabular-nums">
                  {rating.toFixed(1)}
                </span>
              </div>
            ) : (
              <span
                className="shrink-0 rounded-lg border border-border bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                aria-label="New pharmacy, not yet rated"
              >
                New
              </span>
            )}
          </div>

          {/* Meta stats bar */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-primary/10 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10">
                <MapPin className="h-3 w-3 text-primary/80" strokeWidth={2} aria-hidden />
              </span>
              {loading ? (
                <span
                  aria-hidden
                  className="inline-block h-3 w-10 animate-pulse rounded bg-primary/15"
                />
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                  {distance}
                </span>
              )}
            </div>
            <div className="group/eta relative flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10">
                <Clock className="h-3 w-3 text-primary/80" strokeWidth={2} aria-hidden />
              </span>
              {loading ? (
                <span
                  aria-hidden
                  className="inline-block h-3 w-14 animate-pulse rounded bg-primary/15"
                />
              ) : (
                <>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
                    {eta}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    aria-label={`How this ETA is calculated: ${etaExplanation}`}
                    className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground/70 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <Info className="h-3 w-3" aria-hidden />
                  </button>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-56 rounded-lg border border-border bg-popover px-3 py-2 text-[11px] font-normal leading-relaxed normal-case tracking-normal text-popover-foreground shadow-elevated group-hover/eta:block group-focus-within/eta:block"
                  >
                    {etaExplanation}
                  </span>
                </>
              )}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2" aria-hidden>
                {isOpenNow && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    isOpenNow ? "bg-primary" : "bg-destructive",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  isOpenNow ? "text-primary" : "text-destructive",
                )}
              >
                {isOpenNow ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
              <Truck className="h-4 w-4" strokeWidth={2} aria-hidden />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary/70">
                Shipping
              </span>
              <span className="text-[13px] font-bold text-foreground">
                {isFree ? "Free Delivery" : `₹${pharmacy.deliveryFee} Delivery`}
              </span>
            </div>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/20 text-primary/50 transition-colors group-hover:text-primary">
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
      </Link>
    </motion.div>
  );
});
