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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyOtpMutation } from "@/hooks/useAuthQueries";
import { useState, useEffect, Suspense } from 'react';

const verifySchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const verifyOtpMutation = useVerifyOtpMutation();

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const localEmail = typeof window !== "undefined" ? localStorage.getItem("verify_email") : null;
    setEmail(urlEmail || localEmail || "");
  }, [searchParams]);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  function onSubmit(data: VerifyFormValues) {
    if (!email) {
      toast.error("Unable to identify email account. Please return to sign up or login.");
      return;
    }
    verifyOtpMutation.mutate(
      { email, otp: data.otp },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Account verified successfully.");
          if (typeof window !== "undefined") {
            localStorage.removeItem("verify_email");
          }
          router.push("/");
        },
        onError: (error) => handleApiError(error, "Invalid OTP. Please try again."),
      },
    );
  }

  const isLoading = verifyOtpMutation.isPending;

  return (
    <AuthLayout
      title="Verify your account"
      description={
        email
          ? `We've sent a 6-digit verification code to ${email}.`
          : "We've sent a 6-digit verification code to your email inbox."
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel className="sr-only">One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} disabled={isLoading} {...field}>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-12 h-14 text-lg rounded-md border" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-lg rounded-md border" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-lg rounded-md border" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-lg rounded-md border" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-lg rounded-md border" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-lg rounded-md border" />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full h-11 text-base"
          >
            {isLoading ? "Verifying…" : "Verify Account"}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Didn't receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline hover:text-primary-glow transition-colors"
              onClick={() => toast.info("Resend feature coming soon.")}
            >
              Resend
            </button>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

