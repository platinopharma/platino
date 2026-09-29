'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Package, Clock, XCircle, CheckCircle, Truck, Loader2, Headphones } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatINR } from "@/lib/format";
import { EmptyState } from "@/components/ui-parts/empty-state";
import { apiGet } from "@/lib/axios";
import { cn } from "@/lib/utils";

type TabStatus = 'ACTIVE' | 'PAST' | 'CANCELLED';

type OrderItem = { medicineName: string; quantity: number };
type Order = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  orderStatus: string;
  createdAt: string;
  items?: OrderItem[];
  totalAmount?: number;
  total: number;
  deliveryFee: number;
};

export function OrdersPageClient() {
  const [activeTab, setActiveTab] = useState<TabStatus>('ACTIVE');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const res = await apiGet<{ data?: Order[] } | Order[]>('/api/customer/v1/orders');
      // The API returns the array directly if we used standard apiGet wrapping, 
      // but let's safely handle both raw arrays and `{data: []}` shapes just in case
      return Array.isArray(res) ? res : res.data || [];
    },
    refetchInterval: 15000 // Poll every 15s for live status updates
  });

  const filteredOrders = orders.filter((o: Order) => {
    if (activeTab === 'CANCELLED') return o.orderStatus === 'CANCELLED';
    if (activeTab === 'PAST') return o.orderStatus === 'DELIVERED' || o.orderStatus === 'REJECTED';
    return !['CANCELLED', 'DELIVERED', 'REJECTED'].includes(o.orderStatus);
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/`} className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Orders</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Your orders</h1>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-6 border-b border-border overflow-x-auto no-scrollbar">
        {(['ACTIVE', 'PAST', 'CANCELLED'] as TabStatus[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors",
              activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            )}
          >
            {tab === 'ACTIVE' ? 'Active Orders' : tab === 'PAST' ? 'Past Orders' : 'Cancelled'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Package}
            title={activeTab === 'ACTIVE' ? "No active orders" : activeTab === 'PAST' ? "No past orders" : "No cancelled orders"}
            hint={activeTab === 'ACTIVE' ? "Your ongoing orders will appear here." : "Your delivery history will appear here."}
            cta={{ to: "/pharmacies", label: "Browse pharmacies" }}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filteredOrders.map((o: Order) => {
            const isDelivered = o.orderStatus === 'DELIVERED';
            const isCancelled = o.orderStatus === 'CANCELLED';
            const StatusIcon = isDelivered ? CheckCircle : isCancelled ? XCircle : Truck;
            
            return (
              <Link
                key={o._id || o.id}
                href={`/orders/${o._id || o.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-5 hover:border-primary transition-colors"
              >
                <div className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
                  isDelivered ? "bg-green-500/10 text-green-600" :
                  isCancelled ? "bg-destructive/10 text-destructive" :
                  "bg-primary-soft text-primary"
                )}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Order {o.orderNumber || `#${o.id}`}</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                      isDelivered ? "bg-green-500/10 text-green-600" :
                      isCancelled ? "bg-destructive/10 text-destructive" :
                      "bg-primary/10 text-primary"
                    )}>
                      {o.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    · {o.items?.length || 0} items
                  </div>
                  {/* Thumbnail Previews */}
                  {o.items && o.items.length > 0 && (
                     <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground truncate">
                        {o.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                           <span key={idx} className="bg-muted px-2 py-1 rounded-md">{item.medicineName} (x{item.quantity})</span>
                        ))}
                        {o.items.length > 3 && <span>+{o.items.length - 3} more</span>}
                     </div>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-1.5">
                  <div className="font-display text-lg font-semibold">{formatINR(o.totalAmount || (o.total + o.deliveryFee))}</div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs text-primary font-medium">View details →</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.location.href = `/support/TKT-${Math.floor(10000 + Math.random() * 90000)}?orderId=${encodeURIComponent(o.orderNumber || o._id || o.id || "")}`;
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <Headphones className="h-3 w-3 text-primary" /> Need Help?
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
