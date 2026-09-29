"use client";

import { motion } from "framer-motion";
import {
  Store, Clock, CheckCircle2, WifiOff, ShoppingBag, TrendingUp,
  IndianRupee, Pill, Users, Truck, UserPlus, FileCheck, Activity as ActivityIcon, ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AreaTrend, DonutChart, BarTrend } from "@/components/charts";
import { IndiaMap } from "@/components/india-map";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartSkeleton, DonutSkeleton, ListSkeleton } from "@/components/data-states";
import { useSimulatedLoading } from "@/hooks/use-loading";
import { inr, num, fromNow } from "@/lib/format";
import { useDashboardStatsQuery } from "@/hooks/useAdminDashboardQueries";

// Dynamic data is now coming from the backend API

const ACT_ICON = { registration: UserPlus, order: ShoppingBag, approval: FileCheck, system: ActivityIcon };

function Dashboard() {
  const { data, isLoading } = useDashboardStatsQuery();
  
  const kpis = data?.kpis || {
    totalPharmacies: 0,
    pending: 0,
    active: 0,
    offline: 0,
    todayOrders: 0,
    totalOrders: 0,
    revenue: 0,
    medicines: 0,
    customers: 0,
    deliverySuccess: 0
  };
  
  const latestRegistrations = data?.latestRegistrations || [];
  const ordersTrend = data?.trends?.ordersTrend || [];
  const revenueTrend = data?.trends?.revenueTrend || [];
  const cityDistribution = data?.cityDistribution || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const activities = data?.activities || [];

  const stats = [
    { label: "Partner Pharmacies", value: num(kpis.totalPharmacies), icon: Store, delta: 12, hint: "vs last month", accent: "primary" as const },
    { label: "Pending Verifications", value: num(kpis.pending), icon: Clock, delta: -4, hint: "in queue", accent: "warning" as const },
    { label: "Active Pharmacies", value: num(kpis.active), icon: CheckCircle2, delta: 8, hint: "online now", accent: "success" as const },
    { label: "Offline", value: num(kpis.offline), icon: WifiOff, delta: -2, hint: "last 24h", accent: "info" as const },
    { label: "Today's Orders", value: num(kpis.todayOrders), icon: ShoppingBag, delta: 18, hint: "since midnight", accent: "primary" as const },
    { label: "Total Orders", value: num(kpis.totalOrders), icon: TrendingUp, delta: 9, hint: "all time", accent: "info" as const },
    { label: "Revenue", value: inr(kpis.revenue, true), icon: IndianRupee, delta: 14, hint: "this month", accent: "success" as const },
    { label: "Total Medicines", value: num(kpis.medicines), icon: Pill, delta: 5, hint: "listed", accent: "primary" as const },
    { label: "Customers", value: num(kpis.customers), icon: Users, delta: 11, hint: "registered", accent: "info" as const },
    { label: "Delivery Success", value: `${kpis.deliverySuccess}%`, icon: Truck, delta: 1.2, hint: "30-day avg", accent: "success" as const },
  ];

  return (
    <>
      <PageHeader
        title="Operations Overview"
        subtitle="Real-time pulse of your nationwide pharmacy network."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard key={s.label} index={i} {...s} />
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">


          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Performance</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Orders and revenue across the week</p>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="orders" className="mt-4">
                {isLoading ? <ChartSkeleton /> : <AreaTrend data={ordersTrend} dataKey="orders" />}
              </TabsContent>
              <TabsContent value="revenue" className="mt-4">
                {isLoading ? <ChartSkeleton /> : <AreaTrend data={revenueTrend} dataKey="revenue" color="var(--color-chart-2)" />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medicine Categories</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Distribution by therapeutic area</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DonutSkeleton />
            ) : (
              <>
                <DonutChart data={categoryDistribution} />
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                  {categoryDistribution.slice(0, 6).map((c: any, i: number) => (
                    <div key={c.name} className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: `var(--color-chart-${(i % 5) + 1})` }} />
                      {c.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pharmacy Distribution</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Network spread across India</p>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {[["Verified", "bg-success"], ["Pending", "bg-warning"], ["Offline", "bg-muted-foreground"], ["Suspended", "bg-destructive"]].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1.5 text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${c}`} />{l}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <IndiaMap pharmacies={latestRegistrations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <span className="flex items-center gap-1 text-xs text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />Live</span>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <ListSkeleton rows={6} />
            ) : (
              activities.map((a: any, i: number) => {
                const Icon = ACT_ICON[a.type as keyof typeof ACT_ICON];
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{fromNow(a.at)}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Cities by Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartSkeleton /> : <BarTrend data={cityDistribution} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Latest Registrations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <ListSkeleton rows={5} />
            ) : (
              latestRegistrations.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold text-white" style={{ background: p.avatarColor }}>
                    {p.storeName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.storeName}</p>
                    <p className="text-xs text-muted-foreground">{p.city} · {fromNow(p.registeredAt)}</p>
                  </div>
                  <StatusBadge status={p.verification} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Dashboard;
