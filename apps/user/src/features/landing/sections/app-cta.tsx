'use client';
import Image from "next/image";
import { motion } from "framer-motion";
import { Apple, PlayCircle } from "lucide-react";

export function AppCta() {
  return (
    <section className="overflow-hidden rounded-[36px] border border-border bg-primary text-primary-foreground">
      <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/80">
            Coming soon to iOS and Android
          </div>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            Platino Pharma, in your pocket.
          </h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Order in seconds, track live, and get pharmacy-level care from anywhere. Sign up for
            early access.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/20">
              <Apple className="h-5 w-5" /> App Store
            </button>
            <button className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/20">
              <PlayCircle className="h-5 w-5" /> Google Play
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto aspect-[4/3] w-full max-w-md"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-glow/60 via-mint/40 to-transparent blur-2xl" />
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <Image
              src="/images/app-cta.jpg"
              alt="Platino Pharmacy App"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
