"use client";
import Link from 'next/link';
import { useMemo } from 'react';

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShoppingBag,
  Package,
  Truck,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  Plus,
} from "lucide-react";
import { useRouter } from 'next/navigation';

import { Sparkline, BarChart } from "@/components/site/sparkline";
import { StatCard, Card, Pill, Btn, PageHeader, toast } from "@/features/live/ui";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  REVENUE_30D,
  ORDERS_30D,
  HOURLY_BARS,
  money,
} from "@/features/live/data";
import { usePharmacyDashboard, usePharmacyRecentOrders, usePharmacyOrders, usePharmacyMedicines } from "@/hooks/usePharmacyQueries";

export default function DashboardPage() {
  const router = useRouter();

  const { data: dashboardData, isLoading: isLoadingDash } = usePharmacyDashboard();
  const { data: recentOrders = [], isLoading: isLoadingOrders } = usePharmacyRecentOrders();
  
  // Real-time backend queries
  const { data: allOrdersData } = usePharmacyOrders(100);
  const { data: allMedicinesData } = usePharmacyMedicines(1, 100);
  
  const allOrders = allOrdersData?.orders || [];
  const inventory = (allMedicinesData?.medicines as any[]) || [];

  const isLoading = isLoadingDash || isLoadingOrders;

  const lowStock = useMemo(
    () => inventory.filter((m) => (m.stock as number) > 0 && (m.stock as number) < ((m.minStock as number) || 10)).length,
    [inventory],
  );
  
  // Assuming real backend Medicine model has expiryDate as Date object or ISO string
  const expiring = useMemo(
    () => inventory.filter((m) => {
      if (!m.expiryDate) return false;
      const d = new Date(m.expiryDate as string);
      const diffTime = Math.abs(d.getTime() - new Date().getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 60;
    }).length,
    [inventory],
  );

  const bestSellers = useMemo(() => {
    return Array.from(
      allOrders.flatMap((o) => (o.items as any[]) || []).reduce((m: Map<string, { qty: number; revenue: number; }>, it: any) => {
        if (!it) return m;
        const name = it.medicineName || "Unknown Item";
        const cur = m.get(name) ?? { qty: 0, revenue: 0 };
        m.set(name, { qty: cur.qty + (it.quantity || 1), revenue: cur.revenue + ((it.quantity || 1) * (it.unitPrice || 0)) });
        return m;
      }, new Map<string, { qty: number; revenue: number }>()),
    )
      .map((entry: any) => ({ name: entry[0] as string, qty: entry[1].qty as number, revenue: entry[1].revenue as number }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [allOrders]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Today at a glance"
        description="Live operations for your store. Data refreshes every few seconds."
        actions={
          <>
            <Btn variant="outline" size="sm" onClick={() => toast("Showing last 24h")}>
              <Clock className="size-3.5" /> Last 24h
            </Btn>
            <Btn size="sm" onClick={() => router.push("/live/orders")}>
              <Plus className="size-3.5" /> New order
            </Btn>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Today's orders" value={isLoading ? "..." : (dashboardData?.todayOrders?.toString() || "0")} delta="updated just now" tone="signal" icon={<ShoppingBag className="size-4" />} />
        <StatCard label="Revenue today" value={isLoading ? "..." : money((dashboardData?.todayRevenue as number) || 0)} delta="updated just now" tone="signal" icon={<IndianRupee className="size-4" />} />
        <StatCard label="Pending" value={isLoading ? "..." : (dashboardData?.pendingOrders?.toString() || "0")} delta="needs review" tone="warn" icon={<Clock className="size-4" />} />
        <StatCard label="Out for delivery" value={allOrders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length.toString()} delta="avg ETA 18 min" tone="brand" icon={<Truck className="size-4" />} />
        <StatCard label="Delivered" value={isLoading ? "..." : (dashboardData?.completedOrders?.toString() || "0")} delta="98.4% fill rate" tone="signal" icon={<CheckCircle2 className="size-4" />} />
        <StatCard label="Cancelled" value={isLoading ? "..." : (dashboardData?.cancelledOrders?.toString() || "0")} delta="1.2% of total" tone="muted" icon={<XCircle className="size-4" />} />
        <StatCard label="Low stock" value={lowStock.toString().padStart(2, "0")} delta="reorder now" tone="alert" icon={<AlertTriangle className="size-4" />} />
        <StatCard label="Expiring ≤ 60d" value={expiring.toString().padStart(2, "0")} delta="review batches" tone="warn" icon={<Package className="size-4" />} />
      </div>

      {/* Revenue + low stock */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Revenue · last 30 days"
          action={
            <div className="flex gap-1 font-mono text-[10px] text-ink-subtle">
              <span className="rounded bg-ink/5 px-1.5 py-0.5">7D</span>
              <span className="rounded bg-ink px-1.5 py-0.5 text-paper">30D</span>
              <span className="rounded bg-ink/5 px-1.5 py-0.5">QTR</span>
            </div>
          }
        >
          <div className="flex items-baseline gap-3">
            <div className="font-display text-3xl text-ink">{isLoading ? "..." : money((dashboardData?.monthlyRevenue as number) || 0)}</div>
            <span className="font-mono text-[11px] text-signal">+18.2%</span>
          </div>
          <Sparkline
            data={REVENUE_30D}
            height={140}
            className="mt-4 w-full text-brand"
            stroke="var(--brand)"
            fill="color-mix(in oklch, var(--brand) 14%, transparent)"
          />
        </Card>

        <Card title="Low stock" action={<Pill tone="alert">action needed</Pill>}>
          <ul className="space-y-3">
            {inventory.filter((m: Record<string, unknown>) => (m.stock as number) > 0 && (m.stock as number) < ((m.minStock as number) || 10)).slice(0, 5).map((m: Record<string, unknown>) => {
              const pct = Math.round(((m.stock as number) / ((m.minStock as number) || 10)) * 100);
              return (
                <li key={m.id as string}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="truncate pr-2 font-medium text-ink">{m.name as string}</span>
                    <span className="shrink-0 font-mono text-ink-subtle">{m.stock as number}/{m.minStock as number || 10}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-alert/15">
                    <motion.div
                      className="h-full bg-alert"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/live/inventory" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-ink hover:text-brand">
            Manage inventory <ArrowUpRight className="size-3.5" />
          </Link>
        </Card>
      </div>

      {/* Recent orders + activity + best sellers */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Live order stream"
          action={
            <Link href="/live/orders" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted hover:text-ink">
              View all <ArrowUpRight className="size-3" />
            </Link>
          }
          padded={false}
        >
          <div className="divide-y divide-line">
            {isLoading && <div className="px-4 py-3 text-[12px] text-ink-subtle">Loading recent orders...</div>}
            {!isLoading && recentOrders.length === 0 && <div className="px-4 py-3 text-[12px] text-ink-subtle">No recent orders found.</div>}
            {recentOrders.map((o: any, i: number) => (
              <motion.div
                key={o._id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-[12px]"
              >
                <div className="col-span-3 font-mono text-ink-subtle">{o.orderNumber}</div>
                <div className="col-span-5 truncate font-medium text-ink">
                  {o.items?.[0]?.medicineName || "Unknown Item"}
                  {o.items?.length > 1 && <span className="text-ink-subtle"> +{o.items.length - 1}</span>}
                </div>
                <div className="col-span-2 font-mono text-ink-muted">{money(o.totalAmount)}</div>
                <div className="col-span-2 text-right">
                  <Pill tone={ORDER_STATUS_TONE[(o.orderStatus?.toLowerCase() === 'placed' ? 'pending' : o.orderStatus?.toLowerCase()) as keyof typeof ORDER_STATUS_TONE] || "muted"}>{ORDER_STATUS_LABEL[(o.orderStatus?.toLowerCase() === 'placed' ? 'pending' : o.orderStatus?.toLowerCase()) as keyof typeof ORDER_STATUS_LABEL] || o.orderStatus}</Pill>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card title="Activity feed" action={<Bell className="size-3.5 text-ink-subtle" />}>
          <ol className="space-y-3.5">
            {(([] as unknown[]) as {id: string; title: string; body: string; time: string}[]).slice(0, 6).map((n) => (
              <li key={n.id} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-medium text-ink">{n.title}</div>
                  <div className="truncate text-[11px] text-ink-muted">{n.body}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-subtle">{n.time}</div>
                </div>
              </li>
            ))}
            <div className="px-4 py-3 text-[12px] text-ink-subtle text-center">No recent activity.</div>
          </ol>
        </Card>
      </div>

      {/* Peak hours + best sellers */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Peak ordering hours">
          <BarChart data={HOURLY_BARS} height={140} />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-subtle">
            <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
          </div>
        </Card>
        <Card title="Best selling medicines">
          <ul className="space-y-3">
            {bestSellers.map((b, i) => (
              <li key={b.name} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded bg-brand/10 font-mono text-[10px] text-brand">{i + 1}</span>
                  <span className="truncate text-[12px] font-medium text-ink">{b.name}</span>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-ink-muted">{b.qty} · {money(b.revenue)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Order trends */}
      <Card title="Order trend · last 30 days">
        <div className="flex items-baseline gap-3">
          <div className="font-display text-2xl text-ink">{ORDERS_30D.reduce((a, b) => a + b, 0)} orders</div>
          <span className="font-mono text-[11px] text-signal">+22.4%</span>
        </div>
        <Sparkline
          data={ORDERS_30D}
          height={90}
          className="mt-3 w-full text-signal"
          stroke="var(--signal)"
          fill="color-mix(in oklch, var(--signal) 12%, transparent)"
        />
      </Card>
    </div>
  );
}
