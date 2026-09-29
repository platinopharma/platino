'use client';
import Link from 'next/link';
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag, Pill, CircleDot } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCart, getCartCatalogKey } from "@/stores";
import { productService, pharmacyService } from "@/services";
import { formatINR } from "@/lib/format";
import { EmptyState } from "@/components/ui-parts/empty-state";
import { FreeShippingBar } from "./free-shipping-bar";
import { BundleUpsell } from "./bundle-upsell";
import { cn } from "@/lib/utils";

export function CartPageClient() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);

  const { data } = useQuery({
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
    enabled: lines.length > 0,
  });

  const grouped = lines.reduce<Record<string, typeof lines>>((acc, l) => {
    (acc[l.pharmacyId] ||= []).push(l);
    return acc;
  }, {});

  const getLinePrice = (l: typeof lines[0], p: NonNullable<typeof data>["products"][number] | undefined) => {
    if (!p) return 0;
    if (l.unitType === "tablet") {
      const perTab = p.tabletPrice || (p.unitsPerStrip ? Number((p.price / p.unitsPerStrip).toFixed(2)) : p.price);
      return perTab * l.quantity;
    }
    return (p.stripPrice || p.price) * l.quantity;
  };

  const subtotal = lines.reduce((s, l) => {
    const p = data?.products.find((x) => x?.id === l.productId);
    return s + getLinePrice(l, p);
  }, 0);

  const deliveryTotal = data?.pharmacies.reduce((s, p) => s + (p?.deliveryFee ?? 0), 0) ?? 0;

  const handleRemove = (line: typeof lines[number], p: NonNullable<typeof data>["products"][number]) => {
    if (!p) return;
    remove(line.productId, line.pharmacyId, line.unitType);
    toast.info(`Removed ${p.name} (${line.unitType === "tablet" ? "Loose Tabs" : "Strips"}) from cart`, {
      action: {
        label: "Undo",
        onClick: () => {
          add(line.productId, line.pharmacyId, line.quantity, p.stock, line.unitType);
          toast.success(`Restored ${p.name}`);
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/`} className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Cart</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Your cart</h1>

      {lines.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            hint="Discover verified pharmacies near you and start adding products."
            cta={{ to: "/pharmacies", label: "Browse pharmacies" }}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <FreeShippingBar currentSubtotal={subtotal} />
            <BundleUpsell cartProductIds={lines.map(l => l.productId)} onAddProduct={(id) => add(id, lines[0]?.pharmacyId, 1, 99)} />
            
            {Object.entries(grouped).map(([pid, group]) => {
              const ph = data?.pharmacies.find((x) => x?.id === pid);
              return (
                <motion.div
                  key={pid}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-border bg-surface-elevated p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {ph?.logo ? (
                        <Image
                          src={ph.logo}
                          alt={`${ph.name || "Pharmacy"} logo`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/pharmacy/${ph?.slug || ph?.id || pid}`}
                          className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                          {ph?.name || "Local Licensed Pharmacy"}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          Delivers in ~{ph?.etaMinutes || 30} min ·{" "}
                          {ph?.deliveryFee === 0 ? "Free delivery" : `₹${ph?.deliveryFee || 40} delivery`}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/pharmacy/${ph?.slug || ph?.id || pid}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      + Add more items
                    </Link>
                  </div>
                  <div className="mt-5 space-y-4">
                    {group.map((l) => {
                      const p = data?.products.find((x) => x?.id === l.productId);
                      if (!p) return null;
                      const isTablet = l.unitType === "tablet";
                      const linePrice = getLinePrice(l, p);
                      const unitsPerStrip = p.unitsPerStrip || 10;
                      return (
                        <div key={`${l.productId}-${l.unitType || "strip"}`} className="flex items-center gap-4">
                          <Link href={`/product/${p.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                            <Image src={p.image} alt={p.name || "Product image"} fill sizes="64px" className="h-full w-full object-cover" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link href={`/product/${p.id}`} className="truncate text-sm font-medium hover:text-primary block">
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                                  isTablet
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-secondary text-secondary-foreground"
                                )}
                              >
                                {isTablet ? (
                                  <span className="flex items-center gap-1"><CircleDot className="size-3" /> {l.quantity} Loose Tablet{l.quantity > 1 ? "s" : ""}</span>
                                ) : (
                                  <span className="flex items-center gap-1"><Pill className="size-3" /> {l.quantity} Strip{l.quantity > 1 ? "s" : ""} ({l.quantity * unitsPerStrip} tabs)</span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isTablet ? `@ ${formatINR(p.tabletPrice || (p.price / unitsPerStrip))}/tab` : `@ ${formatINR(p.stripPrice || p.price)}/strip`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center rounded-full border border-border">
                            <button
                              onClick={() => setQty(l.productId, l.pharmacyId, l.quantity - 1, p.stock, l.unitType)}
                              aria-label="Decrease quantity"
                              className="grid h-8 w-8 place-items-center"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">{l.quantity}</span>
                            <button
                              onClick={() => {
                                if (p.stock && l.quantity >= p.stock) {
                                  toast.error(`Only ${p.stock} in stock at this pharmacy`);
                                  return;
                                }
                                setQty(l.productId, l.pharmacyId, l.quantity + 1, p.stock, l.unitType);
                              }}
                              aria-label="Increase quantity"
                              className="grid h-8 w-8 place-items-center"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="w-24 text-right text-sm font-semibold">
                            {formatINR(linePrice)}
                          </div>
                          <button
                            onClick={() => handleRemove(l, p)}
                            aria-label="Remove item"
                            className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <aside className="h-fit rounded-3xl border border-border bg-surface-elevated p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-medium">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <Row label="Delivery" value={deliveryTotal === 0 ? "Free" : formatINR(deliveryTotal)} />
              <Row label="Estimated taxes" value={formatINR(Math.round(subtotal * 0.05))} muted />
            </dl>
            <div className="mt-4 border-t border-border pt-4">
              <Row label="Total" value={formatINR(subtotal + deliveryTotal + Math.round(subtotal * 0.05))} strong />
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex h-12 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
            >
              Proceed to checkout
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              You can review delivery, coupons, and prescription upload at checkout.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd className={strong ? "font-display text-2xl font-semibold" : ""}>{value}</dd>
    </div>
  );
}
