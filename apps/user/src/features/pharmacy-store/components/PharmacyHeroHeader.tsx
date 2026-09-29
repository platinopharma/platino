'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Headphones, Phone, Navigation, Share2, Heart, ShieldCheck, AlertCircle, MapPin, Maximize2 } from "lucide-react";
import { formatDistance } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PharmacyHeroHeaderProps {
  pharmacy: any;
  hasWish: boolean;
  toggleWish: (id: string) => void;
  onOpenMapModal?: () => void;
}

export function PharmacyHeroHeader({ pharmacy, hasWish, toggleWish, onOpenMapModal }: PharmacyHeroHeaderProps) {
  const router = useRouter();

  const handleSupport = () => {
    const ticketId = `TKT-PHARM-${Math.floor(10000 + Math.random() * 90000)}`;
    router.push(`/support/${ticketId}?pharmacy=${encodeURIComponent(pharmacy.name || "Local Partnered Chemist")}`);
  };

  const handleCall = () => {
    if (pharmacy.phone) window.open(`tel:${pharmacy.phone}`);
    else toast.info("Phone contact unlisted for this store.");
  };

  const handleDirections = () => {
    const lat = pharmacy.lat ?? pharmacy.latitude;
    const lng = pharmacy.lng ?? pharmacy.longitude;
    if (lat != null && lng != null) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(pharmacy.name || "Pharmacy")}`, '_blank');
    } else {
      toast.info("Pharmacy store location coordinates unlisted.");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Pharmacy store link copied to clipboard.");
    }
  };

  const rawLat = pharmacy.lat ?? pharmacy.latitude;
  const rawLng = pharmacy.lng ?? pharmacy.longitude;
  const lat = rawLat != null ? Number(rawLat) : null;
  const lng = rawLng != null ? Number(rawLng) : null;
  const hasCoordinates = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
  const hasLogo = pharmacy.logo && !pharmacy.logo.includes("Logo");

  return (
    <div className="relative w-full bg-surface pb-6">
      {/* ── 1. Pharmacy Location & Interactive Map Preview Bar ── */}
      <div
        onClick={onOpenMapModal}
        className="relative h-40 md:h-48 w-full overflow-hidden bg-card border-b border-border cursor-pointer group"
      >
        {hasCoordinates ? (
          <iframe
            title={`Map preview for ${pharmacy.name}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
            className="w-full h-full border-0 pointer-events-none filter dark:contrast-125 dark:brightness-90 opacity-90 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-xs text-muted-foreground font-medium">
            <MapPin className="w-4 h-4 mr-1.5 text-primary" /> Location map unlisted
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />

        {/* Hover overlay hint */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-md text-xs font-bold text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>View Location Map</span>
        </div>
      </div>

      {/* ── 2. Store Info Card Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-card rounded-2xl p-5 md:p-6 shadow-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            {/* Logo */}
            {hasLogo ? (
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-md p-1">
                <div className="relative h-full w-full rounded-xl overflow-hidden bg-surface">
                  <Image src={pharmacy.logo} alt={pharmacy.name || "Local Partnered Chemist"} fill className="object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl border-2 border-primary/20 bg-primary/10 shadow-md flex items-center justify-center p-1">
                <div className="flex h-full w-full items-center justify-center rounded-xl text-2xl md:text-3xl font-black text-primary uppercase">
                  {(pharmacy.name || "Local Partnered Chemist").charAt(0) || 'P'}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight capitalize">
                  {pharmacy.name || "Local Partnered Chemist"}
                </h1>
                {pharmacy.badges?.includes("verified") && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
                {pharmacy.rating && (
                  <>
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-bold text-xs px-2 py-0.5 rounded-md">
                      Rating: {pharmacy.rating}
                    </span>
                    {pharmacy.reviewCount ? (
                      <span className="text-muted-foreground/70 font-medium">({pharmacy.reviewCount} reviews)</span>
                    ) : null}
                    <span className="text-border">&bull;</span>
                  </>
                )}
                <span className="truncate max-w-[14rem] flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary inline" />
                  {pharmacy.distanceKm ? formatDistance(pharmacy.distanceKm) : (pharmacy.area || pharmacy.city || 'Local Store')}
                </span>
                {pharmacy.hours && (
                  <>
                    <span className="text-border">&bull;</span>
                    <span className="font-medium text-foreground">{pharmacy.hours}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Action Buttons: Support, Call, Share, Wishlist ── */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleSupport}
              aria-label="Contact Support"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-all hover:bg-foreground/90 shadow-sm flex-1 md:flex-none justify-center"
            >
              <Headphones className="h-4 w-4" /> Support
            </button>

            <button
              onClick={handleCall}
              aria-label="Call Pharmacy"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:border-border-strong shadow-sm flex-1 md:flex-none justify-center"
            >
              <Phone className="h-4 w-4 text-primary" /> Call
            </button>

            <div className="flex items-center gap-2 w-full md:w-auto justify-start mt-2 md:mt-0">
              <button
                onClick={handleDirections}
                aria-label="Get Directions to pharmacy"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground shadow-sm"
              >
                <Navigation className="h-4 w-4 text-primary" />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share pharmacy link"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground shadow-sm"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              {/* Wishlist Heart Toggle */}
              <button
                onClick={() => toggleWish(pharmacy.id)}
                aria-label={hasWish ? "Remove pharmacy from wishlist" : "Add pharmacy to wishlist"}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors shadow-sm cursor-pointer",
                  hasWish
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4 transition-transform active:scale-125", hasWish && "fill-rose-500 text-rose-500")} />
              </button>
            </div>
          </div>
        </div>

        {/* Closed Banner */}
        {!pharmacy.isOpen && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-amber-500 leading-relaxed">
              Closed &bull; Opens at 9:00 AM. Orders placed now will be processed when the store opens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
