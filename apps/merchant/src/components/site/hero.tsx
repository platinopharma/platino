"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardMock } from "./dashboard-mock";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20">
      {/* Soft ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--brand) 10%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
        <motion.div
          animate={{ y: 0 }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="max-w-xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-3 py-1 backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Platino Pharma · Partner Platform
            </span>
          </div>
          <h1 className="text-balance font-display text-5xl font-semibold leading-[1.02] tracking-[-0.02em] text-ink md:text-6xl lg:text-[64px]">
            Digital Pharmacy Platform for <span className="text-brand">Modern Medical Stores</span>
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-lg text-ink-muted">
            Join a network of verified pharmacies. Receive online orders, manage inventory in real time,
            increase revenue and reach more customers — all from one powerful platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/onboarding?new=true"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-6 text-[14px] font-semibold text-paper transition-colors hover:bg-brand-ink shadow-sm"
            >
              Become a Partner
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#book-demo"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-paper/70 px-5 py-3 text-sm font-medium text-ink backdrop-blur hover:bg-hover"
            >
              Book a Demo
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              { k: "Uptime", v: "99.99%" },
              { k: "Median sync", v: "0.4s" },
              { k: "Support SLA", v: "<15m" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">{s.k}</dt>
                <dd className="mt-1 font-display text-2xl text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
          className="lg:pl-4"
        >
          <DashboardMock compact />
        </motion.div>
      </div>
    </section>
  );
}