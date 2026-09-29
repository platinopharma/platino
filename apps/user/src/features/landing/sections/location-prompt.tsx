'use client';

import { MapPin, X } from "lucide-react";
import { useLocation } from "@/stores";
import { catalogService } from "@/services";

export function LocationPrompt() {
  const dismissed = useLocation((s) => s.promptDismissed);
  const dismiss = useLocation((s) => s.dismissPrompt);
  const setArea = useLocation((s) => s.setArea);
  const areas = catalogService.areas();

  return (
    <>
      {!dismissed && (
        <div
          className="mx-auto mt-4 w-[min(920px,calc(100%-2rem))] rounded-2xl border border-border glass-strong px-4 py-3 shadow-soft sm:px-5"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium">Where should we deliver?</div>
              <div className="text-xs text-muted-foreground">
                Pick your area to see verified pharmacies nearby.
              </div>
            </div>
            <div className="hidden shrink-0 gap-1.5 sm:flex">
              {areas.slice(0, 3).map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setArea(a.id);
                    dismiss();
                  }}
                  className="h-8 rounded-full border border-border bg-surface-elevated px-3 text-xs font-medium hover:border-primary"
                >
                  {a.area}
                </button>
              ))}
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
