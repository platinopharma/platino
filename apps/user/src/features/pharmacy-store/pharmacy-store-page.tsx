'use client';
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { productService, pharmacyService } from "@/services";
import { ProductCardSkeleton } from "@/components/ui-parts/skeletons";
import { useRecent, useWishlist, useCart, useUI } from "@/stores";
import { formatDistance } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ReviewsBlock } from "./reviews-block";
import { PharmacyHeroHeader } from "./components/PharmacyHeroHeader";
import { PharmacyProductCard } from "./components/PharmacyProductCard";
import { PharmacyCartSidebar } from "./components/PharmacyCartSidebar";
import { PharmacyMapModal } from "./components/PharmacyMapModal";

const tabs = ["Products", "Reviews", "About", "Offers", "Delivery"] as const;

export function PharmacyStorePage({ params }: { params: { slug: string } }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Products");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const addViewed = useRecent((s) => s.addViewed);

  const { data: pharmacy, isLoading: isLoadingPharmacy } = useQuery({
    queryKey: ["pharmacy", params.slug],
    queryFn: () => pharmacyService.getBySlug(params.slug),
  });

  const hasWish = useWishlist((s) => (pharmacy ? s.hasPharmacy(pharmacy.id) : false));
  const toggleWish = useWishlist((s) => s.togglePharmacy);

  const { data: products, isLoading } = useQuery({
    queryKey: ["pharmacy-products", pharmacy?.id],
    queryFn: () => productService.listByPharmacy(pharmacy!.id),
    enabled: !!pharmacy?.id,
  });

  if (isLoadingPharmacy) {
    return (
      <div className="animate-pulse" role="status" aria-label="Loading pharmacy details">
        <div className="h-[38vh] min-h-[280px] w-full bg-muted md:h-[46vh]" />
        <div className="mx-auto -mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-40 rounded-3xl border border-border bg-surface-elevated p-6 shadow-elevated" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!pharmacy) return <div className="p-8 text-center text-muted-foreground">Pharmacy not found</div>;

  const availableCategories = useMemo(() => {
    const set = new Map<string, number>();
    (products ?? []).forEach((p) => set.set(p.category, (set.get(p.category) ?? 0) + 1));
    return Array.from(set.entries()).map(([id, count]) => ({ id, count }));
  }, [products]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        (p.composition ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, activeCategory, q]);
  
  const isFiltering = q.length > 0 || activeCategory !== null;

  const featured = products?.filter((p) => p.tags?.includes("featured")) ?? [];
  const bestsellers = products?.filter((p) => p.tags?.includes("bestseller")) ?? [];
  const discounts = products?.filter((p) => p.mrp - p.price >= 20) ?? [];
  const rx = products?.filter((p) => p.prescriptionRequired) ?? [];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      {/* 1. HERO LOCATION HEADER */}
      <PharmacyHeroHeader 
        pharmacy={pharmacy} 
        hasWish={hasWish} 
        toggleWish={toggleWish} 
        onOpenMapModal={() => setIsMapModalOpen(true)}
      />

      {/* Full-Screen Map Modal */}
      <PharmacyMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        pharmacy={pharmacy}
      />

      {/* 2. MAIN CONTENT LAYOUT (12-column grid) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 align-items-start">
          
          {/* Left Category Nav (2 cols on md+) */}
          <div className="md:col-span-3 lg:col-span-2 space-y-2 sticky top-24 self-start hidden md:block max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pb-6">
            <h3 className="font-display font-semibold text-foreground mb-4 px-2">Categories</h3>
            <button
              onClick={() => { setActiveCategory(null); setTab("Products"); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                activeCategory === null && tab === "Products"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              All Products
            </button>
            {availableCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveCategory(c.id); setTab("Products"); }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
                  activeCategory === c.id && tab === "Products"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {c.id.replace(/-/g, " ")} <span className="text-muted-foreground/70 font-normal text-xs ml-1">({c.count})</span>
              </button>
            ))}

            <div className="pt-6 pb-2">
              <h3 className="font-display font-semibold text-foreground mb-2 px-2">Store Info</h3>
              {tabs.filter(t => t !== "Products").map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    tab === t
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Category Nav (horizontal swipe) */}
          <div className="md:hidden col-span-1 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2 pb-2">
            <button
              onClick={() => { setActiveCategory(null); setTab("Products"); }}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeCategory === null && tab === "Products"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              All Products
            </button>
            {availableCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveCategory(c.id); setTab("Products"); }}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
                  activeCategory === c.id && tab === "Products"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {c.id.replace(/-/g, " ")}
              </button>
            ))}
            {tabs.filter(t => t !== "Products").map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  tab === t
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Center Product Grid (7 cols on lg+) */}
          <div className="col-span-1 md:col-span-9 lg:col-span-7 pb-12">
            
            {/* Sticky Sub-Header */}
            <div className="sticky top-0 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 backdrop-blur-md bg-background/90 border-b border-border mb-6">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setTab("Products"); }}
                  placeholder="Search medicines, brands, compositions…"
                  className="w-full rounded-2xl border border-border bg-card text-foreground pl-10 pr-10 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
            </div>

            {/* Tab Content */}
            {tab === "Products" && (
              <div>
                {isFiltering ? (
                  <div>
                    <div className="mb-4 flex items-baseline justify-between">
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {filtered.length} result{filtered.length === 1 ? "" : "s"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => { setQuery(""); setActiveCategory(null); }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                    {filtered.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                        No products match your search. Try a different keyword or category.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((p, i) => (
                          <PharmacyProductCard key={p.id} product={p} index={i} pharmacyId={pharmacy.id} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-10">
                    {featured.length > 0 && (
                      <ProductSection title="Featured" subtitle="Handpicked by the pharmacist" products={featured} pharmacyId={pharmacy.id} />
                    )}
                    {bestsellers.length > 0 && (
                      <ProductSection title="Best sellers" subtitle="What customers reorder" products={bestsellers} pharmacyId={pharmacy.id} />
                    )}
                    {discounts.length > 0 && (
                      <ProductSection title="Discounts" subtitle="Save on trusted brands" products={discounts} pharmacyId={pharmacy.id} />
                    )}
                    {rx.length > 0 && (
                      <ProductSection title="Prescription products" subtitle="Upload your prescription at checkout" products={rx} pharmacyId={pharmacy.id} />
                    )}
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-4">All products</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading
                          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                          : products?.map((p, i) => (
                            <PharmacyProductCard key={p.id} product={p} index={i} pharmacyId={pharmacy.id} />
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "Reviews" && <ReviewsBlock pharmacyId={pharmacy.id} pharmacyRating={pharmacy.rating} pharmacyReviewCount={pharmacy.reviewCount} />}

            {tab === "About" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Card title="Working hours" text={pharmacy.hours} />
                  <Card title="Delivery radius" text={`Serving customers within 5 km of ${pharmacy.area}, ${pharmacy.city}.`} />
                  <Card title="License" text={`Drug licence ${pharmacy.license} · Government of Telangana`} />
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="font-display text-lg font-bold text-foreground">FAQ</h3>
                    <dl className="mt-4 space-y-4 text-sm">
                      {[
                        { q: "Do you accept insurance?", a: "We currently accept insurance for prescription orders via reimbursement receipts." },
                        { q: "Can I return medicines?", a: "Medicines aren't eligible for easy returns. If a product is damaged, wrong, or expired, contact the pharmacy directly — refunds and replacements are handled per our Refund, Return & Cancellation Policy." },
                        { q: "How do you handle refrigerated products?", a: "Insulin and vaccines are shipped in insulated cold chain packaging." },
                      ].map((f) => (
                        <div key={f.q}>
                          <dt className="font-semibold text-foreground">{f.q}</dt>
                          <dd className="mt-1 text-muted-foreground">{f.a}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                        <MapPin className="h-5 w-5 text-primary" /> Store Location
                      </h3>
                      {pharmacy.distanceKm ? (
                        <span className="text-xs font-bold text-primary">{formatDistance(pharmacy.distanceKm)}</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{pharmacy.address || `${pharmacy.area || ""}, ${pharmacy.city || ""}`}</p>

                    {pharmacy.lat != null && pharmacy.lng != null ? (
                      <>
                        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
                          <iframe
                            title={`Store Location Map for ${pharmacy.name}`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            src={`https://maps.google.com/maps?q=${pharmacy.lat},${pharmacy.lng}&z=16&output=embed`}
                            className="h-full w-full border-0 filter dark:contrast-125 dark:brightness-90 opacity-90"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            GPS: {Number(pharmacy.lat).toFixed(4)}, {Number(pharmacy.lng).toFixed(4)}
                          </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}&destination_place_id=${encodeURIComponent(pharmacy.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90"
                          >
                            <Navigation className="h-3.5 w-3.5" /> Directions
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="h-32 w-full rounded-xl border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1.5 text-primary" /> Storefront map location unlisted
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-bold text-foreground">Gallery</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {pharmacy.gallery.map((g: string, i: number) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-xl bg-surface border border-border">
                          <Image src={g} alt="Store gallery" width={300} height={300} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "Offers" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {pharmacy.todaysOffer && <OfferCard title="Today's offer" text={pharmacy.todaysOffer} />}
                <OfferCard title="First order" text="Flat 20% off on your first order — code PLATINO20" />
                <OfferCard title="Free delivery" text={`Free delivery on orders above ₹${pharmacy.minOrder}`} />
                <OfferCard title="Refer a friend" text="Give ₹150, get ₹150 in Platino credit" />
              </div>
            )}

            {tab === "Delivery" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Card title="Delivery time" text={`~${pharmacy.etaMinutes} minutes to ${pharmacy.area}`} />
                <Card title="Delivery fee" text={pharmacy.deliveryFee === 0 ? "Free delivery" : `₹${pharmacy.deliveryFee}`} />
                <Card title="Minimum order" text={`₹${pharmacy.minOrder}`} />
                <Card title="Packaging" text="Tamper-proof, temperature-controlled where needed" />
              </div>
            )}
          </div>

          {/* Right Sticky Cart Sidebar (3 cols on lg+) */}
          <div className="hidden lg:block lg:col-span-3">
            <PharmacyCartSidebar pharmacy={pharmacy} products={products} />
          </div>

        </div>
      </div>

      {/* Show Bottom Sheet Cart for Mobile Only */}
      <div className="lg:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-card border-t border-border shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
           <PharmacyCartSidebar pharmacy={pharmacy} products={products} />
        </div>
      </div>

    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</div>
      <div className="mt-1.5 text-sm text-foreground font-medium">{text}</div>
    </div>
  );
}

function OfferCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-5 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</div>
      <div className="mt-2 font-display text-lg font-bold text-foreground leading-tight">{text}</div>
    </div>
  );
}

function ProductSection({
  title,
  subtitle,
  products,
  pharmacyId,
}: {
  title: string;
  subtitle: string;
  products: NonNullable<Awaited<ReturnType<typeof productService.listByPharmacy>>>;
  pharmacyId: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <PharmacyProductCard key={p.id} product={p} index={i} pharmacyId={pharmacyId} />
        ))}
      </div>
    </section>
  );
}
