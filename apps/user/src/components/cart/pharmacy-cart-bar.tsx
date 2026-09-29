'use client';
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart, useUI } from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { formatINR } from "@/lib/format";
import type { Pharmacy, Product } from "@/lib/types";

interface PharmacyCartBarProps {
  pharmacy: Pharmacy;
  products?: Product[];
}

export function PharmacyCartBar({ pharmacy, products = [] }: PharmacyCartBarProps) {
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const isHydrated = useHydrated();

  if (!isHydrated) return null;

  // Filter lines specifically belonging to this pharmacy
  const pharmacyLines = lines.filter((l) => l.pharmacyId === pharmacy.id);
  const totalItemCount = pharmacyLines.reduce((acc, l) => acc + l.quantity, 0);

  if (pharmacyLines.length === 0) return null;

  // Calculate subtotal for this pharmacy
  const subtotal = pharmacyLines.reduce((acc, l) => {
    const prod = products.find((p) => p.id === l.productId);
    const unitPrice =
      l.unitPrice ??
      (l.unitType === "tablet"
        ? (prod?.tabletPrice || (prod?.price ? prod.price / (prod.unitsPerStrip || 10) : 0))
        : (prod?.stripPrice || prod?.price || 0));
    return acc + unitPrice * l.quantity;
  }, 0);

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Current pharmacy cart summary"
        role="region"
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-4xl rounded-2xl border border-primary/30 bg-background/95 p-3.5 shadow-2xl backdrop-blur-xl md:bottom-6 sm:p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Pharmacy info & items count */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-trust px-1 text-[10px] font-bold text-white shadow">
                {totalItemCount}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                  {pharmacy.name}
                </span>
                <span className="rounded-full bg-trust/15 px-2 py-0.5 text-[10px] font-bold text-trust">
                  Stock Reserved
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-base font-bold text-foreground sm:text-lg">
                  {formatINR(subtotal)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pharmacyLines.length} product{pharmacyLines.length > 1 ? "s" : ""}, {totalItemCount} unit{totalItemCount > 1 ? "s" : ""})
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-surface-elevated px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-secondary"
            >
              View Cart
            </button>

            <Link
              href="/checkout"
              className="flex-1 sm:flex-initial inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
            >
              Checkout
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
