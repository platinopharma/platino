import type { Metadata } from "next";
import { CheckoutPage } from "@/features/checkout/checkout-page";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Secure Checkout | Platino Pharma",
  description: "Complete your medicine prescription upload and review pay-on-delivery instructions.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export const dynamic = 'force-dynamic'; // Never cache transactional checkouts on edge servers

export default function CheckoutRoute() {
  return (
    <AuthGuard>
      <CheckoutPage />
    </AuthGuard>
  );
}
