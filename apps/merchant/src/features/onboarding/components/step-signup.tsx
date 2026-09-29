"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FormState } from "@/features/onboarding/types";
import { Field, inputCls } from "./ui-helpers";
import { apiPost } from "@/lib/axios";
import { useCountdown } from "@/hooks/useCountdown";
import { isValidEmail, isValidPhone } from "@/lib/validators";
import { PasswordInput } from "@/components/ui/password-input";
import { CheckCircle2, Circle } from "lucide-react";

export function SignupStep({
  state,
  update,
  errors,
}: {
  state: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Record<string, string>;
}) {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [netError, setNetError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  
  // Clean countdown timer hook for OTP cooldowns
  const { timeLeft: cooldown, start: startCooldown, reset: resetCooldown } = useCountdown(0);

  const emailOk = isValidEmail(state.email);
  const phoneOk = isValidPhone(state.phone) || /^\+?\d{10,13}$/.test(state.phone.replace(/\s/g, ""));
  const passwordOk = state.password?.length >= 8;

  const sendOtp = async () => {
    setNetError(null);
    setDevCode(null);
    const cleanEmail = state.email.trim();
    const cleanPhone = state.phone.replace(/[\s\-\(\)]/g, "");
    if (!isValidEmail(cleanEmail) || !isValidPhone(cleanPhone) || !passwordOk) {
      setNetError("Enter a valid email, 10-digit phone number, and a password (min 8 chars) first.");
      return;
    }
    setSending(true);
    try {
      const regRes = await apiPost<{ registrationId: string }>("/v1/auth/register", {
        email: cleanEmail,
        phone: cleanPhone,
        password: state.password,
      });
      const regId = regRes.registrationId;
      update("registrationId", regId);

      const out = await apiPost<{ sent: boolean; devCode?: string; cooldownSeconds?: number; emailError?: string }>(
        "/v1/auth/email/send-otp",
        { registrationId: regId },
      );
      update("otpSent", true);
      update("otp", "");
      update("signupVerified", false);
      if (out.devCode) setDevCode(out.devCode);
      
      resetCooldown(out.cooldownSeconds ?? 45);
      startCooldown();

      if (!out.sent && out.emailError) {
        setNetError(`Email not delivered: ${out.emailError}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as Error)?.message || "Could not send OTP. Try again.";
      setNetError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setNetError(null);
    if (state.otp.length !== 6 || !state.registrationId) return;
    setVerifying(true);
    try {
      await apiPost("/v1/auth/email/verify-otp", {
        registrationId: state.registrationId,
        otp: state.otp.trim(),
      });
      update("signupVerified", true);
    } catch (err: unknown) {
      update("signupVerified", false);
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as Error)?.message || "Verification failed.";
      setNetError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h3 className="font-display text-2xl text-ink">Create your pharmacy account</h3>
      <p className="mt-1 text-sm text-ink-muted">
        We'll email you a one-time code to verify your account. Takes about 2 minutes.
      </p>
      <div className="mt-6 space-y-4">
        <Field label="Business email" error={errors.email} hint="We'll send your login and receipts here">
          <input
            suppressHydrationWarning
            type="email"
            value={state.email}
            onChange={(e) => {
              update("email", e.target.value);
              if (state.otpSent) {
                update("otpSent", false);
                update("otp", "");
                update("signupVerified", false);
              }
            }}
            placeholder="you@pharmacy.com"
            autoComplete="off"
            className={inputCls(errors.email)}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={state.password || ""}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            className={inputCls(errors.password)}
          />
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200">
            {passwordOk ? (
              <CheckCircle2 className="size-3.5 text-signal" />
            ) : (
              <Circle className="size-3.5 text-ink-subtle" />
            )}
            <span className={passwordOk ? "text-signal line-through opacity-80" : "text-ink-subtle"}>
              At least 8 characters
            </span>
          </div>
        </Field>
        <Field label="Phone number" error={errors.phone} hint="Use your business owner's number">
          <div className="flex gap-2">
            <input
              suppressHydrationWarning
              value={state.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98200 12345"
              inputMode="tel"
              autoComplete="tel"
              className={inputCls(errors.phone)}
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={sendOtp}
              disabled={sending || cooldown > 0 || !emailOk || !phoneOk || !passwordOk}
              className="inline-flex min-h-11 shrink-0 items-center rounded-md border border-line px-4 text-[12px] font-medium text-ink hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "Sending…" : cooldown > 0 ? `Resend ${cooldown}s` : state.otpSent ? "Resend" : "Send OTP"}
            </button>
          </div>
        </Field>
        <AnimatePresence>
          {state.otpSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Field
                label="6-digit code"
                error={errors.otp}
                hint={
                  state.signupVerified
                    ? "Email verified ✓"
                    : `Sent to ${state.email}. Check your inbox (and spam).`
                }
              >
                <div className="flex gap-2">
                  <input
                    suppressHydrationWarning
                    value={state.otp}
                    onChange={(e) => {
                      update("otp", e.target.value.replace(/\D/g, "").slice(0, 6));
                      if (state.signupVerified) update("signupVerified", false);
                    }}
                    placeholder="••••••"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={state.signupVerified}
                    className={`${inputCls(errors.otp)} tracking-[0.5em] font-mono`}
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={verifyOtp}
                    disabled={verifying || state.otp.length !== 6 || state.signupVerified}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-ink px-4 text-[12px] font-medium text-paper hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {state.signupVerified ? "Verified" : verifying ? "Verifying…" : "Verify"}
                  </button>
                </div>
              </Field>
              {devCode && (
                <div className="mt-2 rounded-md border border-warn/30 bg-warn/10 p-2 font-mono text-[11px] text-ink">
                  Dev mode (Resend not configured on backend): use code{" "}
                  <span className="font-semibold tracking-widest">{devCode}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {netError && (
          <div className="rounded-md border border-alert/30 bg-alert/10 p-2 text-[12px] text-alert">
            {netError}
          </div>
        )}
        <div className="rounded-md border border-line bg-paper-alt/40 p-3 text-[11px] text-ink-muted">
          By continuing you agree to the platinopharma Partner Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
