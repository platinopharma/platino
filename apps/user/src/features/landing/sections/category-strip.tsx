'use client';

import { useEffect, useState, useRef } from "react";
import { getCategories, inferIconName } from "@/services/categoriesApi";
import { CategoryChip } from "@/components/product/category-chip";
import { SectionHeader } from "@/components/ui-parts/section-header";

export function CategoryStrip() {
  const [categories, setCategories] = useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getCategories();
      setCategories(data);
    }
    loadData();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const total = scrollWidth - clientWidth;
    if (total > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / total) * 100)));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [categories]);

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Shop by category"
        title="Everything for your health."
        hint="From daily medicines to seasonal essentials — organised the way you actually shop."
      />
      <div
        ref={scrollRef}
        className="thin-scrollbar-x swipe-x -mx-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-1"
        role="list"
        aria-label="Product categories"
      >
        {categories.map((c, i) => (
          <div key={c.id || c.slug} className="snap-start">
            <CategoryChip
              category={{
                id: c.slug || c.id,
                name: c.name,
                icon: c.iconName || inferIconName(c.name || c.slug),
                accent: "primary",
              }}
              index={i}
            />
          </div>
        ))}
      </div>

      {/* Dynamic Scroll Progress Bar */}
      {categories.length > 0 && (
        <div className="pt-1 flex flex-col items-center justify-center gap-1.5">
          <div className="w-44 sm:w-56 h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              style={{ width: `${Math.max(15, scrollProgress)}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
