'use client';
import Link from 'next/link';
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useWishlist } from "@/stores";
import { productService, pharmacyService } from "@/services";
import { ProductCard } from "@/components/product/product-card";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { EmptyState } from "@/components/ui-parts/empty-state";

export function WishlistPageClient() {
  const productIds = useWishlist((s) => s.productIds);
  const pharmacyIds = useWishlist((s) => s.pharmacyIds);

  const { data: products } = useQuery({
    queryKey: ["wish-products", productIds.join(",")],
    queryFn: () => productService.getByIds(productIds),
    enabled: productIds.length > 0,
  });
  const { data: pharms } = useQuery({
    queryKey: ["wish-pharms", pharmacyIds.join(",")],
    queryFn: () => pharmacyService.getByIds(pharmacyIds),
    enabled: pharmacyIds.length > 0,
  });

  const empty = productIds.length === 0 && pharmacyIds.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Wishlist</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Your wishlist</h1>

      {empty ? (
        <div className="mt-10">
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            hint="Tap the heart on any pharmacy or product to save it for later."
            cta={{ to: "/pharmacies", label: "Discover pharmacies" }}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {pharms && pharms.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-medium">Saved pharmacies</h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pharms.map((p: NonNullable<typeof pharms>[number], i) => (
                  <PharmacyCard key={p.id} pharmacy={p} index={i} />
                ))}
              </div>
            </section>
          )}
          {products && products.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-medium">Saved products</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p: NonNullable<typeof products>[number], i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
