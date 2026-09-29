import type { Metadata } from "next";
import { OrderTrackingClient } from "@/features/orders/order-tracking-client";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id} Tracking | Platino Pharma`,
    description: `Track live order status and pay-on-delivery inspection details for Order #${id}.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/orders/${id}` },
  };
}

export default async function OrderTrackingRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderTrackingClient orderId={id} />
    </HydrationBoundary>
  );
}
