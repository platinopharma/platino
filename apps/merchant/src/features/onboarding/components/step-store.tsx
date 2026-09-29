"use client";
import React from "react";
import { FormState } from "@/features/onboarding/types";
import { Field, inputCls } from "./ui-helpers";

export function StoreStep({
  state,
  update,
  errors,
}: {
  state: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Record<string, string>;
}) {
  const togglePay = (k: keyof FormState["payments"]) =>
    update("payments", { ...state.payments, [k]: !state.payments[k] });

  return (
    <div>
      <h3 className="font-display text-2xl text-ink">Set up your store</h3>
      <p className="mt-1 text-sm text-ink-muted">
        These control when customers can order and how far you deliver. You can change these anytime.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Operating hours" error={errors.hours}>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={state.opens}
                onChange={(e) => update("opens", e.target.value)}
                className={inputCls()}
              />
              <span className="text-ink-subtle">→</span>
              <input
                type="time"
                value={state.closes}
                onChange={(e) => update("closes", e.target.value)}
                className={inputCls()}
              />
            </div>
          </Field>
          <Field
            label={`Delivery radius: ${state.radius} km`}
            error={errors.radius}
            hint="How far from your store you're willing to deliver"
          >
            <input
              type="range"
              min={1}
              max={25}
              value={state.radius}
              onChange={(e) => update("radius", Number(e.target.value))}
              className="w-full accent-ink"
            />
          </Field>
          <Field label="Minimum order (₹)" error={errors.minOrder}>
            <input
              type="number"
              value={state.minOrder}
              onChange={(e) => update("minOrder", Number(e.target.value))}
              className={inputCls(errors.minOrder)}
            />
          </Field>
        </div>
        <div>
          <Field label="Payment methods" error={errors.payments}>
            <div className="space-y-2">
              {(
                [
                  { k: "upi", label: "UPI · GPay, PhonePe, Paytm", rec: true },
                  { k: "card", label: "Credit / Debit card" },
                  { k: "cod", label: "Cash on delivery" },
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.k}
                  onClick={() => togglePay(p.k)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm transition-colors ${
                    state.payments[p.k as keyof FormState["payments"]]
                      ? "border-ink bg-ink/5 text-ink"
                      : "border-line bg-paper text-ink-muted hover:border-ink/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`grid size-4 place-items-center rounded border ${
                        state.payments[p.k as keyof FormState["payments"]]
                          ? "border-ink bg-ink text-paper"
                          : "border-line"
                      }`}
                    >
                      {state.payments[p.k as keyof FormState["payments"]] && (
                        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {p.label}
                  </span>
                  {"rec" in p && p.rec && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-brand">recommended</span>
                  )}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
