'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  Store, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Navigation,
  Pill,
  ShoppingBag
} from 'lucide-react';
import { pharmacyService, productService } from '@/services';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui-parts/skeletons';
import { useLocation } from '@/stores';
import { formatDistance } from '@/lib/format';

export function NearestPharmacyShowcase() {
  const coords = useLocation((s) => s.coords);
  const areaId = useLocation((s) => s.areaId);

  // Fetch nearest pharmacy with priority on user coordinates
  const { data: nearestPharmacy, isLoading: isLoadingPharmacy } = useQuery({
    queryKey: ['nearest-pharmacy', coords?.lat, coords?.lng, areaId],
    queryFn: async () => {
      return pharmacyService.getNearest(coords);
    },
    staleTime: 30_000,
  });

  // Fetch in-stock medicines specifically belonging to this nearest pharmacy
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['nearest-pharmacy-products', nearestPharmacy?.id],
    queryFn: async () => {
      if (!nearestPharmacy?.id) return [];
      return productService.listByPharmacy(nearestPharmacy.id);
    },
    enabled: !!nearestPharmacy?.id,
    staleTime: 30_000,
  });

  if (isLoadingPharmacy) {
    return (
      <section className="my-8 rounded-3xl border border-border bg-surface-elevated p-6 shadow-sm">
        <div className="flex animate-pulse items-center justify-between pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-6 w-56 rounded bg-muted" />
          </div>
          <div className="h-8 w-24 rounded-full bg-muted" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!nearestPharmacy) {
    return null;
  }

  const inStockMedicines = products?.filter((p) => p.inStock) || [];
  const displayMedicines = inStockMedicines.slice(0, 8);

  return (
    <section className="my-10 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-surface to-background p-6 sm:p-8 shadow-md">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Nearest Dispensary
            </span>
            {nearestPharmacy.isOpen ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Open Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Closed
              </span>
            )}
          </div>

          <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight sm:text-3xl text-foreground">
            {nearestPharmacy.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span>{nearestPharmacy.address || nearestPharmacy.area || 'Authorized Partner Dispensary'}</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground bg-surface px-2.5 py-1 rounded-lg border border-border">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              <span>{formatDistance(nearestPharmacy.distanceKm)} away</span>
            </div>
            <div className="flex items-center gap-1 font-medium text-foreground bg-surface px-2.5 py-1 rounded-lg border border-border">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>~{nearestPharmacy.etaMinutes} mins delivery</span>
            </div>
            <div className="flex items-center gap-1 font-medium text-foreground bg-surface px-2.5 py-1 rounded-lg border border-border">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{nearestPharmacy.rating} ({nearestPharmacy.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/pharmacy/${nearestPharmacy.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Store className="h-4 w-4" />
            <span>Visit Pharmacy Store</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Available Products Shelf */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Available In Stock at {nearestPharmacy.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Directly fulfilled from this local pharmacy with fastest delivery
            </p>
          </div>
          {inStockMedicines.length > 4 && (
            <Link
              href={`/pharmacy/${nearestPharmacy.slug}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View all {inStockMedicines.length} products <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : displayMedicines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No live inventory listed for this location yet.</p>
            <Link
              href="/pharmacies"
              className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Browse other nearby licensed pharmacies →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayMedicines.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                pharmacyId={nearestPharmacy.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
