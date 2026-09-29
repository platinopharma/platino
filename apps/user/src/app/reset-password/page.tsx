'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { handleApiError } from "@/lib/error";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useResetPasswordMutation } from "@/hooks/useAuthQueries";



const resetPasswordSchema = z
  .object({
    otp: z.string().min(6, { message: "OTP must be 6 characters." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

import { useState, useEffect, Suspense } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const resetPasswordMutation = useResetPasswordMutation();

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const localEmail = typeof window !== "undefined" ? localStorage.getItem("reset_email") : null;
    setEmail(urlEmail || localEmail || "");
  }, [searchParams]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ResetPasswordFormValues) {
    if (!email) {
      toast.error("Unable to identify email account. Please restart the forgot password process.");
      return;
    }
    resetPasswordMutation.mutate(
      {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Password reset successfully.");
          if (typeof window !== "undefined") {
            localStorage.removeItem("reset_email");
          }
          router.push("/login");
        },
        onError: (error) => handleApiError(error, "Failed to reset password. Please try again."),
      },
    );
  }

  const isLoading = resetPasswordMutation.isPending;

  return (
    <AuthLayout
      title="Create new password"
      description={
        email
          ? `Enter the OTP sent to ${email} along with your new password.`
          : "Enter the OTP sent to your email along with your new password."
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} disabled={isLoading} {...field}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="w-10 h-12 text-base rounded-md border" />
                        <InputOTPSlot index={1} className="w-10 h-12 text-base rounded-md border" />
                        <InputOTPSlot index={2} className="w-10 h-12 text-base rounded-md border" />
                        <InputOTPSlot index={3} className="w-10 h-12 text-base rounded-md border" />
                        <InputOTPSlot index={4} className="w-10 h-12 text-base rounded-md border" />
                        <InputOTPSlot index={5} className="w-10 h-12 text-base rounded-md border" />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full h-11 text-base"
          >
            {isLoading ? "Resetting…" : "Reset Password"}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline hover:text-primary-glow transition-colors"
            >
              Back to Sign in
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

