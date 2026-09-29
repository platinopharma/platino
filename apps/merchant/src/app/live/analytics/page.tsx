"use client";
import { useMemo } from "react";
import { Sparkline, BarChart } from "@/components/site/sparkline";
import { Card, PageHeader, StatCard } from "@/features/live/ui";
import { HOURLY_BARS, REVENUE_30D, ORDERS_30D, money } from "@/features/live/data";
import { usePharmacyOrders } from "@/hooks/usePharmacyQueries";
import { TableLoadingSkeleton } from "@/components/ui/state-displays";

export default function AnalyticsPage() {
  const { data: apiData, isLoading } = usePharmacyOrders(100);
  
  const orders = useMemo(() => apiData?.orders ?? [], [apiData]);

  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.orderStatus === "DELIVERED").length;
  const cancelled = orders.filter((o) => o.orderStatus === "CANCELLED" || o.orderStatus === "REJECTED").length;
  const revenue = orders.filter((o) => o.orderStatus !== "CANCELLED" && o.orderStatus !== "REJECTED").reduce((a: number, o) => a + ((o.totalAmount as number) || 0), 0);
  const aov = Math.round(revenue / Math.max(1, totalOrders - cancelled));
  const successRate = totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : "0.0";

  const bestSellers = useMemo(() => {
    return Array.from(
      orders.flatMap((o) => (o.items as any[]) || []).reduce((m: Map<string, { qty: number; revenue: number }>, it: any) => {
        if (!it) return m;
        const name = it.medicineName || "Unknown Item";
        const cur = m.get(name) ?? { qty: 0, revenue: 0 };
        m.set(name, { qty: cur.qty + (it.quantity || 1), revenue: cur.revenue + ((it.quantity || 1) * (it.unitPrice || 0)) });
        return m;
      }, new Map<string, { qty: number; revenue: number }>()),
    ).map((entry: any) => ({ name: entry[0] as string, ...(entry[1] as { qty: number; revenue: number }) })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [orders]);

  // Fallback to mock trend data since backend doesn't provide time-series
  const dailyAvg = Math.round(REVENUE_30D.slice(-7).reduce((a, b) => a + b, 0) / 7) * 1000;
  const weekly = REVENUE_30D.slice(-7).reduce((a, b) => a + b, 0) * 1000;
  const monthly = revenue; // Use live revenue instead of mock monthly sum

  if (isLoading) return <div className="p-8"><TableLoadingSkeleton rows={5} colSpan={1} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Insights" title="Analytics" description="Revenue, order health, top movers and customer patterns for your pharmacy." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Daily revenue" value={money(dailyAvg)} delta="7-day avg" tone="signal" />
        <StatCard label="Weekly revenue" value={money(weekly)} delta="+18.2%" tone="signal" />
        <StatCard label="Monthly revenue" value={money(monthly)} delta="+22.4%" tone="signal" />
        <StatCard label="Avg. order value" value={money(aov)} delta="+4.6% vs. last mo" tone="brand" />
        <StatCard label="Order success rate" value={`${successRate}%`} delta="target 95%" tone="signal" />
        <StatCard label="Cancelled orders" value={cancelled.toString().padStart(2, "0")} delta="1.4% of total" tone="muted" />
        <StatCard label="Customer growth" value="+42" delta="new this month" tone="brand" />
        <StatCard label="Repeat rate" value="61%" delta="30-day cohort" tone="signal" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Revenue · 30 days">
          <div className="flex items-baseline gap-3">
            <div className="font-display text-3xl text-ink">{money(monthly)}</div>
            <span className="font-mono text-[11px] text-signal">+22.4%</span>
          </div>
          <Sparkline data={REVENUE_30D} height={160} className="mt-4 w-full text-brand" stroke="var(--brand)" fill="color-mix(in oklch, var(--brand) 14%, transparent)" />
        </Card>
        <Card title="Profit trend">
          <div className="font-display text-2xl text-ink">{money(Math.round(monthly * 0.22))}</div>
          <div className="mt-1 font-mono text-[11px] text-signal">+14.8% margin</div>
          <Sparkline data={REVENUE_30D.map((v) => Math.round(v * 0.22))} height={120} className="mt-4 w-full text-signal" stroke="var(--signal)" fill="color-mix(in oklch, var(--signal) 12%, transparent)" />
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Top selling medicines">
          <ul className="divide-y divide-line">
            {bestSellers.map((b, i) => (
              <li key={b.name} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded bg-brand/10 font-mono text-[10px] text-brand">{i + 1}</span>
                  <span className="truncate font-medium text-ink">{b.name}</span>
                </div>
                <div className="flex shrink-0 items-baseline gap-4">
                  <span className="font-mono text-[11px] text-ink-subtle">{b.qty} sold</span>
                  <span className="w-24 text-right font-mono text-ink">{money(b.revenue)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Peak ordering hours">
          <BarChart data={HOURLY_BARS} height={160} />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-subtle">
            <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
          </div>
        </Card>
      </div>

      <Card title="Order volume · 30 days">
        <div className="flex items-baseline gap-3">
          <div className="font-display text-2xl text-ink">{ORDERS_30D.reduce((a, b) => a + b, 0)} orders</div>
          <span className="font-mono text-[11px] text-signal">+22.4%</span>
        </div>
        <Sparkline data={ORDERS_30D} height={120} className="mt-4 w-full text-signal" stroke="var(--signal)" fill="color-mix(in oklch, var(--signal) 12%, transparent)" />
      </Card>
    </div>
  );
}
