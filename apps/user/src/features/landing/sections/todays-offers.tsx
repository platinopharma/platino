'use client';
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui-parts/skeletons";
import { SectionHeader } from "@/components/ui-parts/section-header";

export function TodaysOffers() {
  const { data, isLoading } = useQuery({
    queryKey: ["offers-today"],
    queryFn: () => productService.listOffers(),
  });

  return (
    <section>
      <SectionHeader
        eyebrow="Today's offers"
        title="Save more on essentials."
        hint="Limited-time discounts from your neighbourhood pharmacies."
        actionTo="/pharmacies"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
