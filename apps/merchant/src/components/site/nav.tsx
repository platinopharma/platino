"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Customers", href: "#customers" },
  { label: "FAQ", href: "#faq" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-12 w-auto items-center">
            <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-[0.14em] text-ink">
            PLATINO<span className="text-brand">PHARMA</span>
          </span>
        </a>
        <div className="hidden items-center gap-5 lg:flex lg:gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/login"
            className="hidden rounded-md px-3 py-2 text-[13px] font-medium text-ink-muted hover:text-ink lg:inline-flex"
          >
            Sign in
          </a>
          <Link
            href="/onboarding?new=true"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-md bg-ink px-3 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-brand-ink sm:inline-flex sm:px-4 sm:gap-2"
          >
            <span>Become a Partner</span>
            <span aria-hidden>→</span>
          </Link>
          <button
            type="button"
            suppressHydrationWarning
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-md border border-line bg-paper text-ink lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden">
          <button
            type="button"
            suppressHydrationWarning
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-ink/40 backdrop-blur-[2px]"
          />
          <div className="fixed inset-x-0 top-16 z-50 border-b border-line bg-paper shadow-lg">
            <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
              <ul className="flex flex-col">
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-line py-3.5 text-[15px] font-medium text-ink hover:text-brand"
                    >
                      <span>{l.label}</span>
                      <span aria-hidden className="font-mono text-[11px] text-ink-subtle">→</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col gap-2.5">
                <Link
                  href="/onboarding?new=true"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium text-paper hover:bg-brand-ink"
                >
                  Become a Partner <span aria-hidden>→</span>
                </Link>
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-md border border-line px-4 py-2.5 text-[13px] font-medium text-ink-muted hover:text-ink"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}