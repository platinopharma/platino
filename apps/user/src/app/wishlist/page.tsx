import type { Metadata } from "next";
import { WishlistPageClient } from "@/features/wishlist/wishlist-page-client";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Your Saved Wishlist | Platino Pharma",
  description: "View saved medicines, healthcare supplies, and local partner pharmacies for quick pay-on-delivery ordering.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/wishlist" },
};

export default function WishlistRoute() {
  return <WishlistPageClient />;
}
