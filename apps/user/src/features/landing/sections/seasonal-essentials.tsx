'use client';
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui-parts/skeletons";
import { SectionHeader } from "@/components/ui-parts/section-header";

export function SeasonalEssentials() {
  const { data, isLoading } = useQuery({
    queryKey: ["products-seasonal"],
    queryFn: () => productService.listSeasonal(),
  });

  return (
    <section>
      <SectionHeader
        eyebrow="Seasonal picks"
        title="Monsoon essentials."
        hint="Cold, flu, hydration and immunity — stocked and ready."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
