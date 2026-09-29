"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useLoginMutation } from "@/hooks/useAuthQueries";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

const resumeSchema = z.object({
  regId: z.string().min(1, "Registration ID or email is required"),
});

export function LoginClient() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "resume">("signin");

  const loginMutation = useLoginMutation();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const resumeForm = useForm<z.infer<typeof resumeSchema>>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      regId: "",
    },
  });

  const onSignInSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (res) => {
          if (res.accessToken && typeof window !== "undefined") {
            window.localStorage.setItem("platino_merchant_token", res.accessToken);
          }
          toast.success("Authentication verified. Loading your operational dashboard...");
          setTimeout(() => {
            router.push("/live");
          }, 600);
        },
        onError: (error: unknown) => {
          const e = error as { response?: { data?: { error?: string } }; message?: string };
          const errMsg = e?.response?.data?.error || e?.message || "Invalid credentials. Please verify your email and password.";
          toast.error(errMsg);
        },
      }
    );
  };

  const onResumeSubmit = (data: z.infer<typeof resumeSchema>) => {
    const cleaned = data.regId.trim().toUpperCase();
    useOnboardingStore.getState().updateField("registrationId", cleaned);
    toast.success("Application recovered. Restoring your onboarding checkpoints...");
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col justify-between px-6 py-8 lg:flex-row lg:items-stretch lg:py-12">
      {/* Left Column: Authentic B2B SaaS Login Form */}
      <div className="flex flex-1 flex-col justify-center max-w-lg lg:pr-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-12 w-auto items-center">
                <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
              </span>
              <span className="font-mono text-[14px] font-semibold tracking-[0.14em] text-ink">
                PLATINO<span className="text-brand">PHARMA</span>
              </span>
            </a>
            <span className="ml-3 rounded-full border border-line bg-paper-alt px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-muted">
              Partner Portal
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-6 flex rounded-md border border-line bg-paper-alt/40 p-1">
          <button
            type="button"
            onClick={() => { setMode("signin"); }}
            className={`flex-1 rounded py-2 text-[13px] font-medium transition-colors ${mode === "signin" ? "bg-paper text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
          >
            Partner Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("resume"); }}
            className={`flex-1 rounded py-2 text-[13px] font-medium transition-colors ${mode === "resume" ? "bg-paper text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
          >
            Resume Onboarding
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Welcome back to daily operations
                </h1>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Sign in to manage inventory, dispense verified e-prescriptions, and review real-time orders.
                </p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onSignInSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
                          Registered Business Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="manager@apollo-pharmacy.in"
                            type="email"
                            autoComplete="username"
                            disabled={loginMutation.isPending}
                            className="bg-paper-alt/40 focus-visible:ring-brand"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
                            Password
                          </FormLabel>
                          <a href="/onboarding" className="font-mono text-[11px] font-medium text-brand hover:underline">
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••••••"
                            autoComplete="current-password"
                            disabled={loginMutation.isPending}
                            className="bg-paper-alt/40 focus-visible:ring-brand"
                            {...field}
                          />
                        </FormControl>
                        <div className="h-6" /> {/* Spacer for caps lock warning */}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={loginMutation.isPending}
                            className="size-4 rounded border-line text-brand focus:ring-brand"
                          />
                        </FormControl>
                        <FormLabel className="text-[13px] text-ink-muted cursor-pointer font-normal">
                          Keep session active on this dispensary device
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full min-h-12 bg-ink text-paper hover:bg-brand-ink text-[14px] font-semibold rounded-md shadow-sm mt-2"
                  >
                    {loginMutation.isPending ? "Verifying Credentials…" : "Sign In to Live Portal"}
                  </Button>
                </form>
              </Form>

              <div className="border-t border-line pt-5 mt-5 text-center text-xs text-ink-muted">
                New pharmacy looking to join Platino?{" "}
                <a href="/onboarding?new=true" className="font-semibold text-ink hover:text-brand underline">
                  Start your partner onboarding
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Pick up where you left off
                </h1>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Entered your business details or OTP earlier? Restore your incomplete verification checkpoints instantly.
                </p>
              </div>

              <Form {...resumeForm}>
                <form onSubmit={resumeForm.handleSubmit(onResumeSubmit)} className="space-y-4">
                  <FormField
                    control={resumeForm.control}
                    name="regId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
                          Registration Identifier or Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="REG-92841 or owner@pharmacy.in"
                            className="bg-paper-alt/40 uppercase placeholder:normal-case focus-visible:ring-brand font-mono"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-[11px] text-ink-subtle mt-1.5">
                          Check the confirmation SMS or subject line sent during your initial registration attempt.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full min-h-12 bg-ink text-paper hover:bg-brand-ink text-[14px] font-semibold rounded-md shadow-sm mt-2"
                  >
                    Resume Onboarding Application
                  </Button>
                </form>
              </Form>

              <div className="border-t border-line pt-5 mt-5 text-center text-xs text-ink-muted">
                Need operational assistance with verification?{" "}
                <a href="mailto:support@platinopharma.com" className="font-semibold text-ink hover:text-brand underline">
                  Contact Partner Support
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-8 text-[11px] text-ink-subtle">
          © {new Date().getFullYear()} Platino Pharmacy Platform. All medical data is encrypted to HIPAA & DISHA clinical compliance standards.
        </div>
      </div>

      {/* Right Column: Deep Forest Enterprise Showcase Panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-ink p-10 text-paper shadow-2xl lg:flex border border-line/20">
        {/* Subtle emerald background decorative gradients */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-signal/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 font-mono text-[11px] font-medium text-signal backdrop-blur-sm">
            <span className="size-2 rounded-full bg-signal animate-pulse" />
            LIVE DISPENSARY NETWORK
          </span>
          <span className="font-mono text-xs text-paper-alt/60">v1.4 Enterprise</span>
        </div>

        <div className="relative z-10 my-auto space-y-6">
          <blockquote className="space-y-4">
            <p className="font-display text-2xl font-medium leading-relaxed text-paper sm:text-3xl">
              “Platino Pharma revolutionized our prescription fulfillment. Automated batch tracking and 24-hour edge verification eliminated stock reconciliation delays across our 6 retail outlets.”
            </p>
            <footer className="flex items-center gap-3 pt-2">
              <div className="size-11 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center font-mono font-bold text-brand">
                RS
              </div>
              <div>
                <div className="font-sans text-sm font-semibold text-paper">Dr. Rajesh Sharma, PharmD</div>
                <div className="text-xs text-paper-alt/70">Managing Director · Apex MediSellers & Clinical Drugstore</div>
              </div>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 border-t border-line/20 pt-8 grid grid-cols-3 gap-6 font-mono text-xs">
          <div>
            <div className="text-2xl font-bold text-brand font-display">10,000+</div>
            <div className="text-paper-alt/70 mt-0.5">Active India Pharmacies</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-signal font-display">99.99%</div>
            <div className="text-paper-alt/70 mt-0.5">Guaranteed SLA Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-paper font-display">&lt; 150ms</div>
            <div className="text-paper-alt/70 mt-0.5">Rx Verification Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
