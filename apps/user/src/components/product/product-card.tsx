'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Check, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useCart, useWishlist, useUI } from "@/stores";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
  pharmacyId,
}: {
  product: Product;
  index?: number;
  pharmacyId?: string;
}) {
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
      whileHover={{ y: -2 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft transition-shadow duration-300 hover:shadow-elevated"
    >
      <Link
        href={`/product/${product.id}`}
        
        data-testid="product-card-link"
        data-product-id={product.id}
        aria-label={product.name}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={index < 4}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(product.id);
          }}
          aria-label={hasWish ? "Remove from wishlist" : "Save"}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-foreground backdrop-blur-md hover:bg-white"
        >
          <Heart className={cn("h-4 w-4", hasWish && "fill-destructive text-destructive")} />
        </button>
        {product.prescriptionRequired && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-trust/90 px-2 py-0.5 text-[10px] font-medium text-trust-foreground">
            <ShieldCheck className="h-3 w-3" /> Rx
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground shadow">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5">
        <Link href={`/product/${product.id}`} className="min-w-0">
          <h3 className="line-clamp-2 min-h-[2.1rem] text-[13px] font-medium leading-tight">
            {product.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {product.manufacturer} · {product.packSize}
          </p>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-base font-semibold">{formatINR(product.price)}</span>
              {discount > 0 && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
            {product.supportsIndividualUnits && product.tabletPrice && (
              <div className="text-[10px] text-primary font-medium">
                {formatINR(product.tabletPrice)} / tablet
              </div>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-[11px] font-medium text-muted-foreground">Unavailable</span>
          ) : line ? (
            <div className="flex items-center gap-1 rounded-full bg-primary p-0.5 text-primary-foreground sm:gap-0.5">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty(product.id, pid, line.quantity - 1, product.stock)}
                className="grid h-8 w-8 place-items-center text-sm sm:h-7 sm:w-7 sm:text-xs"
              >
                −
              </button>
              <motion.span
                key={line.quantity}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                className="min-w-[1.2rem] text-center text-xs font-semibold sm:min-w-[0.9rem]"
              >
                {line.quantity}
              </motion.span>
              <button
                aria-label="Increase quantity"
                onClick={() => {
                  if (product.stock && line.quantity >= product.stock) {
                    toast.error(`Only ${product.stock} in stock at this pharmacy`);
                    return;
                  }
                  setQty(product.id, pid, line.quantity + 1, product.stock);
                }}
                className="grid h-8 w-8 place-items-center text-sm sm:h-7 sm:w-7 sm:text-xs"
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
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.03] sm:min-h-0 sm:h-7 sm:gap-1 sm:px-2.5 sm:py-0 sm:text-[11px]"
            >
              <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
