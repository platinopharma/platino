'use client';

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { pharmacyService, productService } from "@/services";
import { MapPin, Navigation, Phone, Clock, ShieldCheck, Star, ArrowLeft, ExternalLink, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PharmacyDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("User denied location access")
      );
    }
  }, []);

  const { data: pharmacy, isLoading: loadingPharm } = useQuery({
    queryKey: ["pharmacy-detail", slug],
    queryFn: () => pharmacyService.getById(slug)
  });

  const { data: medicines = [], isLoading: loadingMeds } = useQuery({
    queryKey: ["pharmacy-medicines", slug],
    queryFn: () => productService.listByPharmacy(slug),
    enabled: !!slug
  });

  if (loadingPharm) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading pharmacy details…
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">Pharmacy Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested pharmacy store could not be loaded.</p>
        <Link href="/pharmacies" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to all pharmacies
        </Link>
      </div>
    );
  }

  const rawLat = pharmacy.lat ?? (pharmacy as any).latitude;
  const rawLng = pharmacy.lng ?? (pharmacy as any).longitude;
  const lat = rawLat != null ? Number(rawLat) : null;
  const lng = rawLng != null ? Number(rawLng) : null;
  const hasCoords = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);

  // Directions URL
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(pharmacy.name)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([pharmacy.name, pharmacy.address, pharmacy.city].filter(Boolean).join(", "))}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/pharmacies" className="hover:text-foreground">Pharmacies</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{pharmacy.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="mt-6 rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={pharmacy.logo || "https://placehold.co/100x100?text=Rx"}
              alt={pharmacy.name}
              className="h-20 w-20 rounded-2xl border border-border object-cover shadow-sm shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold sm:text-3xl">{pharmacy.name}</h1>
                {pharmacy.badges.includes("verified") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Licensed Partner
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{pharmacy.address}</p>
              
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                {pharmacy.rating && (
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-4 w-4 fill-current" /> {pharmacy.rating} ({pharmacy.reviewCount} reviews)
                  </span>
                )}
                {pharmacy.hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {pharmacy.hours}
                  </span>
                )}
                {pharmacy.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> {pharmacy.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Directions Navigation Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Navigation className="h-4 w-4" /> Get Directions
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* Geospatial Interactive Location Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Available Medicines ({medicines.length})</h2>
          {loadingMeds ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading medicines catalog…</div>
          ) : medicines.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface-elevated p-8 text-center text-sm text-muted-foreground">
              No inventory listed for this pharmacy dispensary yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {medicines.map((med) => (
                <div key={med.id} className="flex gap-4 rounded-2xl border border-border bg-surface-elevated p-4 transition-all hover:border-primary">
                  <img src={med.image} alt={med.name} className="h-16 w-16 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-sm text-foreground">{med.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{med.packSize}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold text-sm">{formatINR(med.price)}</span>
                      <Link href={`/product/${med.id}`} className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20">
                        <ShoppingBag className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Store Map Frame & Spatial Info Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Store Location
              </span>
              {pharmacy.distanceKm ? (
                <span className="text-xs font-semibold text-primary">{pharmacy.distanceKm} KM Away</span>
              ) : null}
            </div>

            {/* Embedded Google Maps Preview */}
            {hasCoords ? (
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-muted">
                <iframe
                  title={`Google Maps for ${pharmacy.name}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                  className="h-full w-full border-0 filter dark:contrast-125 dark:brightness-90 opacity-90"
                />
              </div>
            ) : (
              <div className="h-44 w-full rounded-2xl border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1.5 text-primary" /> Storefront map location unlisted
              </div>
            )}

            {hasCoords && (
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Latitude</span>
                  <span className="font-mono text-foreground font-medium">{lat!.toFixed(5)}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Longitude</span>
                  <span className="font-mono text-foreground font-medium">{lng!.toFixed(5)}</span>
                </div>
                {pharmacy.etaMinutes && (
                  <div className="flex justify-between pt-1">
                    <span>Est. Delivery Time</span>
                    <span className="font-medium text-foreground">{pharmacy.etaMinutes} mins</span>
                  </div>
                )}
              </div>
            )}

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Open Turn-By-Turn Navigation
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
