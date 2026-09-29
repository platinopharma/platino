import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FormState, DocStatus } from "@/features/onboarding/types";
import { initialFormState, ONBOARDING_STORAGE_KEY, LIVE_STORAGE_KEY, STEPS } from "@/features/onboarding/constants";

interface OnboardingStoreState {
  stepIdx: number;
  state: FormState;
  errors: Record<string, string>;
  verifyPct: number;
  verifyDone: boolean;
  savedAt: number | null;
  setStepIdx: (updater: number | ((prev: number) => number)) => void;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  setErrors: (updater: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setDocStatus: (key: string, status: DocStatus) => void;
  setVerifyProgress: (pct: number, done: boolean) => void;
  resetWizard: () => void;
  activateLiveStore: () => void;
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set, get) => ({
      stepIdx: 0,
      state: initialFormState,
      errors: {},
      verifyPct: 0,
      verifyDone: false,
      savedAt: null,

      setStepIdx: (updater) => {
        const next = typeof updater === "function" ? updater(get().stepIdx) : updater;
        set({ stepIdx: Math.max(0, Math.min(STEPS.length - 1, next)), savedAt: Date.now() });
      },

      updateField: (key, value) => {
        set((prev) => {
          const nextState = { ...prev.state, [key]: value };
          const nextErrors = { ...prev.errors };
          if (Object.keys(nextErrors).length > 0) {
            delete nextErrors[key as string];
            delete nextErrors.submit;
            if (key === "otpSent" || key === "otp" || key === "signupVerified") delete nextErrors.otp;
            if (key === "lat" || key === "lng") delete nextErrors.location;
          }
          return { state: nextState, errors: nextErrors, savedAt: Date.now() };
        });
      },

      setErrors: (updater) => {
        set((prev) => ({
          errors: typeof updater === "function" ? updater(prev.errors) : updater,
        }));
      },

      setDocStatus: (key, status) => {
        set((prev) => {
          const nextDocs = { ...prev.state.docs, [key]: status };
          const nextErrors = { ...prev.errors };
          delete nextErrors.docs;
          return {
            state: { ...prev.state, docs: nextDocs },
            errors: nextErrors,
            savedAt: Date.now(),
          };
        });
      },

      setVerifyProgress: (pct, done) => {
        set({ verifyPct: pct, verifyDone: done });
      },

      resetWizard: () => {
        set({
          stepIdx: 0,
          state: initialFormState,
          errors: {},
          verifyPct: 0,
          verifyDone: false,
          savedAt: null,
        });
      },

      activateLiveStore: () => {
        const { state } = get();
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              LIVE_STORAGE_KEY,
              JSON.stringify({
                pharmacyName: state.pharmacyName,
                city: state.city,
                opens: state.opens,
                closes: state.closes,
                radius: state.radius,
                minOrder: state.minOrder,
                payments: state.payments,
                email: state.email,
                activatedAt: Date.now(),
              })
            );
          } catch {
            // storage disabled or quota full - silent catch
          }
        }
        // Once activated, clear onboarding progress
        get().resetWizard();
      },
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (store) => {
        const { password, otp, otpSent, signupVerified, ...safeState } = store.state;
        return {
          stepIdx: store.stepIdx,
          state: {
            ...safeState,
            password: "",
            otp: "",
            otpSent: false,
            signupVerified: false,
          },
          savedAt: store.savedAt ?? Date.now(),
        };
      },
      merge: (persistedState: any, currentState) => {
        if (!persistedState || !persistedState.state) return currentState;
        // Expire sessions older than 24 hours
        if (persistedState.savedAt && Date.now() - persistedState.savedAt > 24 * 60 * 60 * 1000) {
          return currentState;
        }
        const state = persistedState.state;
        const docs = { ...initialFormState.docs, ...state.docs };
        // Reset any in-flight upload state on rehydrate
        for (const k of Object.keys(docs)) {
          if (docs[k] === "uploading") docs[k] = "idle";
        }
        return {
          ...currentState,
          stepIdx: persistedState.stepIdx ?? 0,
          savedAt: persistedState.savedAt ?? null,
          state: { ...initialFormState, ...state, docs },
        };
      },
    }
  )
);
