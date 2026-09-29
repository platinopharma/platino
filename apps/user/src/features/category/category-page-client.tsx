'use client';
import Link from 'next/link';
import { useQuery } from "@tanstack/react-query";
import { productService, catalogService } from "@/services";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui-parts/skeletons";
import { RouteNotFound } from "@/components/ui-parts/route-boundaries";

export function CategoryPageClient({ slug }: { slug: string }) {
  const category = catalogService.categories().find((c) => c.id === slug);

  const { data, isLoading } = useQuery({
    queryKey: ["category", category?.id],
    queryFn: () => productService.listByCategory(category!.id),
    enabled: !!category,
  });

  if (!category) {
    return (
      <RouteNotFound
        title="Category not found"
        hint="This category doesn't exist or has been renamed."
        backTo="/"
        backLabel="Browse home"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">{category.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {data?.length ?? 0} verified products across nearby pharmacies
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
