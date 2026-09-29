'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useCart, useWishlist, useUI } from "@/stores";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PharmacyProductCardProps {
  product: Product;
  index?: number;
  pharmacyId?: string;
}

export function PharmacyProductCard({
  product,
  index = 0,
  pharmacyId,
}: PharmacyProductCardProps) {
  const pid = pharmacyId ?? product.pharmacyId;
  const line = useCart((s) => s.lines.find((l) => l.productId === product.id && l.pharmacyId === pid));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const hasWish = useWishlist((s) => s.hasProduct(product.id));
  const toggleWish = useWishlist((s) => s.toggleProduct);
  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : !product.inStock;
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col justify-between p-3 overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
    >
      <Link
        href={`/product/${product.id}`}
        data-testid="product-card-link"
        data-product-id={product.id}
        aria-label={product.name}
        className="relative block aspect-square overflow-hidden bg-white p-2 rounded-xl"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={index < 4}
          className="object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
        />
        
        {/* Badges Overlay */}
        <div className="absolute inset-x-2 top-2 flex items-start justify-between">
          <div className="flex flex-col gap-1.5 items-start">
            {discount > 0 && (
              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground shadow-sm">
                {discount}% OFF
              </span>
            )}
            {product.prescriptionRequired && (
              <span className="inline-flex items-center gap-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-background shadow-sm">
                <ShieldCheck className="h-3 w-3 text-background/80" /> Rx Required
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWish(product.id);
            }}
            aria-label={hasWish ? "Remove from wishlist" : "Save"}
            className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-muted-foreground backdrop-blur-md transition-colors hover:bg-background hover:text-rose-500 shadow-sm"
          >
            <Heart className={cn("h-4 w-4 transition-colors", hasWish && "fill-rose-500 text-rose-500")} />
          </button>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-bold text-background shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link href={`/product/${product.id}`} className="min-w-0">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase mb-0.5 truncate">
            {product.manufacturer}
          </div>
          <h3 className="line-clamp-1 text-sm font-bold text-foreground">
            {product.name}
          </h3>
          <p className="mt-1 truncate text-[11px] text-muted-foreground font-medium">
            {product.packSize}
          </p>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-foreground leading-none">
                {formatINR(product.price)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] text-muted-foreground/70 line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
            {product.supportsIndividualUnits && product.tabletPrice && (
              <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {formatINR(product.tabletPrice)} / tablet
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-[11px] font-medium text-muted-foreground/70 px-2">Unavailable</span>
          ) : line ? (
            <div className="flex items-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden shadow-sm h-8">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty(product.id, pid, line.quantity - 1, product.stock)}
                className="grid h-full w-7 place-items-center text-primary hover:bg-primary/20 transition-colors font-medium text-lg pb-0.5"
              >
                −
              </button>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={line.quantity}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="min-w-[1.25rem] text-center text-[13px] font-bold text-primary"
                >
                  {line.quantity}
                </motion.span>
              </AnimatePresence>
              <button
                aria-label="Increase quantity"
                onClick={() => {
                  if (product.stock && line.quantity >= product.stock) {
                    toast.error(`Only ${product.stock} in stock at this pharmacy`);
                    return;
                  }
                  setQty(product.id, pid, line.quantity + 1, product.stock);
                }}
                className="grid h-full w-7 place-items-center text-primary hover:bg-primary/20 transition-colors font-medium text-lg pb-0.5"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (product.stock !== undefined && product.stock <= 0) {
                  toast.error("This item is currently out of stock");
                  return;
                }
                add(product.id, pid, 1, product.stock);
                toast.success(`${product.name} added`, {
                  action: {
                    label: "View Cart",
                    onClick: () => setCartOpen(true),
                  },
                });
              }}
              aria-label={`Add ${product.name} to cart`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
