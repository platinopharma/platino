'use client';
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { pharmacyService } from "@/services";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { PharmacyCardSkeleton } from "@/components/ui-parts/skeletons";
import { EmptyState } from "@/components/ui-parts/empty-state";
import {
  Store,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useLocation } from "@/stores";
import { catalogService } from "@/services";
import { cn } from "@/lib/utils";
import { pharmacyDistanceFrom, estimatePharmacyEta, isOpenAt } from "@/lib/geo";
import { LocationButton } from "@/components/ui/location-button";
import type { Pharmacy } from "@/lib/types";

const filterDefs = [
  { key: "open", label: "Open now" },
  { key: "delivery", label: "Delivery available" },
  { key: "h24", label: "24×7" },
  { key: "free", label: "Free delivery" },
  { key: "express", label: "Express" },
  { key: "rx", label: "Rx accepted" },
] as const;

const sortDefs = [
  { key: "nearest", label: "Nearest" },
  { key: "fastest", label: "Fastest delivery" },
  { key: "rated", label: "Highest rated" },
  { key: "popular", label: "Most popular" },
  { key: "newest", label: "Newest" },
  { key: "cheapest", label: "Lowest delivery fee" },
] as const;

const RADIUS_STEPS = [5, 10, 25, 50] as const;
const RADIUS_ALL = 9999;

type PharmacyWithMeta = Pharmacy & {
  effectiveDistanceKm: number;
  computedEtaMinutes: number;
  etaClosed: boolean;
  hasDelivery: boolean;
};

// Composite "nearest" sort: distance asc → open first → delivery available first.
// Applied consistently regardless of radius filter changes.
function compareByDistanceThenAvailability(a: PharmacyWithMeta, b: PharmacyWithMeta) {
  const dd = a.effectiveDistanceKm - b.effectiveDistanceKm;
  if (Math.abs(dd) > 0.05) return dd; // 50m dead-zone before tie-breakers kick in
  if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
  if (a.hasDelivery !== b.hasDelivery) return a.hasDelivery ? -1 : 1;
  return a.etaMinutes - b.etaMinutes;
}

import { useSearchParams, useRouter, usePathname } from "next/navigation";

function applyFilters(list: PharmacyWithMeta[], s: { open?: boolean, delivery?: boolean, h24?: boolean, free?: boolean, express?: boolean, rx?: boolean, sort?: string }) {
  let out = [...list];
  if (s.open) out = out.filter((p) => p.isOpen);
  if (s.delivery) out = out.filter((p) => p.hasDelivery);
  if (s.h24) out = out.filter((p) => p.badges.includes("24x7"));
  if (s.free) out = out.filter((p) => p.deliveryFee === 0);
  if (s.express) out = out.filter((p) => p.badges.includes("express"));
  if (s.rx) out = out.filter((p) => p.badges.includes("prescription"));
  switch (s.sort) {
    case "nearest":
      out.sort(compareByDistanceThenAvailability);
      break;
    case "fastest":
      out.sort((a, b) => a.computedEtaMinutes - b.computedEtaMinutes);
      break;
    case "rated":
      out.sort((a, b) => b.rating - a.rating);
      break;
    case "popular":
      out.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "cheapest":
      out.sort((a, b) => a.deliveryFee - b.deliveryFee);
      break;
    case "newest":
      out.reverse();
      break;
  }
  return out;
}

function ManualLocationPicker({ onDone }: { onDone?: () => void }) {
  const areas = catalogService.areas();
  const areaId = useLocation((s) => s.areaId);
  const setArea = useLocation((s) => s.setArea);
  const setCoords = useLocation((s) => s.setCoords);
  const [landmark, setLandmark] = useState("");

  const submitLandmark = () => {
    const q = landmark.trim().toLowerCase();
    if (!q) return;
    const match =
      areas.find((a) => a.area.toLowerCase() === q) ||
      areas.find((a) => a.area.toLowerCase().includes(q)) ||
      areas.find((a) => q.includes(a.area.toLowerCase())) ||
      areas.find((a) => a.city.toLowerCase().includes(q));
    if (!match) {
      toast.error(`We couldn't match "${landmark}" to a service area yet.`);
      return;
    }
    setArea(match.id);
    setCoords(null); // manual selection — drop stale coords so area is authoritative
    toast.success(`Showing pharmacies in ${match.area}`);
    setLandmark("");
    onDone?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pick your area
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setArea(a.id);
                setCoords(null);
                toast.success(`Delivering to ${a.area}`);
                onDone?.();
              }}
              className={cn(
                "h-8 rounded-full border px-3 text-xs transition-colors",
                areaId === a.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated hover:border-primary",
              )}
            >
              {a.area}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label
          htmlFor="landmark-input"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Or enter a landmark
        </label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="landmark-input"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitLandmark();
                }
              }}
              placeholder="e.g. HITEC City, Jubilee Hills"
              className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            onClick={submitLandmark}
            disabled={!landmark.trim()}
            className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Find
          </button>
        </div>
      </div>
    </div>
  );
}

export function PharmaciesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = {
    open: searchParams.get("open") === "true",
    delivery: searchParams.get("delivery") === "true",
    h24: searchParams.get("h24") === "true",
    free: searchParams.get("free") === "true",
    express: searchParams.get("express") === "true",
    rx: searchParams.get("rx") === "true",
    sort: searchParams.get("sort") || "nearest",
  };
  const areaId = useLocation((s) => s.areaId);
  const coords = useLocation((s) => s.coords);
  const radiusKm = useLocation((s) => s.radiusKm);
  const setRadius = useLocation((s) => s.setRadius);
  const detectStatus = useLocation((s) => s.detectStatus);
  const area = catalogService.areas().find((a) => a.id === areaId);
  const [manualOpen, setManualOpen] = useState(false);

  // "tick" bumps every minute so ETA + open-status re-derive against wall-clock time.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) {
        setTick((t) => t + 1);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Loading shimmer while distance/eta re-derive after coords or radius flips.
  const [recomputing, setRecomputing] = useState(false);
  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    setRecomputing(true);
    const id = setTimeout(() => setRecomputing(false), 320);
    return () => clearTimeout(id);
  }, [coords, radiusKm]);

  const { data, isLoading } = useQuery({
    queryKey: ["pharmacies-all", coords?.lat, coords?.lng, radiusKm, areaId],
    queryFn: () => pharmacyService.listNearby(coords, radiusKm, areaId),
  });

  const withMeta = useMemo<PharmacyWithMeta[]>(() => {
    if (!data) return [];
    const now = new Date();
    return data.map((p) => {
      const dist = pharmacyDistanceFrom(coords, p.area, p.distanceKm);
      // Prefer parsed hours-based open state; fall back to the seeded flag.
      const parsedOpen = isOpenAt(p.hours, now);
      const isOpenNow = parsedOpen ?? p.isOpen;
      const eta = estimatePharmacyEta(dist, {
        isOpen: isOpenNow,
        badges: p.badges,
        fallbackMinutes: p.etaMinutes,
      });
      return {
        ...p,
        isOpen: isOpenNow,
        effectiveDistanceKm: dist,
        computedEtaMinutes: eta.minutes,
        etaClosed: eta.closed,
        hasDelivery: isOpenNow && p.deliveryFee >= 0,
      };
    });
    // `tick` is intentionally in deps so the memo re-runs each minute even though
    // it isn't referenced directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, coords, tick]);

  const filtered = applyFilters(withMeta, search);
  const withinRadius = filtered.filter((p) => p.effectiveDistanceKm <= radiusKm);


  const nextRadius = useMemo(() => {
    const remaining = filtered
      .filter((p) => p.effectiveDistanceKm > radiusKm)
      .sort((a, b) => a.effectiveDistanceKm - b.effectiveDistanceKm)[0];
    if (!remaining) return null;
    const step = RADIUS_STEPS.find((r) => r > radiusKm && r >= remaining.effectiveDistanceKm);
    return step ?? RADIUS_ALL;
  }, [filtered, radiusKm]);

  const setFilter = (key: string, val: boolean) => {
    const next = new URLSearchParams(searchParams.toString());
    if (val) next.set(key, "true");
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };
  const setSort = (key: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (key === "nearest") next.delete("sort");
    else next.set("sort", key);
    router.push(`${pathname}?${next.toString()}`);
  };

  const list = withinRadius;
  const usingLive = !!coords;
  const nearestKm = filtered[0]?.effectiveDistanceKm;
  const geoBlocked = detectStatus === "denied" || detectStatus === "unavailable";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Pharmacies</span>
          </nav>
          <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">
            Pharmacies near {usingLive ? "you" : (area?.area ?? "your area")}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {isLoading ? (
              "Finding pharmacies near you…"
            ) : (
              <>
                <span>
                  {list.length} {list.length === 1 ? "pharmacy" : "pharmacies"} within{" "}
                  {radiusKm >= RADIUS_ALL ? "any distance" : `${radiusKm} km`}
                </span>
                {usingLive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3 w-3" />
                    Live location
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                    <MapPin className="h-3 w-3" />
                    {area?.area ?? "Area"}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="relative shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 text-sm shadow-soft outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary"
              aria-label={`Sort pharmacies. Current: ${sortDefs.find((s) => s.key === search.sort)?.label}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">
                Sort: {sortDefs.find((s) => s.key === search.sort)?.label}
              </span>
              <span className="sm:hidden">Sort</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort pharmacies by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortDefs.map((s) => {
                const active = search.sort === s.key;
                return (
                  <DropdownMenuItem
                    key={s.key}
                    onSelect={() => setSort(s.key)}
                    className={cn("gap-2", active && "font-medium")}
                  >
                    <Check
                      className={cn("h-4 w-4", active ? "opacity-100 text-primary" : "opacity-0")}
                      aria-hidden
                    />
                    {s.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {/* Location banner */}
      {!usingLive && (
        <div className="mt-6 rounded-2xl border border-border bg-surface-elevated p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {geoBlocked ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {geoBlocked
                    ? "Location access is unavailable"
                    : "Get the most accurate nearest pharmacies"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {geoBlocked
                    ? "No worries — pick your area or enter a landmark below to find nearby pharmacies."
                    : `Using your current position we'll show pharmacies within ${radiusKm} km — expandable if none are close.`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!geoBlocked && <LocationButton variant="row" />}
              <button
                onClick={() => setManualOpen((v) => !v)}
                aria-expanded={manualOpen}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-primary"
              >
                <MapPin className="h-4 w-4" />
                {manualOpen ? "Hide manual picker" : "Choose area / landmark"}
              </button>
            </div>
          </div>
          {(manualOpen || geoBlocked) && (
            <div className="mt-4 border-t border-border pt-4">
              <ManualLocationPicker onDone={() => setManualOpen(false)} />
            </div>
          )}
        </div>
      )}

      {/* Radius chips */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Radius</span>
        {RADIUS_STEPS.map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className={cn(
              "h-8 rounded-full border px-3 text-xs transition-colors",
              radiusKm === r
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-elevated hover:border-primary",
            )}
          >
            {r} km
          </button>
        ))}
        <button
          onClick={() => setRadius(RADIUS_ALL)}
          className={cn(
            "h-8 rounded-full border px-3 text-xs transition-colors",
            radiusKm >= RADIUS_ALL
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface-elevated hover:border-primary",
          )}
        >
          Any distance
        </button>
      </div>

      {/* Filter chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filterDefs.map((f) => {
          const active = search[f.key as keyof typeof search] as boolean;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key, !active)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated hover:border-primary",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <PharmacyCardSkeleton key={i} />)
        ) : list.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Store}
              title={
                filtered.length === 0
                  ? "No pharmacies match those filters"
                  : `No pharmacies within ${radiusKm} km`
              }
              hint={
                filtered.length === 0
                  ? "Try loosening the filters."
                  : nearestKm != null
                    ? `The nearest one is about ${nearestKm.toFixed(1)} km away.`
                    : "Try expanding your search radius."
              }
            />
            {filtered.length > 0 && nextRadius != null && (
              <div className="mx-auto mt-4 flex max-w-md flex-col items-center gap-2">
                <button
                  onClick={() => setRadius(nextRadius)}
                  className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
                >
                  {nextRadius >= RADIUS_ALL
                    ? "Show pharmacies at any distance"
                    : `Expand to ${nextRadius} km`}
                </button>
                <button
                  onClick={() => setRadius(RADIUS_ALL)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Or show everything
                </button>
              </div>
            )}
          </div>
        ) : (
          list.map((p, i) => (
            <PharmacyCard
              key={p.id}
              pharmacy={p}
              index={i}
              distanceKmOverride={p.effectiveDistanceKm}
              etaMinutesOverride={p.computedEtaMinutes}
              etaClosed={p.etaClosed}
              isOpenOverride={p.isOpen}
              showNearBadge
              loading={recomputing}
            />
          ))
        )}
      </div>
    </div>
  );
}
