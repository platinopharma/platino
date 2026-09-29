"use client";
import Link from 'next/link';
import Image from 'next/image';

import { JoinWizard } from "@/components/site/join-wizard";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Suspense } from "react";

export default function OnboardingPage() {
  return (
    <main className="min-h-dvh bg-paper font-sans text-ink antialiased">
      {/* Enterprise Unified Chrome - Perfectly matching landing SiteNav dimensions (h-16 max-w-7xl px-6) */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-12 w-auto shrink-0 items-center">
              <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
            </span>
            <span className="font-mono text-[13px] font-semibold tracking-[0.14em] text-ink">
              PLATINO<span className="text-brand">PHARMA</span>
            </span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="hidden font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink-subtle lg:inline">
              Partner Onboarding Portal
            </span>
            
            <ThemeToggle />

            {/* Direct transition for existing partners to prevent friction */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-md border border-brand/40 bg-brand/10 px-3.5 py-2 text-[12px] font-semibold text-brand hover:bg-brand/20 transition-all shadow-xs"
            >
              Already a Partner? Sign in
            </Link>

            <a
              href="mailto:partners@platinopharma.com"
              aria-label="Contact clinical partner support"
              className="hidden items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[12px] font-medium text-paper transition-colors hover:bg-brand-ink md:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              Support
            </a>

            <Link
              href="/"
              aria-label="Exit onboarding back to homepage"
              className="inline-flex min-h-9 items-center rounded-md border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:bg-hover hover:text-ink"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10">
        <Suspense>
          <JoinWizard />
        </Suspense>
      </div>

      <footer className="border-t border-line mt-auto py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center text-xs text-ink-subtle sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} Platino Pharmacy Platform · Medical records protected under HIPAA & DISHA clinical encryption standards</span>
          <div className="flex flex-wrap gap-5 font-medium">
            <Link href="/legal/privacy-policy" className="hover:text-ink transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms-and-conditions" className="hover:text-ink transition-colors">Terms of Use</Link>
            <Link href="/legal/pharmacy-partner-agreement" className="hover:text-ink transition-colors">Partner Agreement</Link>
            <Link href="/legal/grievance-redressal" className="hover:text-ink transition-colors">Grievance Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
