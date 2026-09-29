'use client';
import Link from 'next/link';
import { useQuery } from "@tanstack/react-query";
import { productService, pharmacyService } from "@/services";
import { ProductCard } from "@/components/product/product-card";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { EmptyState } from "@/components/ui-parts/empty-state";
import { Search, Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { catalogService } from "@/services";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || searchParams.get("category_slug") || "";
  const [category, setCategory] = useState<string>(categoryParam);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState<string>("price_asc");
  const [rxReq, setRxReq] = useState<string>("");

  useEffect(() => {
    if (categoryParam !== category) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, category, minPrice, maxPrice, sort, rxReq],
    queryFn: async () => {
      const filters = {
        category: category || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        sort: sort || undefined,
        prescriptionRequired: rxReq === "true" ? true : rxReq === "false" ? false : undefined,
      };
      const [products, pharms] = await Promise.all([
        productService.search(q, filters),
        pharmacyService.search(q), // pharmacies API doesn't use these product filters yet
      ]);
      return { products, pharms };
    },
    enabled: q.length > 0 || category.length > 0,
  });

  const { data: popularData } = useQuery({
    queryKey: ["popular-products"],
    queryFn: () => productService.listPopular(),
    enabled: !!q && (data?.products.length ?? 0) === 0 && !isLoading,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Search</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">
        Results for &ldquo;<span className="text-primary">{q}</span>&rdquo;
      </h1>

      {!q && !category ? (
        <div className="mt-10">
          <EmptyState
            icon={Search}
            title="Start typing to search"
            hint="Press ⌘K anywhere to search medicines, pharmacies, and categories."
          />
        </div>
      ) : (data?.products.length ?? 0) + (data?.pharms.length ?? 0) === 0 && !isLoading ? (
        <div className="mt-10 space-y-12">
          <EmptyState
            icon={Search}
            title="Nothing matched"
            hint="Try adjusting your filters, or browse popular medicines below."
            cta={{ to: "/pharmacies", label: "Browse pharmacies" }}
          />
          {popularData && popularData.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-medium">Popular Medicines</h2>
              <p className="text-sm text-muted-foreground mb-4">You might be looking for these instead:</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {popularData.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6 rounded-2xl border border-border bg-surface p-5 h-fit">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="font-display font-medium">Filters & Sort</h2>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Sort By</label>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">All Categories</option>
                {catalogService.categories().map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-muted-foreground">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Prescription</label>
              <select 
                value={rxReq} 
                onChange={(e) => setRxReq(e.target.value)}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Any</option>
                <option value="true">Required</option>
                <option value="false">Not Required (OTC)</option>
              </select>
            </div>
            
            <button 
              onClick={() => { setCategory(""); setMinPrice(""); setMaxPrice(""); setSort("price_asc"); setRxReq(""); }}
              className="w-full text-sm text-primary hover:underline mt-2"
            >
              Clear Filters
            </button>
          </aside>

          {/* Results Area */}
          <div className="flex-1 space-y-12">
            {data?.pharms.length ? (
              <section>
                <h2 className="font-display text-xl font-medium">Pharmacies</h2>
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                  {data.pharms.map((p, i) => (
                    <PharmacyCard key={p.id} pharmacy={p} index={i} />
                  ))}
                </div>
              </section>
            ) : null}
            {data?.products.length ? (
              <section>
                <h2 className="font-display text-xl font-medium">Medicines & products</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
                  {data.products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
