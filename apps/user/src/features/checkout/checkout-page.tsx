'use client';
import { useEffect, useState } from "react";
import type { Product, Pharmacy } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  FileText,
  Ticket,
  Wallet,
  Check,
  ChevronLeft,
  ShieldCheck,
  Upload,
  FileCheck2,
  X,
  Loader2,
  PartyPopper,
  Siren,
  AlertCircle,
  CircleDot,
  Pill
} from "lucide-react";
import { toast } from "sonner";
import { useCart, useOrders, getCartCatalogKey } from "@/stores";
import { useAddresses, pickCheckoutAddress, formatAddress, type Address } from "@/stores/addresses";
import { useLegalAcceptance } from "@/stores/consent";
import { LEGAL_VERSION } from "@/lib/legal-content";
import { pharmacyService, productService } from "@/services";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { AddressManager } from "@/components/addresses/address-manager";
import { TransitBookingSelector, type DeliveryCategory, type BeneficiaryDetails, type TransitDetails } from "@/components/checkout/TransitBookingSelector";

const steps = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "delivery", label: "Delivery", icon: Clock },
  { id: "prescription", label: "Prescription", icon: FileText },
  { id: "coupon", label: "Coupon", icon: Ticket },
  { id: "review", label: "Review", icon: Check },
] as const;

import { apiPost, apiGet } from "@/lib/axios";

export interface Slot {
  id: string;
  title: string;
  eta: string;
  etaMinutes: number;
}

/** Calculate delivery slots based on serviceability and logistics schedule */
export function getDeliverySlots(pincode: string | undefined | null): Slot[] {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) return [];
  return [
    { id: "express", title: "Express", eta: "In 20–30 minutes", etaMinutes: 25 },
    { id: "within-2h", title: "Within 2 hours", eta: "Today", etaMinutes: 90 },
    { id: "evening", title: "Evening", eta: "Today, 6–8 PM", etaMinutes: 300 },
    { id: "tomorrow", title: "Tomorrow morning", eta: "9–11 AM", etaMinutes: 900 },
  ];
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


export function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [acceptedForOrder, setAcceptedForOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("PAY_ON_DELIVERY");
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [transitBookingData, setTransitBookingData] = useState<{
    deliveryCategory: DeliveryCategory;
    beneficiary: BeneficiaryDetails;
    transitDetails?: TransitDetails;
  }>({
    deliveryCategory: 'STANDARD',
    beneficiary: { type: 'SELF', recipientName: 'Awais Nadeem', recipientPhone: '+91 98765 43210' }
  });
  
  // Emergency SOS States
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyCategory, setEmergencyCategory] = useState<string>("Trauma / Accident Care");
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);

  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const initiateOrder = useOrders((s) => s.initiateOrder);
  const orders = useOrders((s) => s.orders);
  const acceptLegal = useLegalAcceptance((s) => s.accept);
  const legalCurrent = useLegalAcceptance((s) => s.isCurrent());
  const addresses = useAddresses((s) => s.addresses);
  const selectedAddressId = useAddresses((s) => s.selectedId);
  const setSelectedAddress = useAddresses((s) => s.setSelected);
  const effectiveAddress = pickCheckoutAddress(addresses, selectedAddressId);
  const router = useRouter();

  // Delivery slots depend on the pincode. Even/odd pin ends drive our mock
  // "no slots available" scenario used in tests and off-hours UX.
  const slots = getDeliverySlots(effectiveAddress?.pincode);
  const slotsAvailable = slots.length > 0;

  // Prefill: if nothing is explicitly selected but a default exists, sync it once.
  useEffect(() => {
    if (!selectedAddressId && effectiveAddress) {
      setSelectedAddress(effectiveAddress.id);
    }
  }, [selectedAddressId, effectiveAddress, setSelectedAddress]);

  // Auto-select first slot when they become available.
  useEffect(() => {
    if (slotsAvailable && !slots.find((s) => s.id === selectedSlot)) {
      setSelectedSlot(slots[0].id);
    }
    if (!slotsAvailable && selectedSlot) setSelectedSlot(null);
  }, [slots, slotsAvailable, selectedSlot]);


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
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  useEffect(() => {
    analytics.track("checkout_start", { itemCount: lines.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    analytics.track("checkout_step", { step: steps[step].id, index: step });
  }, [step]);

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
  const rawDelivery = isEmergency ? 0 : (data?.pharmacies.reduce((s, p) => s + (p?.deliveryFee ?? 0), 0) ?? 0);

  const deliveryTotal = rawDelivery;
  const discount = Math.min(discountAmount, subtotal + rawDelivery);
  const taxableBase = Math.max(0, subtotal - Math.min(discount, subtotal));
  const taxes = Math.round(taxableBase * 0.05);
  const total = Math.max(0, subtotal + deliveryTotal + taxes - discount);

  // Stock validation — inline errors on Review + blocks Place order.
  const stockIssues = lines
    .map((l) => {
      const p = data?.products.find((x) => x?.id === l.productId);
      if (!p) return null;
      const stock = p.stock ?? 0; // Use live backend stock instead of mock
      if (l.quantity > stock) {
        return { productId: l.productId, name: p.name, stock, requested: l.quantity };
      }
      return null;
    })
    .filter(Boolean) as { productId: string; name: string; stock: number; requested: number }[];
  const hasStockIssue = stockIssues.length > 0;

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const place = () => {
    if (!effectiveAddress) {
      toast.error("Please add a delivery address to continue.");
      setStep(0);
      return;
    }
    if (!slotsAvailable || !selectedSlot) {
      toast.error("Please choose an available delivery slot.");
      setStep(1);
      return;
    }
    if (hasStockIssue) {
      toast.error("Some items exceed available stock. Reduce quantities to continue.");
      setStep(5);
      return;
    }
    if (!(legalCurrent || acceptedForOrder)) {
      toast.error("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    if (!legalCurrent) acceptLegal();

    if (paymentMethod !== "PAY_ON_DELIVERY" && !isSimulatingPayment) {
      setIsSimulatingPayment(true);
      return;
    }

    const slot = slots.find((s) => s.id === selectedSlot) ?? slots[0];
    const now = new Date().toISOString();
    const addressLine = `${effectiveAddress.label}, ${formatAddress(effectiveAddress)}`;
    const byPharmacy = lines.reduce<Record<string, typeof lines>>((acc, l) => {
      (acc[l.pharmacyId] ||= []).push(l);
      return acc;
    }, {});

    const placeAll = async () => {
    try {
      const payload = {
        deliveryAddressId: effectiveAddress?.id,
        deliveryAddress: addressLine,
        beneficiaryFlag: transitBookingData.beneficiary.type === 'OTHER' ? "ORDER_FOR_OTHERS" : "ORDER_FOR_SELF",
        deliveryCategory: transitBookingData.deliveryCategory,
        beneficiary: transitBookingData.beneficiary,
        transitDetails: transitBookingData.transitDetails,
        items: lines.map(l => ({ productId: l.productId, quantity: l.quantity })),
        prescriptionUrls: [],
        isEmergency,
        emergencyCategory: isEmergency ? emergencyCategory : null,
      };
      const initiatedOrder = await initiateOrder(payload);
      clear();
      router.push(`/orders/${initiatedOrder.id}`);
    } catch (err: unknown) {
      setIsSimulatingPayment(false);
      toast.error(`Order failed: ${(err as Error).message}`);
    }
  };

    placeAll();
  };

  const lastOrder = lastOrderId ? orders.find((o) => o.id === lastOrderId) : null;
  const lastPharmacy = data?.pharmacies.find((p) => p?.id === lastOrder?.pharmacyId) ?? null;


  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <PartyPopper className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-medium">Your order is confirmed.</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The pharmacy has received your order and will start preparing it shortly. You'll get
          live updates on delivery.
        </p>
        {effectiveAddress && (
          <div
            data-testid="confirmation-address"
            className="mt-6 w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-4 text-left text-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Delivering to
            </div>
            <div className="mt-1 flex items-center gap-2 font-semibold">
              {effectiveAddress.label}
              {effectiveAddress.isDefault && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Default
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {effectiveAddress.name} · {effectiveAddress.phone}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {formatAddress(effectiveAddress)}
            </div>
          </div>
        )}
        {lastOrder && (
          <div
            data-testid="confirmation-order-status"
            className="mt-4 w-full max-w-md rounded-2xl border border-primary/30 bg-primary/[0.06] p-4 text-left text-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-primary">
              Order status
            </div>
            <div className="mt-1 font-semibold" data-testid="confirmation-pharmacy">
              {lastPharmacy?.name ?? "Pharmacy confirmed"}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground" data-testid="confirmation-eta">
              Estimated delivery in ~{lastOrder.etaMinutes} minutes
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Order #{lastOrder.id}</div>
          </div>
        )}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() =>
              lastOrderId
                ? router.push(`/orders/${lastOrderId}`)
                : router.push("/orders")
            }
            data-testid="track-order-button"
            className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Track my order
          </button>
          <Link
            href={`/`}
            className="inline-flex h-11 items-center rounded-full border border-border bg-surface-elevated px-5 text-sm font-medium"
          >
            Continue shopping
          </Link>
        </div>

      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl">Your cart is empty.</h1>
        <Link
          href="/pharmacies"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Browse pharmacies
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-foreground">Cart</Link>
        <span>/</span>
        <span className="text-foreground">Checkout</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Checkout</h1>

      {/* Stepper */}
      <div className="no-scrollbar swipe-x mt-8 flex items-center gap-2 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-1 shrink-0 items-center gap-2 min-w-[80px]">
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors",
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div className="hidden text-xs font-medium sm:block">{s.label}</div>
            {i < steps.length - 1 && (
              <div className={cn("h-px flex-1 transition-colors", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-border bg-surface-elevated p-6"
          >
            {step === 0 && (
              <div className="space-y-6">
                <TransitBookingSelector
                  userProfile={{ name: "Awais Nadeem", phone: "+91 98765 43210" }}
                  onChange={(data) => setTransitBookingData(data)}
                />
                <AddressStep />
              </div>
            )}
            {step === 1 && (
              <DeliveryStep
                slots={slots}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
                pincode={effectiveAddress?.pincode ?? null}
              />
            )}
            {step === 2 && <PrescriptionStep />}
            {step === 3 && (
              <CouponStep 
                subtotal={subtotal} 
                rawDelivery={rawDelivery} 
                applied={appliedCoupon} 
                setApplied={setAppliedCoupon}
                setDiscountAmount={setDiscountAmount}
              />
            )}
            {step === 4 && (
              <ReviewStep
                lines={lines}
                data={data}
                subtotal={subtotal}
                deliveryTotal={deliveryTotal}
                discount={discount}
                couponCode={appliedCoupon}
                taxes={taxes}
                total={total}
                address={effectiveAddress as Address}
                slot={(slots.find((s) => s.id === selectedSlot) as { id: string; title: string; eta: string; etaMinutes: number } | undefined) ?? null}
                onChangeSlot={() => setStep(1)}
                stockIssues={stockIssues}
              />
            )}



            {step === steps.length - 1 && !legalCurrent && (
              <label
                className={cn(
                  "mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-[13px] leading-relaxed transition-colors",
                  acceptedForOrder
                    ? "border-primary/40 bg-primary/[0.06]"
                    : "border-border bg-muted/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={acceptedForOrder}
                  onChange={(e) => setAcceptedForOrder(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[--color-primary]"
                  aria-required
                />
                <span className="text-foreground/85">
                  I have read and agree to the{" "}
                  <Link
                    href="/legal/terms"
                    
                    target="_blank"
                    className="font-semibold text-primary hover:underline"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={`/legal/${"privacy"}`}
                    
                    target="_blank"
                    className="font-semibold text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  ({LEGAL_VERSION}). Medicines aren't eligible for easy returns —
                  refunds and replacements are handled by the pharmacy under our{" "}
                  <Link
                    href={`/legal/${"refunds"}`}
                    
                    target="_blank"
                    className="font-semibold text-primary hover:underline"
                  >
                    Refund Policy
                  </Link>
                  .
                </span>
              </label>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={back}
                disabled={step === 0}
                className="inline-flex h-11 items-center gap-1 rounded-full border border-border bg-surface-elevated px-5 text-sm font-medium disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (step === 0 && !effectiveAddress) {
                    toast.error("Please add a delivery address to continue.");
                    return;
                  }
                  if (step === 1 && (!slotsAvailable || !selectedSlot)) {
                    toast.error("No delivery slots are available for this address.");
                    return;
                  }
                  if (step === steps.length - 1 && isEmergency && !emergencyConfirmed) {
                    toast.error("Please confirm that this is a valid medical emergency.");
                    return;
                  }
                  if (step === steps.length - 1) place();
                  else next();
                }}
                disabled={
                  (step === 0 && !effectiveAddress) ||
                  (step === 1 && (!slotsAvailable || !selectedSlot)) ||
                  (step === steps.length - 1 && hasStockIssue) ||
                  (step === steps.length - 1 && !legalCurrent && !acceptedForOrder) ||
                  (isSimulatingPayment)
                }

                data-testid="checkout-primary-button"
                className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSimulatingPayment ? "Processing..." : step === steps.length - 1 ? "Submit for Verification" : "Continue"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mock Payment Gateway Overlay Removed */}

        <aside className="h-fit rounded-3xl border border-border bg-surface-elevated p-6 lg:sticky lg:top-24 flex flex-col gap-6">
          
          {/* EMERGENCY SOS WIDGET */}
          <div className={cn(
            "rounded-2xl border transition-colors duration-300 overflow-hidden",
            isEmergency ? "border-red-600/60 bg-red-950/20" : "border-border bg-surface"
          )}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  isEmergency ? "bg-red-900/50 text-red-400" : "bg-muted text-muted-foreground"
                )}>
                  <Siren className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={cn("font-semibold", isEmergency ? "text-red-200" : "text-foreground")}>
                      Emergency SOS Order
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isEmergency}
                        onChange={(e) => {
                          setIsEmergency(e.target.checked);
                          if (!e.target.checked) setEmergencyConfirmed(false);
                        }}
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <p className={cn("text-xs mt-1", isEmergency ? "text-red-300/80" : "text-muted-foreground")}>
                    For accident, trauma, or urgent life-saving medication. Waives delivery fees and assigns highest dispatch priority.
                  </p>
                </div>
              </div>
              
              {/* Emergency Options (Expanded) */}
              <AnimatePresence>
                {isEmergency && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-red-900/30 overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-red-300 mb-2 uppercase tracking-wider">
                      Emergency Category
                    </label>
                    <div className="space-y-2 mb-4">
                      {["Trauma / Accident Care", "Critical Daily Medication", "Acute Pain / Cardiac Urgent", "Other Emergency"].map(cat => (
                        <label key={cat} className="flex items-center gap-2 text-sm text-red-100 cursor-pointer p-2 rounded-lg hover:bg-red-900/20 border border-transparent hover:border-red-900/30 transition-colors">
                          <input 
                            type="radio" 
                            name="emergencyCategory" 
                            value={cat}
                            checked={emergencyCategory === cat}
                            onChange={(e) => setEmergencyCategory(e.target.value)}
                            className="accent-red-500"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                    
                    <label className="flex items-start gap-2 bg-red-950/40 p-3 rounded-lg border border-red-800/50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emergencyConfirmed}
                        onChange={(e) => setEmergencyConfirmed(e.target.checked)}
                        className="mt-0.5 accent-red-600 shrink-0"
                      />
                      <span className="text-xs text-red-200 leading-snug">
                        I confirm this order is for an immediate medical emergency. Misuse may result in account suspension.
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

            <h2 className="font-display text-lg font-medium">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Items" value={String(lines.reduce((s, l) => s + l.quantity, 0))} />
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <div className="flex items-baseline justify-between">
                <span className={isEmergency ? "text-red-400 font-medium" : "text-muted-foreground"}>Delivery</span>
                <span className={isEmergency ? "text-amber-400 font-medium" : "font-medium"}>
                  {deliveryTotal === 0 ? (isEmergency ? "₹0 (Waived for Emergency)" : "Free") : formatINR(deliveryTotal)}
                </span>
              </div>
              <Row label="Taxes" value={formatINR(taxes)} muted />
            {discount > 0 && (
              <div className="flex items-baseline justify-between text-primary">
                <span className="font-medium">Coupon {appliedCoupon}</span>
                <span className="font-medium">−{formatINR(discount)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <Row label="Total" value={formatINR(total)} strong />
            {discount > 0 && (
              <div className="mt-1 text-right text-xs font-medium text-primary">
                You saved {formatINR(discount)}
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure checkout · verified pharmacies · encrypted data
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={strong ? "font-display text-xl font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

function AddressStep() {
  const addresses = useAddresses((s) => s.addresses);
  const selectedId = useAddresses((s) => s.selectedId);
  const effective = pickCheckoutAddress(addresses, selectedId);
  return (
    <div>
      <h2 className="font-display text-xl font-medium">Delivery address</h2>
      <p className="text-sm text-muted-foreground">Where should we deliver your order?</p>
      {addresses.length === 0 ? (
        <div
          data-testid="address-empty-state"
          className="mt-4 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground"
        >
          You don't have any saved addresses yet. Add one below to continue.
        </div>
      ) : effective ? (
        <div
          data-testid="address-active-summary"
          className="mt-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-3 text-xs text-foreground/80"
        >
          Using <span className="font-semibold">{effective.label}</span>
          {effective.isDefault && !selectedId ? " (default)" : ""} —{" "}
          {formatAddress(effective)}
        </div>
      ) : null}
      <div className="mt-6">
        <AddressManager selectable />
      </div>
    </div>
  );
}

function DeliveryStep({
  slots,
  selected,
  onSelect,
  pincode,
}: {
  slots: Slot[];
  selected: string | null;
  onSelect: (id: string) => void;
  pincode: string | null;
}) {
  const empty = slots.length === 0;
  return (
    <div>
      <h2 className="font-display text-xl font-medium">Delivery slot</h2>
      <p className="text-sm text-muted-foreground">Pick a time that works for you.</p>
      {empty ? (
        <div
          role="alert"
          aria-live="polite"
          data-testid="delivery-no-slots"
          className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/[0.06] p-4 text-sm text-destructive"
        >
          <div className="font-semibold">No delivery slots available</div>
          <div className="mt-1 text-xs">
            We couldn't find any serviceable slots for{" "}
            <span className="font-medium">{pincode ?? "your address"}</span>. Please pick a different
            address to continue.
          </div>
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Delivery slots"
          data-testid="delivery-slot-group"
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          {slots.map((s, i) => {
            const isSel = selected ? selected === s.id : i === 0;
            return (
              <label
                key={s.id}
                data-testid={`delivery-slot-${s.id}`}
                data-selected={isSel ? "true" : "false"}
                className={cn(
                  "cursor-pointer rounded-2xl border p-4 transition-colors",
                  isSel
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-surface hover:border-primary/50",
                )}
              >
                <input
                  type="radio"
                  name="slot"
                  value={s.id}
                  checked={isSel}
                  onChange={() => onSelect(s.id)}
                  className="sr-only"
                  aria-describedby={`slot-eta-${s.id}`}
                />
                <div className="text-sm font-medium">{s.title}</div>
                <div id={`slot-eta-${s.id}`} className="mt-0.5 text-xs text-muted-foreground">
                  {s.eta}
                </div>
                <div className="mt-2 text-xs font-semibold text-primary">Free</div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}


function PrescriptionStep() {
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const startUpload = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const isImage = f.type.startsWith("image/");
    setPreviewUrl(isImage ? URL.createObjectURL(f) : null);
    setFile({ name: f.name, size: f.size, type: f.type });
    setProgress(0);
    setStatus("uploading");
    analytics.track("rx_upload", { size: f.size, type: f.type, kind: isImage ? "image" : "pdf" });
    // Simulated progress — replace with real XHR/fetch progress when backend is wired.
    const start = Date.now();
    const duration = 1800 + Math.min(2500, f.size / 4000);
    const tick = () => {
      const pct = Math.min(100, ((Date.now() - start) / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setStatus("done");
        toast.success("Prescription uploaded");
      }
    };
    requestAnimationFrame(tick);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setProgress(0);
    setStatus("idle");
  };

  return (
    <div>
      <h2 className="font-display text-xl font-medium">Prescription (if required)</h2>
      <p className="text-sm text-muted-foreground">
        Upload a valid prescription for Rx-only medicines. Skip if none of your items require one.
      </p>

      {!file ? (
        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center transition-colors hover:border-primary hover:bg-primary-soft">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <div className="mt-3 font-medium">Upload prescription</div>
          <div className="mt-1 text-xs text-muted-foreground">PDF, JPG or PNG · up to 10 MB</div>
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) startUpload(f);
            }}
          />
        </label>
      ) : (
        <div className="mt-6 rounded-3xl border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Prescription preview"
                className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover"
              />
            ) : null}
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                status === "done"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary-soft text-primary",
              )}
              aria-hidden
            >
              {status === "uploading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "done" ? (
                <FileCheck2 className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Remove file"
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatSize(file.size)}</span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    status === "done" ? "text-primary" : "text-foreground",
                  )}
                  aria-live="polite"
                >
                  {status === "done" ? "Uploaded" : `${Math.round(progress)}%`}
                </span>
              </div>
              <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-150 ease-out",
                    status === "done" ? "bg-primary" : "bg-primary/80",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          {status === "done" && (
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground">
              <Upload className="h-3.5 w-3.5" />
              Replace file
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) startUpload(f);
                }}
              />
            </label>
          )}
        </div>
      )}

      <button className="mt-3 text-xs text-muted-foreground underline underline-offset-2">
        None of my items require a prescription
      </button>
    </div>
  );
}

function CouponStep({
  subtotal,
  rawDelivery,
  applied,
  setApplied,
  setDiscountAmount,
}: {
  subtotal: number;
  rawDelivery: number;
  applied: string | null;
  setApplied: (code: string | null) => void;
  setDiscountAmount: (val: number) => void;
}) {
  const [code, setCode] = useState(applied ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<{ id?: string, _id?: string, code: string, title?: string, description?: string, discountType?: 'percentage' | 'fixed', discountValue?: number }[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await apiGet<{ success: boolean; coupons?: { id?: string, _id?: string, code: string, title?: string, description?: string, discountType?: 'percentage' | 'fixed', discountValue?: number }[] }>('/api/customer/v1/coupons');
        if (res.success || res.coupons) {
          setOffers(res.coupons || []);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number }; message?: string };
        console.error("Failed to fetch coupons:", error?.response?.status || error?.message);
      }
    };
    fetchOffers();
  }, []);

  const apply = async (raw: string) => {
    const value = raw.trim().toUpperCase();
    if (!value) {
      setError("Enter a coupon code to continue.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ success: boolean; code: string; discount: number }>('/api/customer/v1/coupons/apply', {
        code: value,
        subtotal,
        deliveryFee: rawDelivery
      });
      
      if (res.success) {
        setApplied(res.code);
        setCode(res.code);
        setDiscountAmount(res.discount);
        toast.success(`${res.code} applied — you saved ${formatINR(res.discount)}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || `"${value}" isn't a valid coupon code.`);
      setApplied(null);
      setDiscountAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setDiscountAmount(0);
    setCode("");
    setError(null);
    toast.message("Coupon removed");
  };

  const errorId = "coupon-inline-error";
  return (
    <div>
      <h2 className="font-display text-xl font-medium">Apply a coupon</h2>
      <p className="text-sm text-muted-foreground">Enter a code or pick from your saved offers.</p>
      {error && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="coupon-error-summary"
          className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/[0.06] p-3 text-xs text-destructive"
        >
          <span className="font-semibold">Coupon problem:</span> {error}
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply(code);
            }
          }}
          placeholder="Enter coupon code"
          data-testid="coupon-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex-1 rounded-full border bg-background px-4 py-3 text-sm outline-none focus:border-primary",
            error ? "border-destructive focus:border-destructive" : "border-border",
          )}
        />
        <button
          type="button"
          onClick={() => apply(code)}
          disabled={loading}
          data-testid="coupon-apply"
          className="rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </div>
      {error && (
        <p
          id={errorId}
          data-testid="coupon-inline-error"
          className="mt-2 text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {offers.map((c) => {
          const isApplied = applied === c.code;
          return (
            <div
              key={c.code}
              className={cn(
                "flex items-center justify-between rounded-2xl border border-dashed p-4 transition-colors",
                isApplied ? "border-primary bg-primary-soft" : "border-primary/40 bg-primary-soft",
              )}
            >
              <div>
                <div className="text-sm font-semibold text-primary">{c.code}</div>
                <div className="text-xs text-muted-foreground">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => (isApplied ? remove() : apply(c.code))}
                aria-pressed={isApplied}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                  isApplied
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {isApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-medium">Payment method</h2>
      <p className="text-sm text-muted-foreground">Choose how you'd like to pay.</p>
      <div className="mt-6 space-y-3" role="radiogroup" aria-label="Payment method selection">
        {[
          { id: "UPI", label: "UPI", hint: "Pay via any UPI app" },
          { id: "CARD", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay" },
          { id: "NET_BANKING", label: "Net banking", hint: "All major banks" },
          { id: "PAY_ON_DELIVERY", label: "Cash on delivery", hint: "Pay when your order arrives" },
        ].map((p, i) => (
          <label
            key={p.label}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
          >
            <input 
              type="radio" 
              name="pay" 
              checked={selected === p.id} 
              onChange={() => onSelect(p.id)}
              className="accent-primary" 
            />
            <div>
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-xs text-muted-foreground">{p.hint}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({
  lines,
  data,
  subtotal,
  deliveryTotal,
  discount,
  couponCode,
  taxes,
  total,
  address,
  slot,
  onChangeSlot,
  stockIssues = [],
}: {
  lines: any[];
  data: { products: Product[]; pharmacies: Pharmacy[]; } | null | undefined;
  subtotal: number;
  deliveryTotal: number;
  discount: number;
  couponCode?: string | null;
  taxes: number;
  total: number;
  address: Address | null;
  slot?: { id: string; title: string; eta: string; etaMinutes: number } | null;
  onChangeSlot: () => void;
  stockIssues?: { productId: string; stock: number; requested: number; name?: string }[];
}) {
  const setQty = useCart((s) => s.setQty);
  const stockMap = new Map<string, { stock: number; requested: number }>(
    (stockIssues as { productId: string; stock: number; requested: number }[]).map((i) => [
      i.productId,
      { stock: i.stock, requested: i.requested },
    ]),
  );
  return (
    <div>
      <h2 className="font-display text-xl font-medium">Review your order</h2>
      <p className="text-sm text-muted-foreground">
        You'll get a confirmation and live delivery updates.
      </p>
      {address ? (
        <div
          data-testid="review-address"
          className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm"
        >
          <div className="flex items-center gap-2 font-semibold">
            {address.label}
            {address.isDefault && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Default
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {address.name} · {address.phone}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {formatAddress(address)}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/[0.06] p-4 text-xs text-destructive">
          No delivery address set. Please add one before placing the order.
        </div>
      )}
      {slot && (
        <div
          data-testid="review-slot"
          className="mt-3 flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-sm"
        >
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Delivery slot</div>
            <div className="mt-1 font-medium">{slot.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {slot.eta} · ~{slot.etaMinutes} min ETA
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeSlot}
            data-testid="review-change-slot"
            className="shrink-0 rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Change
          </button>
        </div>
      )}
      {stockIssues.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="stock-error-summary"
          className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/[0.06] p-4 text-xs text-destructive"
        >
          <div className="font-semibold">
            {stockIssues.length} item{stockIssues.length === 1 ? "" : "s"} exceed available stock
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {stockIssues.map((i: { productId: string; stock: number; requested: number; name?: string }) => (
              <li key={i.productId}>
                {i.name}: only {i.stock} available (you have {i.requested}).
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 space-y-4" data-testid="review-items">
        {lines.map((l: any) => {
          const p = data?.products.find((x: NonNullable<NonNullable<typeof data>>["products"][number]) => x?.id === l.productId);
          if (!p) return null;
          const issue = stockMap.get(l.productId);
          const errId = `stock-err-${l.productId}`;
          const isTablet = l.unitType === "tablet";
          const perTab = p.tabletPrice || (p.unitsPerStrip ? Number((p.price / p.unitsPerStrip).toFixed(2)) : p.price);
          const linePrice = isTablet ? perTab * l.quantity : (p.stripPrice || p.price) * l.quantity;
          const unitsPerStrip = p.unitsPerStrip || 10;

          return (
            <div
              key={`${l.productId}-${l.pharmacyId}-${l.unitType || "strip"}`}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl p-2 transition-colors",
                issue && "bg-destructive/[0.04] ring-1 ring-destructive/30",
              )}
              data-testid={`review-line-${l.productId}`}
              data-has-stock-error={issue ? "true" : "false"}
            >
              <Image src={p.image} alt={p.name} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
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
                  <span className="text-[11px] text-muted-foreground">
                    {isTablet ? `@ ${formatINR(perTab)}/tab` : `@ ${formatINR(p.stripPrice || p.price)}/strip`}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center rounded-full border",
                  issue ? "border-destructive" : "border-border",
                )}
                data-testid={`review-qty-${l.productId}`}
              >
                <button
                  type="button"
                  aria-label={`Decrease ${p.name}`}
                  onClick={() => setQty(l.productId, l.pharmacyId, l.quantity - 1, p.stock, l.unitType)}
                  className="grid h-7 w-7 place-items-center text-sm"
                >
                  −
                </button>
                <span
                  className="w-6 text-center text-xs font-semibold tabular-nums"
                  aria-invalid={issue ? true : undefined}
                  aria-describedby={issue ? errId : undefined}
                >
                  {l.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${p.name}`}
                  onClick={() => {
                    if (p.stock && l.quantity >= p.stock) {
                      toast.error("Insufficient Stock");
                      return;
                    }
                    setQty(l.productId, l.pharmacyId, l.quantity + 1, p.stock, l.unitType);
                  }}
                  className="grid h-7 w-7 place-items-center text-sm"
                >
                  +
                </button>
              </div>
              <div className="w-20 text-right text-sm font-semibold">
                {formatINR(linePrice)}
              </div>
              {issue && (
                <p
                  id={errId}
                  data-testid={`review-stock-error-${l.productId}`}
                  className="w-full text-xs font-medium text-destructive"
                >
                  Only {issue.stock} in stock. Reduce quantity to continue.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
        <Row label="Subtotal" value={formatINR(subtotal)} />
        <Row label="Delivery" value={deliveryTotal === 0 ? "Free" : formatINR(deliveryTotal)} />
        <Row label="Taxes" value={formatINR(taxes)} muted />
        {discount > 0 && (
          <div className="flex items-baseline justify-between text-primary">
            <span className="font-medium">Coupon {couponCode}</span>
            <span className="font-medium">−{formatINR(discount)}</span>
          </div>
        )}
        <div className="mt-3 border-t border-border pt-3">
          <Row label="Total" value={formatINR(total)} strong />
          {discount > 0 && (
            <div className="mt-1 text-right text-xs font-medium text-primary">
              You saved {formatINR(discount)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
