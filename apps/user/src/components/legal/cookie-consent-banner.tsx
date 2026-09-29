'use client';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Cookie, X, ChevronDown, Check } from "lucide-react";
import { useConsent, type ConsentCategory } from "@/stores/consent";
import { cn } from "@/lib/utils";

const CATEGORIES: {
  key: ConsentCategory;
  label: string;
  description: string;
  locked?: boolean;
}[] = [
  {
    key: "necessary",
    label: "Strictly necessary",
    description: "Sign-in, cart, security and other core features. Always on.",
    locked: true,
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Remember your delivery area, theme, and language choices.",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Aggregate usage data that helps us improve the product.",
  },
  {
    key: "performance",
    label: "Performance",
    description: "Detect errors and slow requests to keep the platform fast.",
  },
];

export function CookieConsentBanner() {
  const decidedAt = useConsent((s) => s.decidedAt);
  const categories = useConsent((s) => s.categories);
  const save = useConsent((s) => s.save);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(categories);

  useEffect(() => setMounted(true), []);
  useEffect(() => setDraft(categories), [categories]);

  if (!mounted || decidedAt) return null;

  const setDraftCat = (k: ConsentCategory, v: boolean) =>
    setDraft((d) => ({ ...d, [k]: k === "necessary" ? true : v }));

  const acceptAll = () =>
    save({ preferences: true, analytics: true, performance: true });
  const rejectAll = () =>
    save({ preferences: false, analytics: false, performance: false });
  const saveDraft = () => save(draft);

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-[420px]"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated backdrop-blur">
        <div className="flex items-start gap-3 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] tracking-tight text-foreground">
              We use cookies to run the platform.
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              Necessary cookies keep the site working. You can allow or refuse optional
              categories. See our{" "}
              <Link
                href={`/legal/${"cookies"}`}
                
                className="font-semibold text-primary hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={rejectAll}
            aria-label="Reject optional cookies"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="cookie-consent-details"
          className="flex w-full items-center justify-between border-t border-border px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-foreground/70 hover:bg-muted/40"
        >
          <span>Customize</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {expanded && (
          <ul id="cookie-consent-details" className="border-t border-border divide-y divide-border">
            {CATEGORIES.map((c) => {
              const on = c.locked ? true : draft[c.key];
              return (
                <li key={c.key} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground">{c.label}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                      {c.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={c.locked}
                    onClick={() => setDraftCat(c.key, !on)}
                    role="switch"
                    aria-checked={on}
                    aria-label={`${on ? "Disable" : "Enable"} ${c.label}`}
                    className={cn(
                      "relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors",
                      on
                        ? "border-primary bg-primary"
                        : "border-border bg-muted",
                      c.locked && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-all",
                        on ? "left-[calc(100%-1rem)]" : "left-0.5",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center gap-2 border-t border-border bg-muted/30 p-3">
          <button
            type="button"
            onClick={rejectAll}
            className="h-9 flex-1 rounded-full border border-border bg-surface-elevated px-3 text-xs font-semibold text-foreground/80 hover:border-primary/40 hover:text-primary"
          >
            Reject optional
          </button>
          {expanded ? (
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-95"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Save choices
            </button>
          ) : (
            <button
              type="button"
              onClick={acceptAll}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground hover:opacity-95"
            >
              Accept all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
