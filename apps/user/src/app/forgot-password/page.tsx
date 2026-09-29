'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import { useForgetPasswordMutation } from "@/hooks/useAuthQueries";



const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgetPasswordMutation = useForgetPasswordMutation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    forgetPasswordMutation.mutate(
      { email: data.email },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Reset code sent.");
          if (typeof window !== "undefined") {
            localStorage.setItem("reset_email", data.email);
          }
          router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
        },
        onError: (error) => handleApiError(error, "Failed to send reset code. Please try again."),
      },
    );
  }

  const isLoading = forgetPasswordMutation.isPending;

  return (
    <AuthLayout
      title="Reset Password"
      description="Enter your email and we'll send you a code to reset your password."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
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
            {isLoading ? "Sending…" : "Send Reset Code"}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline hover:text-primary-glow transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}

