'use client';
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, MapPin, ShieldCheck, Star, Zap } from "lucide-react";
import { useUI, useLocation } from "@/stores";
import { catalogService } from "@/services";
import { PLATFORM_LAUNCH_CONFIG } from "@/config/platform";

export function Hero() {
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const areaId = useLocation((s) => s.areaId);
  const areas = catalogService.areas();
  const area = areas.find((a) => a.id === areaId) ?? areas[0];

  return (
    <section className="relative overflow-hidden">
      {/* Soft green ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 0%, color-mix(in oklab, var(--primary-glow) 22%, transparent) 0%, transparent 60%), radial-gradient(50% 50% at 90% 20%, color-mix(in oklab, var(--mint) 30%, transparent) 0%, transparent 55%)",
        }}
      />
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-24 lg:px-8">
        <div className="flex flex-col justify-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 px-3 py-1 text-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-medium text-muted-foreground">
                Delivering to <span className="text-foreground">{area.area}, {area.city}</span>
              </span>
            </div>
          </div>

          <h1
            className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.25rem]"
          >
            Your trusted pharmacies,{" "}
            <span className="italic font-normal text-primary">right around the corner.</span>
          </h1>

          <p
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Discover verified pharmacies near you, compare prices, browse healthcare products, and
            order with confidence — from neighbourhood pharmacies who know you.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={() => setSearchOpen(true)}
              className="group flex min-h-14 flex-1 items-center gap-3 rounded-full border border-border bg-surface-elevated px-5 text-left shadow-soft transition-colors hover:border-primary"
            >
              <Search className="h-5 w-5 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground sm:text-base">
                Search medicines, pharmacies, categories…
              </span>
              <kbd className="hidden shrink-0 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </button>
            <a
              href="#nearby"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              <MapPin className="mr-2 h-4 w-4" /> Explore nearby
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Only licensed pharmacies</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {PLATFORM_LAUNCH_CONFIG.enableRatingDisplay ? (
                <span>4.8 average rating</span>
              ) : (
                <span>100% Genuine & Quality Checked</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {PLATFORM_LAUNCH_CONFIG.enableStoreCountDisplay ? (
                <>
                  <span className="font-semibold text-foreground">2,400+</span>
                  <span>pharmacies in your city</span>
                </>
              ) : (
                <span>Partnered with Certified Local Pharmacies</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Visual composition */}
        <div
          className="relative isolate mx-auto w-full max-w-lg"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border border-border bg-surface-elevated shadow-elevated">
            <Image
              src="/images/hero.jpg"
              alt="Pharmacist helping a patient in a modern setting"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -left-4 bottom-16 w-64 rounded-2xl border border-border glass-strong p-4 shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  VERIFIED PHARMACY
                </div>
                <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Madhapur Care Pharmacy &bull; 640m away</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Delivers in</span>
              <span className="font-semibold text-primary">18 minutes</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.55 }}
            className="absolute -right-2 top-10 w-52 rounded-2xl border border-border bg-surface-elevated p-4 shadow-elevated"
          >
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <Zap className="h-4 w-4 fill-current" />
              <span>Express Delivery</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              30-min express delivery with temperature-controlled & tamper-evident packaging.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
