"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormState } from "@/features/onboarding/types";
import { apiPost } from "@/lib/axios";

export function ActivateStep({
  state,
  onActivated,
}: {
  state: FormState;
  onActivated: () => void;
}) {
  const name = state.pharmacyName?.trim() || "Your pharmacy";
  const city = state.city?.trim();
  const fired = useRef(false);
  const [storeId, setStoreId] = useState("PLX-••••••");
  const [activatedAt, setActivatedAt] = useState("Just now");

  useEffect(() => {
    setStoreId(`PLX-${Math.floor(100000 + Math.random() * 899999)}`);
    setActivatedAt(
      new Date().toLocaleString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    if (fired.current) return;
    fired.current = true;
    
    if (state.registrationId) {
       apiPost("/v1/pharmacy/activate", { registrationId: state.registrationId }).catch(() => {});
    }

    onActivated();
  }, [onActivated, state.registrationId]);

  const enabledPayments = [
    state.payments.upi && "UPI",
    state.payments.card && "Card",
    state.payments.cod && "COD",
  ].filter(Boolean) as string[];

  const summary: { k: string; v: string }[] = [
    { k: "Store ID", v: storeId },
    { k: "Hours", v: `${state.opens} – ${state.closes}` },
    { k: "Delivery", v: `${state.radius} km radius` },
    { k: "Min. order", v: `₹${state.minOrder}` },
    { k: "Payments", v: enabledPayments.join(" · ") || "—" },
    { k: "Activated", v: activatedAt },
  ];

  const actions: { label: string; caption: string }[] = [
    { label: "Open live dashboard", caption: "Real-time operations view" },
    { label: "Import inventory", caption: "Bulk CSV or manual entry" },
    { label: "Invite staff", caption: "Pharmacist & delivery roles" },
  ];

  return (
    <div className="flex min-h-[420px] flex-col items-center text-center">
      <div className="relative mb-6 grid size-20 place-items-center">
        <motion.span
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-signal/20"
          aria-hidden
        />
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
          className="grid size-20 place-items-center rounded-full bg-signal/10 text-signal ring-4 ring-signal/15"
        >
          <svg
            className="size-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-signal"
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-signal opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
        </span>
        Store live
      </div>

      <h3 className="mt-4 max-w-xl font-display text-3xl leading-tight text-ink sm:text-4xl">
        {name} is now accepting orders{city ? ` in ${city}` : ""}.
      </h3>
      <p className="mt-3 max-w-md text-ink-muted">
        Your dashboard is ready. Import inventory, invite your team, and process
        your first order in minutes.
      </p>

      <dl className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-left sm:grid-cols-3">
        {summary.map((row) => (
          <div key={row.k} className="bg-paper px-4 py-3">
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              {row.k}
            </dt>
            <dd className="mt-1 truncate text-sm font-medium text-ink">
              {row.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.label}
            href="/live"
            className="group flex flex-col items-start rounded-lg border border-line bg-paper p-4 text-left transition-colors hover:border-ink"
          >
            <span className="text-sm font-medium text-ink">
              {a.label} <span aria-hidden className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
            </span>
            <span className="mt-1 text-xs text-ink-muted">{a.caption}</span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink-subtle">
        A confirmation has been sent to <span className="text-ink">{state.email || "your registered email"}</span>.
      </p>
    </div>
  );
}
