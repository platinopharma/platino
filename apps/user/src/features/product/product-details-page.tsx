'use client';
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Truck, FileText, Plus, Minus, Info, Pill, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import { productService, pharmacyService } from "@/services";
import { formatINR } from "@/lib/format";
import { useCart, useWishlist, useUI } from "@/stores";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", params.id],
    queryFn: () => productService.get(params.id),
  });

  const setCartOpen = useUI((s) => s.setCartOpen);
  const line = useCart((s) =>
    product ? s.lines.find((l) => l.productId === product.id && l.pharmacyId === product.pharmacyId) : undefined,
  );
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const hasWish = useWishlist((s) => (product ? s.hasProduct(product.id) : false));
  const toggleWish = useWishlist((s) => s.toggleProduct);

  const { data: pharmacy } = useQuery({
    queryKey: ["pharmacy", product?.pharmacyId],
    queryFn: () => pharmacyService.getById(product!.pharmacyId),
    enabled: !!product?.pharmacyId,
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.id],
    queryFn: () => productService.related(product!.id),
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (!product) return;
    analytics.track("product_view", {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      pharmacyId: product.pharmacyId,
    });
  }, [product]);

  if (isLoadingProduct) return <div className="p-8 text-center text-muted-foreground">Loading product...</div>;
  if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found</div>;

  const [buyingMode, setBuyingMode] = useState<"strip" | "tablet">("strip");
  const [stripCount, setStripCount] = useState<number>(1);
  const [tabletCount, setTabletCount] = useState<number>(5);

  const unitsPerStrip = product?.unitsPerStrip || 10;
  const stripPrice = product?.stripPrice ?? product?.price ?? 0;
  const stripMrp = product?.stripMrp ?? product?.mrp ?? stripPrice;
  const tabletPrice = product?.tabletPrice ?? (unitsPerStrip > 0 ? Number((stripPrice / unitsPerStrip).toFixed(2)) : stripPrice);
  const tabletMrp = product?.tabletMrp ?? (unitsPerStrip > 0 ? Number((stripMrp / unitsPerStrip).toFixed(2)) : stripMrp);
  const supportsIndividual = product?.supportsIndividualUnits !== false;

  const currentPrice = buyingMode === "strip" ? stripPrice * stripCount : tabletPrice * tabletCount;
  const currentMrp = buyingMode === "strip" ? stripMrp * stripCount : tabletMrp * tabletCount;
  const currentSavings = currentMrp > currentPrice ? currentMrp - currentPrice : 0;

  const stripLine = useCart((s) =>
    product ? s.lines.find((l) => l.productId === product.id && l.pharmacyId === product.pharmacyId && (l.unitType || "strip") === "strip") : undefined
  );
  const tabletLine = useCart((s) =>
    product ? s.lines.find((l) => l.productId === product.id && l.pharmacyId === product.pharmacyId && l.unitType === "tablet") : undefined
  );

  const discount = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href={`/`} className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href={`/category/${product.category}`} className="hover:text-foreground capitalize">
          {product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface"
        >
          <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {discount}% off
            </span>
          )}
        </motion.div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                {product.manufacturer}
              </div>
              <h1 className="mt-1 font-display text-3xl font-medium leading-tight sm:text-4xl">
                {product.name}
              </h1>
              {product.brandName && product.brandName !== product.name && (
                <div className="text-sm font-semibold text-primary/90 mt-0.5">
                  Brand: {product.brandName}
                </div>
              )}
              {product.genericName && (
                <div className="text-xs text-muted-foreground italic mt-0.5">
                  Active Salt: {product.genericName}
                </div>
              )}
              <p className="mt-1 text-sm text-muted-foreground">Pack: {product.packSize} ({unitsPerStrip} units per strip)</p>
            </div>
            <button
              onClick={() => toggleWish(product.id)}
              aria-label={hasWish ? "Remove from wishlist" : "Save"}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-elevated hover:border-primary"
            >
              <Heart className={cn("h-5 w-5", hasWish && "fill-destructive text-destructive")} />
            </button>
          </div>

          {/* DUAL UNIT MODE SELECTOR (STRIP VS INDIVIDUAL TABLET) */}
          {supportsIndividual && (
            <div className="mt-6 rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                <span>Select Purchase Unit</span>
                <span className="text-[11px] text-primary font-normal">
                  {buyingMode === "strip" ? "Ordering Full Strips" : "Ordering Loose Tablets"}
                </span>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBuyingMode("strip")}
                  className={cn(
                    "flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
                    buyingMode === "strip"
                      ? "bg-surface text-primary shadow-sm font-bold border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <Pill className="size-4" /> Full Strip
                  </span>
                  <span className="text-[11px] mt-0.5 opacity-90">
                    {formatINR(stripPrice)} / strip ({unitsPerStrip} tabs)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuyingMode("tablet")}
                  className={cn(
                    "flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
                    buyingMode === "tablet"
                      ? "bg-surface text-primary shadow-sm font-bold border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <CircleDot className="size-4" /> Individual Tablets
                  </span>
                  <span className="text-[11px] mt-0.5 opacity-90">
                    {formatINR(tabletPrice)} / tablet
                  </span>
                </button>
              </div>

              {/* Dynamic Controls based on chosen mode */}
              <div className="mt-4 pt-3 border-t border-border/60">
                {buyingMode === "strip" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Number of Strips:</span>
                      <div className="flex items-center gap-2 bg-surface rounded-full border border-border px-3 py-1">
                        <button
                          type="button"
                          onClick={() => setStripCount((c) => Math.max(1, c - 1))}
                          className="text-lg font-bold text-muted-foreground hover:text-foreground px-1"
                        >
                          −
                        </button>
                        <span className="font-bold text-sm min-w-[2.5rem] text-center">
                          {stripCount} {stripCount === 1 ? "Strip" : "Strips"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStripCount((c) => c + 1)}
                          className="text-lg font-bold text-muted-foreground hover:text-foreground px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex justify-between">
                      <span>Total Tablets: <strong>{stripCount * unitsPerStrip} Tablets</strong></span>
                      <span>MRP: <del>{formatINR(stripMrp * stripCount)}</del></span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Tablet Count:</span>
                      <div className="flex items-center gap-2 bg-surface rounded-full border border-border px-3 py-1">
                        <button
                          type="button"
                          onClick={() => setTabletCount((c) => Math.max(1, c - 1))}
                          className="text-lg font-bold text-muted-foreground hover:text-foreground px-1"
                        >
                          −
                        </button>
                        <span className="font-bold text-sm min-w-[3rem] text-center text-primary">
                          {tabletCount} {tabletCount === 1 ? "Tablet" : "Tablets"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTabletCount((c) => c + 1)}
                          className="text-lg font-bold text-muted-foreground hover:text-foreground px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Quick Count Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground mr-1">Quick Select:</span>
                      {[2, 3, 5, 7, 10, 15].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setTabletCount(cnt)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                            tabletCount === cnt
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-surface text-muted-foreground border-border hover:border-primary/60"
                          )}
                        >
                          {cnt} Tabs
                        </button>
                      ))}
                    </div>

                    <div className="rounded-lg bg-info/10 border border-info/20 p-2.5 text-[11px] text-info flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      <span>Need only a few tablets? Buy exact tablet count without paying for a full strip!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price Strip Display */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-medium">{formatINR(currentPrice)}</span>
            {currentSavings > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatINR(currentMrp)}
                </span>
                <span className="text-sm font-medium text-primary">Save {formatINR(currentSavings)}</span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-auto font-medium">
              {buyingMode === "strip" ? `(${stripCount} Strip${stripCount > 1 ? "s" : ""})` : `(${tabletCount} Tablet${tabletCount > 1 ? "s" : ""})`}
            </span>
          </div>

          {/* Stock and Prescription Status */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.stock !== undefined && product.stock <= 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trust/15 px-3 py-1 text-xs font-bold text-trust">
                In stock {product.stock ? `(${product.stock} available)` : ""}
              </span>
            )}
            {product.prescriptionRequired && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trust/15 px-3 py-1 text-xs font-medium text-trust">
                <ShieldCheck className="h-3.5 w-3.5" /> Prescription required
              </span>
            )}
          </div>

          {pharmacy && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-4">
              <Image src={pharmacy.logo} alt={pharmacy.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Sold and delivered by</div>
                <Link
                  href={`/pharmacy/${pharmacy.slug || pharmacy.id}`}
                  className="text-sm font-medium hover:text-primary"
                >
                  {pharmacy.name}
                </Link>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>~{pharmacy.etaMinutes} min</div>
                <div className="text-primary">
                  {pharmacy.deliveryFee === 0 ? "Free delivery" : `₹${pharmacy.deliveryFee}`}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              disabled={product.stock !== undefined && product.stock <= 0}
              onClick={() => {
                const qtyToAdd = buyingMode === "strip" ? stripCount : tabletCount;
                const unitPrice = buyingMode === "strip" ? stripPrice : tabletPrice;
                add(product.id, product.pharmacyId, qtyToAdd, product.stock, buyingMode, unitsPerStrip, unitPrice);
                toast.success(
                  buyingMode === "strip"
                    ? `Added ${stripCount} Strip${stripCount > 1 ? "s" : ""} (${stripCount * unitsPerStrip} Tablets) to cart`
                    : `Added ${tabletCount} Loose Tablet${tabletCount > 1 ? "s" : ""} to cart`,
                  {
                    action: {
                      label: "View Cart",
                      onClick: () => setCartOpen(true),
                    },
                  }
                );
              }}
              className={cn(
                "inline-flex h-12 flex-1 min-w-[200px] items-center justify-center gap-2 rounded-full px-6 font-medium transition-transform shadow-sm",
                product.stock !== undefined && product.stock <= 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:scale-[1.02]"
              )}
            >
              <Plus className="h-4 w-4" />
              {product.stock !== undefined && product.stock <= 0
                ? "Out of stock"
                : buyingMode === "strip"
                  ? `Add ${stripCount} Strip${stripCount > 1 ? "s" : ""} (${formatINR(currentPrice)})`
                  : `Add ${tabletCount} Tablets (${formatINR(currentPrice)})`}
            </button>

            {(!product.stock || product.stock > 0) && (
              <Link
                href={`/checkout`}
                onClick={() => {
                  const qtyToAdd = buyingMode === "strip" ? stripCount : tabletCount;
                  const unitPrice = buyingMode === "strip" ? stripPrice : tabletPrice;
                  add(product.id, product.pharmacyId, qtyToAdd, product.stock, buyingMode, unitsPerStrip, unitPrice);
                }}
                className="inline-flex h-12 items-center rounded-full border border-border bg-surface-elevated px-6 font-medium hover:border-primary"
              >
                Buy now
              </Link>
            )}
          </div>

          {/* Active Cart Line Indicators */}
          {(stripLine || tabletLine) && (
            <div className="mt-4 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-ink space-y-1">
              <span className="font-semibold text-primary block">Currently in your cart:</span>
              {stripLine && (
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1"><Pill className="size-3" /> {stripLine.quantity} Strip{stripLine.quantity > 1 ? "s" : ""} ({stripLine.quantity * unitsPerStrip} Tablets)</span>
                  <span className="font-bold">{formatINR(stripPrice * stripLine.quantity)}</span>
                </div>
              )}
              {tabletLine && (
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1"><CircleDot className="size-3" /> {tabletLine.quantity} Individual Tablet{tabletLine.quantity > 1 ? "s" : ""}</span>
                  <span className="font-bold">{formatINR(tabletPrice * tabletLine.quantity)}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            <TrustPill icon={Truck} label="Fast delivery" />
            <TrustPill icon={ShieldCheck} label="Genuine only" />
            <TrustPill icon={FileText} label="Rx verified" />
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-[12px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <p>
              Medicines aren't eligible for easy returns. Refunds, replacements, and exchanges
              are handled directly by the pharmacy under their own policy — see our{" "}
              <Link
                href="/legal/refund-cancellation"

                className="font-semibold text-primary hover:underline"
              >
                Refund, Return & Cancellation Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <Panel title="About this product">{product.description}</Panel>
          {product.composition && <Panel title="Composition">{product.composition}</Panel>}
          {product.uses && product.uses.length > 0 && (
            <Panel title="Uses">
              <ul className="list-disc space-y-1 pl-4 marker:text-primary">
                {product.uses.map((u: string) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </Panel>
          )}
          {product.dosage && <Panel title="Dosage">{product.dosage}</Panel>}
          {product.storage && <Panel title="Storage">{product.storage}</Panel>}
          {product.warnings && product.warnings.length > 0 && (
            <Panel title="Warnings" tone="destructive">
              <ul className="list-disc space-y-1 pl-4 marker:text-destructive">
                {product.warnings.map((w: string) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {related && related.length > 0 && (
          <aside>
            <h3 className="font-display text-lg font-medium">Frequently bought together</h3>
            <div className="mt-4 space-y-3">
              {related.slice(0, 3).map((r: NonNullable<typeof related>[number]) => (
                <Link
                  key={r.id}
                  href={`/product/${r.id}`}

                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3 hover:border-primary"
                >
                  <Image src={r.image} alt={r.name} width={56} height={56} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.manufacturer}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatINR(r.price)}</div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-medium">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p: NonNullable<typeof related>[number], i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated p-3">
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

function Panel({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "destructive";
}) {
  return (
    <section>
      <h3 className={cn("font-display text-lg font-medium", tone === "destructive" && "text-destructive")}>
        {title}
      </h3>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
