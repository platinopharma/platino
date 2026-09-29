'use client';
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Store, Pill, CircleDot } from "lucide-react";
import Link from 'next/link';
import { useQuery } from "@tanstack/react-query";
import { useCart, useUI, getCartCatalogKey } from "@/stores";
import { productService, pharmacyService } from "@/services";
import { formatINR } from "@/lib/format";
import { drawerSpring } from "@/lib/motion";
import { EmptyState } from "@/components/ui-parts/empty-state";
import { useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const { data: catalog } = useQuery({
    queryKey: getCartCatalogKey(lines),
    queryFn: async () => {
      const productIds = Array.from(new Set(lines.map((l) => l.productId)));
      const pharmacyIds = Array.from(new Set(lines.map((l) => l.pharmacyId)));
      const [products, pharmacies] = await Promise.all([
        productService.getByIds(productIds),
        pharmacyService.getByIds(pharmacyIds),
      ]);
      return { products, pharmacies };
    },
    enabled: open && lines.length > 0,
  });

  const getLinePrice = (l: typeof lines[0], p: { stripPrice?: number; tabletPrice?: number; price: number; unitsPerStrip?: number } | undefined) => {
    if (!p) return 0;
    if (l.unitType === "tablet") {
      const perTab = p.tabletPrice || (p.unitsPerStrip ? Number((p.price / p.unitsPerStrip).toFixed(2)) : p.price);
      return perTab * l.quantity;
    }
    return (p.stripPrice || p.price) * l.quantity;
  };

  const grouped = lines.reduce<Record<string, typeof lines>>((acc, l) => {
    (acc[l.pharmacyId] ||= []).push(l);
    return acc;
  }, {});

  const subtotal = lines.reduce((sum, l) => {
    const p = catalog?.products.find((x) => x?.id === l.productId);
    return sum + getLinePrice(l, p);
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={drawerSpring}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface-elevated shadow-elevated"
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="font-display text-xl">Your cart</h2>
                <p className="text-xs text-muted-foreground">
                  {lines.length === 0
                    ? "Nothing here yet"
                    : `${lines.length} item${lines.length > 1 ? "s" : ""} from ${Object.keys(grouped).length
                    } pharmac${Object.keys(grouped).length > 1 ? "ies" : "y"}`}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  hint="Discover local pharmacies and add products to get started."
                  cta={{ to: "/pharmacies", label: "Browse pharmacies" }}
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([pharmacyId, group]) => {
                    const ph = catalog?.pharmacies.find((x) => x?.id === pharmacyId);
                    const groupTotal = group.reduce((s, l) => {
                      const p = catalog?.products.find((x) => x?.id === l.productId);
                      return s + getLinePrice(l, p);
                    }, 0);
                    return (
                      <div key={pharmacyId} className="rounded-2xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/pharmacy/${ph?.slug || ph?.id || pharmacyId}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <Store className="size-4" /> <span>{ph?.name || "Partner Pharmacy"}</span>
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            ~{ph?.etaMinutes || 30} min · {ph?.deliveryFee === 0 ? "Free" : formatINR(ph?.deliveryFee ?? 40)}
                          </span>
                        </div>
                        <div className="mt-3 space-y-3">
                          {group.map((l) => {
                            const p = catalog?.products.find((x) => x?.id === l.productId);
                            if (!p) return null;
                            const isTablet = l.unitType === "tablet";
                            const itemPrice = getLinePrice(l, p);
                            const unitsPerStrip = p.unitsPerStrip || 10;

                            return (
                              <div key={`${l.productId}-${l.unitType || "strip"}`} className="flex items-center gap-3">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <Link
                                    href={`/product/${p.id}`}
                                    onClick={() => setOpen(false)}
                                    className="truncate text-sm font-medium hover:text-primary block"
                                  >
                                    {p.name}
                                  </Link>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                                        isTablet
                                          ? "bg-primary/10 text-primary border border-primary/20"
                                          : "bg-secondary text-secondary-foreground"
                                      )}
                                    >
                                      {isTablet ? (
                                        <span className="flex items-center gap-1"><CircleDot className="size-3" /> {l.quantity} Loose Tab{l.quantity > 1 ? "s" : ""}</span>
                                      ) : (
                                        <span className="flex items-center gap-1"><Pill className="size-3" /> {l.quantity} Strip{l.quantity > 1 ? "s" : ""} ({l.quantity * unitsPerStrip} tabs)</span>
                                      )}
                                    </span>
                                  </div>

                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="flex items-center rounded-full border border-border">
                                      <button
                                        onClick={() =>
                                          setQty(l.productId, l.pharmacyId, l.quantity - 1, p.stock, l.unitType)
                                        }
                                        aria-label="Decrease quantity"
                                        className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                                      >
                                        <Minus className="h-3.5 w-3.5" />
                                      </button>
                                      <motion.span
                                        key={l.quantity}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-6 text-center text-xs font-semibold"
                                      >
                                        {l.quantity}
                                      </motion.span>
                                      <button
                                        onClick={() => {
                                          if (p.stock && l.quantity >= p.stock) {
                                            toast.error(`Only ${p.stock} in stock at this pharmacy`);
                                            return;
                                          }
                                          setQty(l.productId, l.pharmacyId, l.quantity + 1, p.stock, l.unitType);
                                        }}
                                        aria-label="Increase quantity"
                                        className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => {
                                        remove(l.productId, l.pharmacyId, l.unitType);
                                        toast.info(`${p.name} removed from cart`);
                                      }}
                                      aria-label="Remove item"
                                      className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-sm">{formatINR(itemPrice)}</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {isTablet ? `${formatINR(p.tabletPrice || (p.price / unitsPerStrip))}/tab` : `${formatINR(p.stripPrice || p.price)}/strip`}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                          <Link
                            href={`/pharmacy/${ph?.slug || ph?.id || pharmacyId}`}
                            onClick={() => setOpen(false)}
                            className="text-primary hover:underline font-medium"
                          >
                            + Add more from this pharmacy
                          </Link>
                          <span className="font-semibold">Subtotal: {formatINR(groupTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-border bg-surface-elevated px-6 py-5 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-2xl font-semibold">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold hover:border-primary transition-colors"
                  >
                    View Full Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="flex h-11 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01]"
                  >
                    Checkout
                  </Link>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
