"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Activity, Lock, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  useAdminLoginMutation,
  useAdminForgotPwdMutation,
  useAdminVerifyOtpMutation,
  useAdminResetPwdMutation,
} from "@/hooks/useAdminAuthQueries";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPwdSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const verifyOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

const resetPwdSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function LoginPage() {
  const router = useRouter();
  const { user, hydrated, login } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"login" | "forgot" | "verify" | "reset">("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const loginMutation = useAdminLoginMutation();
  const forgotPwdMutation = useAdminForgotPwdMutation();
  const verifyOtpMutation = useAdminVerifyOtpMutation();
  const resetPwdMutation = useAdminResetPwdMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hydrated && user) router.push("/dashboard");
  }, [hydrated, user, router]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotPwdForm = useForm<z.infer<typeof forgotPwdSchema>>({
    resolver: zodResolver(forgotPwdSchema),
    defaultValues: { email: "" },
  });

  const verifyOtpForm = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  const resetPwdForm = useForm<z.infer<typeof resetPwdSchema>>({
    resolver: zodResolver(resetPwdSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.accessToken && typeof window !== "undefined") {
          window.localStorage.setItem("platino_admin_token", res.accessToken);
        }
        toast.success("Authentication verified. Welcome back.");
        login(res.user);
        setTimeout(() => {
          router.push("/dashboard");
        }, 600);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || "Invalid credentials.");
      },
    });
  };

  const onForgotPwd = (data: z.infer<typeof forgotPwdSchema>) => {
    forgotPwdMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Recovery instructions sent if account exists.");
        setRecoveryEmail(data.email);
        setView("verify");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || "Failed to send reset instructions.");
      },
    });
  };

  const onVerifyOtp = (data: z.infer<typeof verifyOtpSchema>) => {
    verifyOtpMutation.mutate(
      { email: recoveryEmail, otp: data.otp },
      {
        onSuccess: () => {
          toast.success("OTP verified. Please reset your password.");
          setVerifiedOtp(data.otp);
          setView("reset");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Invalid OTP.");
        },
      }
    );
  };

  const onResetPwd = (data: z.infer<typeof resetPwdSchema>) => {
    resetPwdMutation.mutate(
      { email: recoveryEmail, otp: verifiedOtp, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success("Password reset successfully. You can now login.");
          setView("login");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to reset password.");
        },
      }
    );
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2 bg-background text-foreground transition-colors duration-300">
      {/* Theme toggle button - navbar style */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          )}
        </button>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0B4627] via-[#0F5132] to-[#0A381F] dark:from-[#04150D] dark:via-[#082216] dark:to-[#03100A] p-12 text-white lg:flex lg:flex-col lg:justify-between border-r border-border/10">
        {/* Ambient mesh lighting */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none transition-opacity"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.35) 0, transparent 50%), radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.2) 0, transparent 45%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <Logo variant="light" />
        </div>

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 border border-white/15 dark:border-emerald-500/20 mb-4 backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-emerald-400" /> Executive Operations Center
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white">
              The operations platform for modern pharmacy networks.
            </h1>
            <p className="mt-4 text-emerald-100/80 leading-relaxed text-sm">
              One secure console to manage pharmacy operations, verification, inventory, and real-time orders.
            </p>
          </motion.div>

          <div className="mt-8 space-y-3">
            {[
              {
                icon: ShieldCheck,
                title: "Role-based access",
                description: "Permissions are scoped to each admin team.",
              },
              {
                icon: Activity,
                title: "Centralized operations",
                description: "Manage pharmacy operations from one console.",
              },
              {
                icon: Lock,
                title: "Secure workflows",
                description: "Authentication and administrative actions are protected.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex items-start gap-3 rounded-xl bg-white/10 dark:bg-white/5 p-3.5 backdrop-blur-md border border-white/15 dark:border-white/10 transition-all hover:bg-white/15 dark:hover:bg-white/10"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold text-white">{c.title}</div>
                  <div className="text-xs text-emerald-100/75 dark:text-emerald-200/70 mt-0.5">{c.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-200/60 dark:text-emerald-300/50">
          © 2026 platino pharma · Secure Admin Console
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
            <Lock className="h-3 w-3" /> Admin-only access
          </div>

          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
                <p className="mt-1.5 text-sm text-muted-foreground mb-6">Sign in with your authorized admin credentials.</p>

                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@platinopharma.com" disabled={loginMutation.isPending} className="h-11 rounded-xl bg-background/50 focus:bg-background transition-all" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                          <button type="button" onClick={() => setView("forgot")} className="text-xs text-primary font-medium hover:underline">Forgot password?</button>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" disabled={loginMutation.isPending} className="h-11 rounded-xl bg-background/50 focus:bg-background transition-all" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={loginMutation.isPending} className="w-full mt-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                      {loginMutation.isPending ? "Authenticating…" : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {view === "forgot" && (
              <motion.div key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <button type="button" onClick={() => setView("login")} className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to login
                </button>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Reset Password</h2>
                <p className="mt-1.5 text-sm text-muted-foreground mb-6">Enter your admin email. Instructions will be sent to the securely configured recovery address.</p>

                <Form {...forgotPwdForm}>
                  <form onSubmit={forgotPwdForm.handleSubmit(onForgotPwd)} className="space-y-4">
                    <FormField control={forgotPwdForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email Address</FormLabel>
                        <FormControl><Input placeholder="admin@platinopharma.com" disabled={forgotPwdMutation.isPending} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={forgotPwdMutation.isPending} className="w-full mt-4 h-11">
                      {forgotPwdMutation.isPending ? "Sending…" : "Send Recovery Instructions"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {view === "verify" && (
              <motion.div key="verify" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Verify OTP</h2>
                <p className="mt-1.5 text-sm text-muted-foreground mb-6">Enter the 6-digit code sent to the recovery email address.</p>

                <Form {...verifyOtpForm}>
                  <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                    <FormField control={verifyOtpForm.control} name="otp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>6-Digit OTP</FormLabel>
                        <FormControl><Input placeholder="123456" maxLength={6} disabled={verifyOtpMutation.isPending} className="font-mono tracking-widest text-center" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={verifyOtpMutation.isPending} className="w-full mt-4 h-11">
                      {verifyOtpMutation.isPending ? "Verifying…" : "Verify Code"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {view === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-display text-2xl font-semibold tracking-tight">New Password</h2>
                <p className="mt-1.5 text-sm text-muted-foreground mb-6">Create a strong new password for your admin account.</p>

                <Form {...resetPwdForm}>
                  <form onSubmit={resetPwdForm.handleSubmit(onResetPwd)} className="space-y-4">
                    <FormField control={resetPwdForm.control} name="newPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" disabled={resetPwdMutation.isPending} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={resetPwdForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" disabled={resetPwdMutation.isPending} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={resetPwdMutation.isPending} className="w-full mt-4 h-11">
                      {resetPwdMutation.isPending ? "Resetting…" : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Role-based access</span> — permissions are scoped to your admin team.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
