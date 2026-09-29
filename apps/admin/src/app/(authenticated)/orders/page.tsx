"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { motion } from "framer-motion";
import { Search, ArrowUpRight, ShoppingBag, SearchX } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import { useAdminOrders } from "@/hooks/useAdminDataQueries";
import { inr, fromNow } from "@/lib/format";



function Orders() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  
  const { data, isLoading: loading } = useAdminOrders();
  const ALL = data?.orders || [];
  
  const router = useRouter();
  const items = ALL
    .filter((o) => (status === "all" ? true : o.status === status))
    .filter((o) => `${o.id} ${o.customer} ${o.pharmacy} ${o.city}`.toLowerCase().includes(q.toLowerCase()));

  const isEmpty = !loading && items.length === 0;

  return (
    <>
      <PageHeader title="Order Management" subtitle="Track and manage orders across the network." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, pharmacy…" aria-label="Search orders" className="pl-9" />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : isEmpty ? (
          <EmptyState
            icon={q || status !== "all" ? SearchX : ShoppingBag}
            title={q || status !== "all" ? "No matching orders" : "No orders yet"}
            description={
              q || status !== "all"
                ? "Try adjusting your search or status filter to find what you're looking for."
                : "Orders placed across your network will appear here."
            }
            action={q || status !== "all" ? { label: "Clear filters", onClick: () => { setQ(""); setStatus("all"); } } : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((o, i) => (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.2) }} className="group border-b">
                      <TableCell>
                        <Link href={`/orders/${o.id }`} className="font-medium text-primary hover:underline">{o.id}</Link>
                      </TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{o.pharmacy}</TableCell>
                      <TableCell>{o.items}</TableCell>
                      <TableCell className="font-medium">{inr(o.total)}</TableCell>
                      <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fromNow(o.placedAt)}</TableCell>
                      <TableCell>
                        <Link href={`/orders/${o.id }`} aria-label={`View order ${o.id}`}>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {items.map((o, i) => (
                <motion.li key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.25) }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/orders/${o.id}`)}
                    className="flex min-h-16 w-full items-center gap-3 p-4 text-left transition-colors active:bg-muted/60"
                    aria-label={`View order ${o.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{o.id}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="mt-0.5 truncate text-sm">{o.customer}</p>
                      <p className="truncate text-xs text-muted-foreground">{o.pharmacy} · {fromNow(o.placedAt)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold">{inr(o.total)}</div>
                      <div className="mt-1"><StatusBadge status={o.paymentStatus} /></div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}

export default Orders;
