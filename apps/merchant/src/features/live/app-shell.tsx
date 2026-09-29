"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { readStoreSnapshot, type StoreSnapshot } from "./data";
import { Toaster } from "./ui";
import { MandatoryGpsOverlay } from "./mandatory-gps-overlay";

export function AppShell({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<StoreSnapshot | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSnap(readStoreSnapshot());
  }, []);

  const name = snap?.pharmacyName?.trim() || "Your pharmacy";
  const city = snap?.city?.trim();

  return (
    <div className="flex min-h-dvh bg-paper text-ink antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-on-brand shadow-lg outline-none ring-2 ring-ring"
      >
        Skip to main content
      </a>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-line bg-paper-alt/40 lg:block">
        <AppSidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-paper">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-md border border-line bg-paper text-ink lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            suppressHydrationWarning
          >
            <Menu className="size-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-ink">
              {name}
              {city ? <span className="text-ink-muted"> · {city}</span> : null}
            </div>
          </div>

          <label className="hidden items-center gap-2 rounded-md border border-line bg-paper-alt/60 px-2.5 py-1.5 text-[12px] text-ink-muted focus-within:border-brand md:flex">
            <Search className="size-3.5" />
            <input
              type="search"
              aria-label="Global search across orders, medicines, and customers"
              placeholder="Search orders, medicines, customers…"
              className="w-72 bg-transparent text-ink placeholder:text-ink-subtle focus:outline-none"
            />
            <kbd className="ml-2 rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle">⌘K</kbd>
          </label>

          <span
            role="status"
            className="inline-flex items-center gap-1.5 rounded-full border border-signal/25 bg-signal/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-signal"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-signal opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
            </span>
            Live
          </span>
          <ThemeToggle />
          <Link
            href="/"
            className="hidden text-[11px] text-ink-subtle hover:text-ink sm:inline"
          >
            ↗ site
          </Link>
        </header>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 overflow-x-hidden focus:outline-none">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
      <MandatoryGpsOverlay />
      <Toaster />
    </div>
  );
}