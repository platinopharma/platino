import type { Metadata } from "next";
import { OrdersPageClient } from "@/features/orders/orders-page-client";

export const metadata: Metadata = {
  title: "Order Tracking & History | Platino Pharma",
  description: "Track live delivery status, view prescription attachments, and manage your pharmacy orders.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/orders" },
};

export const dynamic = 'force-dynamic'; // Ensure order statuses reflect live database state

export default function OrdersRoute() {
  return <OrdersPageClient />;
}
