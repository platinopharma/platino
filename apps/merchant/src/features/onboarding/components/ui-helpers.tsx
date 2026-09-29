"use client";
import React, { useState, useEffect } from "react";
import { DocStatus } from "@/features/onboarding/types";

export function SavedIndicator({ savedAt }: { savedAt: number | null }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!savedAt) return <span>Progress will be saved automatically</span>;
  const s = Math.max(1, Math.floor((Date.now() - savedAt) / 1000));
  const label =
    s < 5 ? "just now" : s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)}m ago` : `${Math.floor(s / 3600)}h ago`;
  return (
    <span aria-live="polite" data-tick={tick}>
      Saved {label}
    </span>
  );
}

export function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted font-semibold">{label}</span>
      </div>
      {children}
      {error && <div className="mt-1 text-[11px] text-alert">{error}</div>}
      {hint && !error && <div className="mt-1 text-[11px] text-ink-muted">{hint}</div>}
    </label>
  );
}

export function inputCls(err?: string) {
  return `w-full min-h-11 rounded-md border ${
    err ? "border-alert" : "border-line"
  } bg-paper-alt/40 px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle outline-none transition-colors focus:border-brand focus:bg-paper`;
}

export function DocBadge({ state }: { state: DocStatus }) {
  if (state === "verified")
    return (
      <span className="rounded-full border border-signal/25 bg-signal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal">
        verified
      </span>
    );
  if (state === "uploading")
    return (
      <span className="rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand">
        uploading
      </span>
    );
  return (
    <span className="rounded-full border border-line bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
      pending
    </span>
  );
}
