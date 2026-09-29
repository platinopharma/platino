"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCategories, Category } from "@/services/categoriesApi";
import {
  Thermometer,
  Stethoscope,
  Zap,
  Activity,
  Syringe,
  Heart,
  ShieldAlert,
  Droplets,
  Pill,
  Sparkles,
  Baby,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Cross,
  FileText,
  HeartPulse,
  Eye,
  RefreshCw,
} from "lucide-react";

// Icon mapping dictionary matching quick-commerce category types
const ICON_MAP: Record<string, React.ElementType> = {
  Thermometer,
  Stethoscope,
  Zap,
  Activity,
  Syringe,
  Heart,
  ShieldAlert,
  Droplets,
  Pill,
  Sparkles,
  Baby,
  UserCheck,
  Cross,
  FileText,
  HeartPulse,
  Eye,
};

interface DynamicCategoriesProps {
  className?: string;
}

export function DynamicCategories({ className }: DynamicCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams?.get("category") || "";

  const loadCategoriesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching active categories:", err);
      setError("Unable to load health categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategoriesData();
  }, [loadCategoriesData]);

  // Handle horizontal scroll & calculate progress percentage
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScrollable = scrollWidth - clientWidth;
    if (totalScrollable > 0) {
      const percentage = Math.min(100, Math.max(0, (scrollLeft / totalScrollable) * 100));
      setScrollProgress(percentage);
    } else {
      setScrollProgress(100);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollContainer = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 260;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/search?category=${encodeURIComponent(categorySlug)}`);
  };

  return (
    <section className={cn("w-full py-4 space-y-6", className)}>
      {/* ── Instamart / Blinkit Minimalist Section Header ── */}
      <div className="flex items-end justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase block mb-1">
            Shop by category
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Everything for your health.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            From daily medicines to seasonal essentials — organized the way you actually shop.
          </p>
        </div>

        {/* Desktop Carousel Arrow Buttons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => scrollContainer("left")}
            aria-label="Scroll left"
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-xs active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollContainer("right")}
            aria-label="Scroll right"
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-xs active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Loading Skeleton Cards ── */}
      {isLoading && (
        <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="min-w-[110px] max-w-[120px] h-[130px] p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-3 animate-pulse shrink-0"
            >
              <div className="w-13 h-13 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-16 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error State ── */}
      {!isLoading && error && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300">{error}</p>
          <button
            onClick={loadCategoriesData}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !error && categories.length === 0 && (
        <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs">No active inventory categories found.</p>
        </div>
      )}

      {/* ── Quick-Commerce Instamart Card Carousel ── */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="relative space-y-4">
          <div
            ref={scrollRef}
            className="flex gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
            role="list"
            aria-label="Health categories"
          >
            {categories.map((cat) => {
              const IconComponent = (cat.iconName && ICON_MAP[cat.iconName]) || Pill;
              const isSelected = selectedSlug === cat.slug;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCategoryClick(cat.slug);
                    }
                  }}
                  className={cn(
                    "snap-start group relative min-w-[110px] sm:min-w-[120px] max-w-[125px] h-[130px] p-3 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 select-none shrink-0",
                    "bg-white dark:bg-zinc-900 border",
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                      : "border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/60 hover:scale-[1.03] hover:shadow-md"
                  )}
                >
                  {/* Soft Circular Icon Container */}
                  <div className="w-13 h-13 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200 shadow-xs">
                    <IconComponent className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                  </div>

                  {/* Concise Category Title */}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors px-1">
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Custom Scroll Progress Bar Indicator ── */}
          <div className="pt-1 flex flex-col items-center justify-center gap-1.5">
            <div className="w-44 sm:w-56 h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${Math.max(15, scrollProgress)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:hidden">
              Swipe to see more →
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
