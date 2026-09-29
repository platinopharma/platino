"use client";
import React, { useState } from "react";
import { FormState } from "@/features/onboarding/types";
import { Truck, Store, Check, CreditCard } from "lucide-react";
import { apiPost } from "@/lib/axios";
import { toast } from "sonner";

export function DeliveryStep({
  state,
  update,
  errors,
  onPaymentSuccess,
}: {
  state: FormState;
  update: (key: keyof FormState, val: any) => void;
  errors: Record<string, string>;
  onPaymentSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const plans = [
    { months: 1, price: 149, save: 0 },
    { months: 3, price: 399, save: 10 },
    { months: 6, price: 699, save: 22 },
    { months: 12, price: 1199, save: 33 },
  ];

  const handleRazorpay = async () => {
    if (!state.subscriptionPlan) return;

    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await apiPost<{ order: { id: string; amount: number } }>("/v1/pharmacy/payment/order", {
        registrationId: state.registrationId,
        months: state.subscriptionPlan,
      });

      // 2. Load Razorpay script if not already loaded
      if (!(window as { Razorpay?: any }).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Razorpay script failed to load. Please disable your adblocker and try again."));
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay checkout
      const options = {
        key: "rzp_test_TNxD72K9SfByPU", // Hardcoded to ensure no process.env bug
        amount: orderRes.order.amount,
        currency: "INR",
        name: "Platino Pharma",
        description: `Subscription for ${state.subscriptionPlan} months`,
        order_id: orderRes.order.id,
        handler: async function (response: Record<string, unknown>) {
          try {
            await apiPost("/v1/pharmacy/payment/verify", {
              registrationId: state.registrationId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment verified successfully!");
            onPaymentSuccess();
          } catch (err: unknown) {
            const e = err instanceof Error ? err : new Error(String(err));
            toast.error(e.message || "Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: state.ownerName,
          email: state.email,
          contact: state.phone,
        },
        theme: {
          color: "#059669", // text-brand
        },
      };

      const rzp = new (window as { Razorpay?: any }).Razorpay(options);
      rzp.on("payment.failed", function (response: { error?: { description?: string } }) {
        toast.error(response.error?.description ?? "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error("Razorpay Error:", err);
      // Razorpay script onerror might reject with an Event object instead of Error
      toast.error((err instanceof Error ? err.message : String(err)) || (err instanceof Event ? "Adblocker prevented Razorpay from loading. Please disable it and try again." : "Failed to initialize payment"));
      setLoading(false);
    }
  };

  const handlePlatinoDelivery = async () => {
    setLoading(true);
    try {
      await apiPost("/v1/pharmacy/delivery-mode", {
        registrationId: state.registrationId,
      });
      toast.success("Delivery mode set to Platino Partner!");
      onPaymentSuccess();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || "Failed to set delivery mode");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Delivery Logistics
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          Choose how you want to deliver medicines to customers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            update("deliveryMode", "platino");
            update("subscriptionPlan", null);
          }}
          className={`flex flex-col items-start rounded-xl border p-5 text-left transition-all ${state.deliveryMode === "platino"
            ? "border-brand bg-brand/5 ring-1 ring-brand"
            : "border-line bg-paper-alt/40 hover:border-brand/40"
            }`}
        >
          <div className="mb-4 rounded-full bg-brand/10 p-3 text-brand">
            <Truck className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-ink">Platino Partner Delivery</h4>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Platino delivery executives will pick up the package from your store and deliver it to the customer. No subscription fee required.
          </p>
          {state.deliveryMode === "platino" && (
            <div className="mt-4 flex items-center text-xs font-semibold text-brand">
              <Check className="mr-1.5 h-4 w-4" /> Selected
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            update("deliveryMode", "own");
            if (!state.subscriptionPlan) update("subscriptionPlan", 1);
          }}
          className={`flex flex-col items-start rounded-xl border p-5 text-left transition-all ${state.deliveryMode === "own"
            ? "border-brand bg-brand/5 ring-1 ring-brand"
            : "border-line bg-paper-alt/40 hover:border-brand/40"
            }`}
        >
          <div className="mb-4 rounded-full bg-ink p-3 text-paper">
            <Store className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-ink">Own Delivery (Self-Serve)</h4>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            You will fulfill the orders using your own delivery staff. Requires an active platform subscription.
          </p>
          {state.deliveryMode === "own" && (
            <div className="mt-4 flex items-center text-xs font-semibold text-brand">
              <Check className="mr-1.5 h-4 w-4" /> Selected
            </div>
          )}
        </button>
      </div>
      {errors.deliveryMode && (
        <p className="text-xs text-alert">{errors.deliveryMode}</p>
      )}

      {state.deliveryMode === "own" && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
          <h4 className="mb-4 font-semibold text-ink text-sm uppercase tracking-wider">Choose Subscription Plan</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {plans.map((p) => (
              <button
                key={p.months}
                type="button"
                onClick={() => update("subscriptionPlan", p.months)}
                className={`relative flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all ${state.subscriptionPlan === p.months
                  ? "border-brand bg-brand/10 ring-1 ring-brand"
                  : "border-line bg-paper-alt/20 hover:border-brand/40"
                  }`}
              >
                {p.save > 0 && (
                  <div className="absolute -top-2.5 rounded-full bg-alert px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    Save {p.save}%
                  </div>
                )}
                <span className="text-2xl font-bold text-ink">₹{p.price}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted mt-1">
                  {p.months} {p.months === 1 ? "Month" : "Months"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleRazorpay}
              disabled={loading || !state.subscriptionPlan}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-brand-ink disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay & Continue
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {state.deliveryMode === "platino" && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="mt-6 flex justify-end">
            <button
              onClick={handlePlatinoDelivery}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-brand-ink disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Continue with Platino Delivery
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
