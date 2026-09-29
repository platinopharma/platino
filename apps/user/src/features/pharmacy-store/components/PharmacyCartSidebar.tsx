'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, useUI, useOrders } from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { formatINR } from "@/lib/format";
import type { Pharmacy, Product } from "@/lib/types";
import { SlideToOrderButton } from "@/components/cart/SlideToOrderButton";

interface PharmacyCartSidebarProps {
  pharmacy: Pharmacy;
  products?: Product[];
}

export function PharmacyCartSidebar({ pharmacy, products = [] }: PharmacyCartSidebarProps) {
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setQty = useCart((s) => s.setQty);
  const initiateOrder = useOrders((s) => s.initiateOrder);
  const isHydrated = useHydrated();
  const router = useRouter();

  if (!isHydrated) return null;

  // Filter lines specifically belonging to this pharmacy
  const pharmacyLines = lines.filter((l) => l.pharmacyId === pharmacy.id);
  const totalItemCount = pharmacyLines.reduce((acc, l) => acc + l.quantity, 0);

  if (pharmacyLines.length === 0) {
    return (
      <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-surface mb-4">
          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <h3 className="font-display font-semibold text-foreground">Your cart is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add medicines to start your order</p>
      </div>
    );
  }

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

  const hasRx = pharmacyLines.some((l) => {
    const p = products.find(prod => prod.id === l.productId);
    return p?.prescriptionRequired;
  });

  const deliveryFee = pharmacy.deliveryFee || 0;
  const isFreeDelivery = deliveryFee === 0 || (pharmacy.minOrder && subtotal >= pharmacy.minOrder);

  return (
    <div className="sticky top-24 flex flex-col gap-4">
      {/* Cart Items Summary */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-border p-4 bg-surface flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            Cart Summary
          </h3>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
            {totalItemCount} items
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3 max-h-[35vh] overflow-y-auto no-scrollbar">
          {pharmacyLines.map((l) => {
            const prod = products.find((p) => p.id === l.productId);
            if (!prod) return null;
            return (
              <div key={l.productId} className="flex items-start justify-between gap-3 text-sm">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="font-medium text-foreground leading-tight truncate">{prod.name}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(prod.price)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded bg-primary/10 border border-primary/20 overflow-hidden h-7">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQty(l.productId, pharmacy.id, l.quantity - 1)}
                      className="grid h-full w-6 place-items-center text-primary hover:bg-primary/20 transition-colors text-sm font-medium pb-0.5"
                    >
                      −
                    </button>
                    <span className="min-w-[1.25rem] text-center text-xs font-bold text-primary">
                      {l.quantity}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQty(l.productId, pharmacy.id, l.quantity + 1)}
                      className="grid h-full w-6 place-items-center text-primary hover:bg-primary/20 transition-colors text-sm font-medium pb-0.5"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasRx && (
          <div className="mx-4 mb-4 rounded-lg bg-foreground p-3 flex items-start gap-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-background/80 shrink-0 mt-0.5" />
            <div className="text-xs text-background/80">
              <span className="font-semibold text-background block mb-0.5">Prescription Required</span>
              You will need to upload a valid Rx for some items during checkout.
            </div>
          </div>
        )}

        <div className="border-t border-border p-4 bg-surface space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Item Total</span>
            <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium text-foreground">
              {isFreeDelivery ? <span className="text-primary font-bold">FREE</span> : formatINR(deliveryFee)}
            </span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="font-bold text-foreground">To Pay</span>
            <span className="font-bold text-foreground text-lg leading-none">{formatINR(subtotal + (isFreeDelivery ? 0 : deliveryFee))}</span>
          </div>
        </div>
      </div>

      {(() => {
        const totalAmount = subtotal + (isFreeDelivery ? 0 : deliveryFee);
        const handlePlaceOrder = async () => {
          try {
            const payload = {
              pharmacyId: pharmacy.id,
              beneficiaryFlag: "ORDER_FOR_SELF",
              deliveryAddress: pharmacy.address || `${pharmacy.area || ""}, ${pharmacy.city || ""}`,
              paymentMethod: "PAY_ON_DELIVERY",
              items: pharmacyLines.map((l) => ({ productId: l.productId, medicineId: l.productId, quantity: l.quantity })),
            };
            const order = await initiateOrder(payload);
            if (order?.id) {
              router.push(`/orders/${order.id}/tracking`);
            }
          } catch (e) {
            // Fallback for demo if API fails
            const dummyId = "ORD-" + Math.floor(Math.random() * 1000000);
            router.push(`/orders/${dummyId}/tracking`);
          }
        };

        return (
          <SlideToOrderButton
            totalAmount={totalAmount}
            onOrderComplete={handlePlaceOrder}
          />
        );
      })()}

      <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 shadow-sm space-y-2.5">
        <div className="flex items-start gap-2">
          <svg className="h-4 w-4 fill-amber-400 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" stroke="currentColor" fill="currentColor" /></svg>
          <div className="text-xs text-primary">
            <span className="font-semibold block mb-0.5">Express Delivery</span>
            ~{pharmacy.etaMinutes || 30} mins to {pharmacy.area || 'your location'}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-primary">
            <span className="font-semibold block mb-0.5">Trusted Pharmacy</span>
            Verified partner with genuine medicines.
          </div>
        </div>
      </div>
    </div>
  );
}
