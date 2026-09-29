"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useHydrated } from "@/hooks/useHydrated";
import { STEPS, DOC_LIST } from "./constants";
import { SavedIndicator } from "./components/ui-helpers";
import { SignupStep } from "./components/step-signup";
import { BusinessStep } from "./components/step-business";
import { DocsStep } from "./components/step-documents";
import { StoreStep } from "./components/step-store";
import { DeliveryStep } from "./components/step-delivery";
import { VerifyStep } from "./components/step-verify";
import { ActivateStep } from "./components/step-activate";
import { api, apiPost, apiGet } from "@/lib/axios";
import { isValidEmail, isValidPhone, isValidGstin, isValidDrugLicense, isValidPincode } from "@/lib/validators";

export function JoinWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();
  const {
    stepIdx,
    state,
    errors,
    verifyPct,
    verifyDone,
    savedAt,
    setStepIdx,
    updateField,
    setErrors,
    setDocStatus,
    setVerifyProgress,
    resetWizard,
    activateLiveStore,
  } = useOnboardingStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      resetWizard();
      router.replace("/onboarding");
    }
  }, [searchParams, router, resetWizard]);

  const step = STEPS[stepIdx];
  const progress = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (step.id === "signup") {
      if (!isValidEmail(state.email)) e.email = "Enter a valid email";
      if (!isValidPhone(state.phone) && !/^\+?\d{10,13}$/.test(state.phone.replace(/\s/g, "")))
        e.phone = "Enter a valid phone number";
      if (!state.otpSent) e.otp = "Send & verify the OTP emailed to you";
      else if (state.otp.length !== 6) e.otp = "Enter the 6-digit code";
      else if (!state.signupVerified) e.otp = "Verify the code to continue";
    }
    if (step.id === "business") {
      if (state.pharmacyName.trim().length < 3) e.pharmacyName = "Pharmacy name is required (min 3 chars)";
      if (state.ownerName.trim().length < 3) e.ownerName = "Owner name is required (min 3 chars)";
      if (state.gst.trim().length < 8) e.gst = "Enter a valid GST number (min 8 chars)";
      if (state.license.trim().length < 3) e.license = "Enter a valid drug license number";
      if (state.address.trim().length < 4) e.address = "Add a valid full address";
      if (state.city.trim().length < 2) e.city = "City is required";
      if ((state.addressState || "").trim().length < 2) e.addressState = "State is required";
      if ((state.pincode || "").replace(/\D/g, "").length < 4) e.pincode = "Valid pincode is required";
      
      const numLat = state.lat != null ? Number(state.lat) : null;
      const numLng = state.lng != null ? Number(state.lng) : null;
      if (numLat == null || isNaN(numLat) || numLng == null || isNaN(numLng)) {
        e.location = "Please detect your GPS location or enter coordinates";
      }
    }
    if (step.id === "documents") {
      const missing = DOC_LIST.filter((d) => d.required && state.docs[d.key] !== "verified");
      if (missing.length) e.docs = `${missing.length} required document(s) not verified yet`;
    }
    if (step.id === "store") {
      if (!state.opens || !state.closes) e.hours = "Set opening and closing time";
      if (state.radius < 1 || state.radius > 25) e.radius = "Delivery radius 1–25 km";
      if (state.minOrder < 0) e.minOrder = "Minimum order must be ≥ 0";
      const anyPay = Object.values(state.payments).some(Boolean);
      if (!anyPay) e.payments = "Enable at least one payment method";
    }
    if (step.id === "delivery") {
      if (!state.deliveryMode) e.deliveryMode = "Please select a delivery mode";
      if (state.deliveryMode === "own" && !state.subscriptionPlan) {
        e.deliveryMode = "Please select a subscription plan";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [step.id, state, setErrors]);

  const runVerification = useCallback(() => {
    setVerifyProgress(0, false);
    const t = setInterval(async () => {
      const currentRegId = useOnboardingStore.getState().state.registrationId;
      if (currentRegId) {
        try {
          const res = await apiGet<{ status?: string; isApproved?: boolean }>(`/v1/pharmacy/verification-status?registrationId=${currentRegId}`).catch(() => ({ status: "PENDING", isApproved: false }));
          if (res && (res.status === "APPROVED" || res.isApproved)) {
            clearInterval(t);
            useOnboardingStore.setState({ verifyPct: 100, verifyDone: true });
            return;
          }
        } catch {
          // ignore
        }
      }
      // Stay pending, do not auto-advance
      useOnboardingStore.setState({ verifyPct: 50, verifyDone: false });
    }, 5000); // Check every 5 seconds instead of 500ms
  }, [setVerifyProgress]);

  const next = useCallback(async () => {
    if (!validate()) return;
    if (step.id === "verify" && !verifyDone) return;

    if (step.id === "business" && state.registrationId) {
      try {
        await apiPost("/v1/pharmacy/business-details", {
          registrationId: state.registrationId,
          pharmacyName: state.pharmacyName.trim(),
          ownerName: state.ownerName.trim(),
          gstNumber: state.gst.trim().toUpperCase(),
          drugLicenseNumber: state.license.trim().toUpperCase(),
          addressLine1: state.address.trim(),
          addressLine2: (state.addressLine2 || "").trim(),
          landmark: (state.landmark || "").trim(),
          city: state.city.trim(),
          state: (state.addressState || "").trim(),
          pincode: (state.pincode || "").trim(),
          lat: state.lat != null ? Number(state.lat) : null,
          lng: state.lng != null ? Number(state.lng) : null,
        });
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error || (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || "Failed to save business details";
        const fieldErrors = (err as { response?: { data?: { fields?: Record<string, string> } } })?.response?.data?.fields || {};
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg) });
        }
        return;
      }
    }

    if (step.id === "store" && state.registrationId) {
      try {
        const enabledPayments = [
          state.payments.upi && "UPI",
          state.payments.card && "CARD",
          state.payments.cod && "COD",
        ].filter(Boolean) as string[];

        await apiPost("/v1/pharmacy/store-settings", {
          registrationId: state.registrationId,
          operatingHours: {
            monday: { open: state.opens, close: state.closes },
          },
          deliveryRadius: state.radius,
          minimumOrderAmount: state.minOrder,
          paymentMethods: enabledPayments,
        });
      } catch (err: unknown) {
        const e = err as { message?: string; fields?: Record<string, string> };
        if (e.message === "Validation failed" && e.fields) {
          setErrors(e.fields);
        } else {
          setErrors({ payments: e.message || "Failed to save store settings" });
        }
        return;
      }
    }

    if (step.id === "delivery" && state.registrationId) {
      if (state.deliveryMode === "platino") {
        try {
          await apiPost("/v1/pharmacy/delivery-mode", {
            registrationId: state.registrationId,
            mode: "platino",
          });
        } catch (err: unknown) {
          const e = err instanceof Error ? err : new Error(String(err));
          setErrors({ deliveryMode: e.message || "Failed to save delivery mode" });
          return;
        }
      }
    }

    setErrors({});
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    if (STEPS[stepIdx + 1]?.id === "verify") runVerification();
  }, [validate, step.id, verifyDone, state, stepIdx, runVerification, setErrors, setStepIdx]);

  const prev = useCallback(() => {
    setErrors({});
    setStepIdx((i) => Math.max(0, i - 1));
  }, [setErrors, setStepIdx]);

  const uploadDoc = useCallback(
    async (key: string, file?: File) => {
      if (!state.registrationId) {
        setErrors({
          docs: "Your session has expired or is missing a Registration ID. Please go back to Step 1 and continue to restore your session.",
        });
        return;
      }
      if (!file) {
        setErrors({ docs: "Please select a valid documentww file (PDF, JPG, or PNG) to proceed with verification." });
        return;
      }
      setDocStatus(key, "uploading");

      const formData = new FormData();
      formData.append("registrationId", state.registrationId);
      formData.append(key, file, file.name);

      try {
        const token = window.localStorage.getItem("platino_merchant_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api/customer"}/v1/pharmacy/documents`, {
          method: "POST",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        setDocStatus(key, "verified");
      } catch {
        setDocStatus(key, "idle");
        setErrors((prev) => ({
          ...prev,
          docs: `Failed to verify document (${key}). Please check your connection and retry.`,
        }));
      }
    },
    [state.registrationId, setErrors, setDocStatus]
  );

  const canProceed = useMemo(() => {
    if (step.id === "verify") return verifyDone;
    if (step.id === "activate") return false;
    if (step.id === "delivery" && state.deliveryMode === "own") return false; // Must click "Pay & Continue" inside the component
    return true;
  }, [step, verifyDone, state.deliveryMode]);

  if (!isHydrated) return null;

  return (
    <section id="onboarding" className="py-2">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between border-b border-line/40 pb-4">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
              [ 03 ] Join as Pharmacy Partner
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              From application to live dispensary operations in minutes
            </h1>
            <p className="mt-1.5 text-xs text-ink-muted sm:text-sm">
              We preserve your verification checkpoints automatically — resume your application at any time without data loss.
            </p>
          </div>
          {savedAt && (
            <div className="relative shrink-0 pt-2 sm:pt-0">
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="rounded-md border border-line px-3.5 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-alert/40 hover:bg-alert/5 hover:text-alert"
                >
                  Start over
                </button>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg border border-alert/40 bg-paper p-3 shadow-lg sm:w-64 z-20">
                  <span className="text-xs font-semibold text-ink">Wipe current application?</span>
                  <p className="text-[11px] text-ink-subtle leading-normal">All entered documents and license numbers will be permanently reset.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { resetWizard(); setShowResetConfirm(false); }}
                      className="flex-1 rounded bg-alert px-2.5 py-1 text-[11px] font-semibold text-paper transition-opacity hover:opacity-90 shadow-sm"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 rounded border border-line px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:bg-hover"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="border-b border-line px-4 py-4 sm:px-6">
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
                Step {stepIdx + 1} of {STEPS.length} · {step.label}
              </div>
              <div className="shrink-0 font-mono text-[11px] text-ink-muted">{progress}%</div>
            </div>
            <ol className="mb-2 flex items-center gap-1.5 lg:hidden" aria-label="Onboarding steps">
              {STEPS.map((s, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <li key={s.id} className="flex-1">
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => i <= stepIdx && setStepIdx(i)}
                      disabled={i > stepIdx}
                      aria-current={active ? "step" : undefined}
                      aria-label={`Step ${i + 1}: ${s.label}`}
                      className={`h-2.5 w-full rounded-full transition-colors ${done ? "bg-signal" : active ? "bg-ink" : "bg-line"
                        } ${i > stepIdx ? "cursor-not-allowed" : "cursor-pointer"}`}
                    />
                  </li>
                );
              })}
            </ol>
            <div className="lg:hidden mt-2 flex items-center justify-between text-[11px] font-medium text-ink-muted border-t border-line/30 pt-2">
              <span>Current: <strong className="text-ink">{step.label}</strong></span>
              <span>Next: {STEPS[stepIdx + 1]?.label ?? "Review & Submit"}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line lg:block hidden">
              <motion.div
                className="h-full bg-ink"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-line bg-paper-alt/30 p-4 lg:block lg:border-r">
              <ol className="flex flex-col">
                {STEPS.map((s, i) => {
                  const done = i < stepIdx || (i === STEPS.length - 1 && stepIdx === STEPS.length - 1);
                  const active = i === stepIdx;
                  return (
                    <li key={s.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => i <= stepIdx && setStepIdx(i)}
                        disabled={i > stepIdx}
                        className={`relative flex w-full items-start gap-3 px-2 py-4 text-left transition-colors ${i > stepIdx ? "cursor-not-allowed opacity-50" : "hover:bg-paper/60"
                          }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="wizard-active"
                            className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-ink"
                          />
                        )}
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] ${done
                              ? "bg-signal text-on-signal"
                              : active
                                ? "border border-ink bg-paper text-ink"
                                : "border border-line bg-paper text-ink-subtle"
                            }`}
                        >
                          {done ? "✓" : s.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[13px] font-semibold ${active ? "text-ink" : "text-ink-muted"}`}>
                            {s.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-ink-subtle">{s.caption}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>

            <div className="min-h-[520px] p-4 sm:p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.id === "signup" && <SignupStep state={state} update={updateField} errors={errors} />}
                  {step.id === "business" && <BusinessStep state={state} update={updateField} errors={errors} />}
                  {step.id === "documents" && <DocsStep state={state} errors={errors} onUpload={uploadDoc} />}
                  {step.id === "store" && <StoreStep state={state} update={updateField} errors={errors} />}
                  {step.id === "delivery" && (
                    <DeliveryStep
                      state={state}
                      update={updateField}
                      errors={errors}
                      onPaymentSuccess={() => {
                        setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
                        runVerification();
                      }}
                    />
                  )}
                  {step.id === "verify" && <VerifyStep pct={verifyPct} done={verifyDone} />}
                  {step.id === "activate" && <ActivateStep state={state} onActivated={activateLiveStore} />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-[11px] text-ink-subtle sm:order-2 sm:mx-auto">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
                  </span>
                  <SavedIndicator savedAt={savedAt} />
                </div>
                <div className="flex items-center justify-between gap-3 sm:order-1 sm:contents">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={prev}
                    disabled={stepIdx === 0}
                    className="inline-flex min-h-11 items-center rounded-md px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 sm:order-1"
                  >
                    ← Back
                  </button>
                  {errors.submit && <div className="mb-4 text-[12px] text-alert">{errors.submit}</div>}
                  {step.id !== "activate" && (step.id !== "delivery" || state.deliveryMode !== "own") ? (
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={next}
                      disabled={
                        (!canProceed && step.id === "verify") ||
                        (Object.keys(errors).length > 0 && !errors.submit)
                      }
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50 sm:order-3"
                    >
                      {step.id === "verify" ? "Activate store" : "Continue"} →
                    </button>
                  ) : null}
                  {step.id === "activate" && (
                    <Link
                      href="/live"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-brand-ink sm:order-3"
                    >
                      Go to dashboard →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
