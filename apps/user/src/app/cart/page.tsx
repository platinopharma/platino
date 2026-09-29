import type { Metadata } from "next";
import { CartPageClient } from "@/features/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Your Cart | Platino Pharma",
  description: "Review your medicines and healthcare products before proceeding to pay-on-delivery checkout.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default function CartRoute() {
  return <CartPageClient />;
}
