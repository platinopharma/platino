import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEGAL_VERSION } from "@/lib/legal-content";

// ---- Cookie consent ----------------------------------------------------
// Necessary cookies are always on. Everything else is granular and opt-in.
export type ConsentCategory = "necessary" | "preferences" | "analytics" | "performance";

export interface ConsentState {
  decidedAt: string | null;
  categories: Record<ConsentCategory, boolean>;
  setAll: (v: boolean) => void;
  setCategory: (c: ConsentCategory, v: boolean) => void;
  save: (categories?: Partial<Record<ConsentCategory, boolean>>) => void;
  reset: () => void;
}

const DEFAULT_CATEGORIES: Record<ConsentCategory, boolean> = {
  necessary: true,
  preferences: false,
  analytics: false,
  performance: false,
};

export const useConsent = create<ConsentState>()(
  persist(
    (set, get) => ({
      decidedAt: null,
      categories: DEFAULT_CATEGORIES,
      setAll: (v) =>
        set({
          categories: {
            necessary: true,
            preferences: v,
            analytics: v,
            performance: v,
          },
        }),
      setCategory: (c, v) =>
        set((s) => ({
          categories: { ...s.categories, [c]: c === "necessary" ? true : v },
        })),
      save: (partial) => {
        const current = get().categories;
        set({
          categories: {
            ...current,
            ...(partial ?? {}),
            necessary: true,
          },
          decidedAt: new Date().toISOString(),
        });
      },
      reset: () => set({ categories: DEFAULT_CATEGORIES, decidedAt: null }),
    }),
    { name: "platino-consent" },
  ),
);

// ---- Legal acceptance (T&C + Privacy) ---------------------------------
// Tracked by legal version so a bump requires re-acceptance.
export interface LegalAcceptanceState {
  acceptedVersion: string | null;
  acceptedAt: string | null;
  accept: () => void;
  clear: () => void;
  isCurrent: () => boolean;
}

export const useLegalAcceptance = create<LegalAcceptanceState>()(
  persist(
    (set, get) => ({
      acceptedVersion: null,
      acceptedAt: null,
      accept: () =>
        set({
          acceptedVersion: LEGAL_VERSION,
          acceptedAt: new Date().toISOString(),
        }),
      clear: () => set({ acceptedVersion: null, acceptedAt: null }),
      isCurrent: () => get().acceptedVersion === LEGAL_VERSION,
    }),
    { name: "platino-legal-acceptance" },
  ),
);
