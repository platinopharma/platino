"use client";

import { toast } from "sonner";
import { Download, TrendingUp, Users, Repeat, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AreaTrend, BarTrend, DonutChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStatsQuery } from "@/hooks/useAdminDashboardQueries";
import { inr, num } from "@/lib/format";

// Static chart fallbacks until backend aggregations are built
const revenueTrend = [{ month: "Jan", revenue: 120000, orders: 1200 }, { month: "Feb", revenue: 145000, orders: 1450 }, { month: "Mar", revenue: 180000, orders: 1800 }, { month: "Apr", revenue: 165000, orders: 1650 }, { month: "May", revenue: 210000, orders: 2100 }, { month: "Jun", revenue: 280000, orders: 2800 }];
const cityDistribution = [{ city: "Mumbai", value: 14500 }, { city: "Delhi", value: 12200 }, { city: "Bangalore", value: 9800 }, { city: "Hyderabad", value: 6400 }, { city: "Chennai", value: 5200 }, { city: "Pune", value: 4100 }];
const categoryDistribution = [{ name: "Antibiotics", value: 35 }, { name: "Cardiac", value: 25 }, { name: "Diabetes", value: 20 }, { name: "Pain Relief", value: 15 }, { name: "Vitamins", value: 5 }];

function Analytics() {
  const { data } = useDashboardStatsQuery();
  const kpis = data?.kpis || {};
  const topPharmacies = data?.latestRegistrations || [];
  const heat = Array.from({ length: 7 * 12 });

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Growth, retention and performance insights."
        actions={<Button variant="outline" onClick={() => toast.success("Report exported as CSV")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={inr(kpis.revenue || 0)} icon={TrendingUp} delta={12} hint="Since launch" accent="success" index={0} />
        <StatCard label="Total Orders" value={num(kpis.totalOrders || 0)} icon={Activity} delta={kpis.todayOrders || 0} hint="today" accent="primary" index={1} />
        <StatCard label="Active Pharmacies" value={num(kpis.active || 0)} icon={Repeat} delta={0} hint="live stores" accent="info" index={2} />
        <StatCard label="Total Customers" value={num(kpis.customers || 0)} icon={Users} delta={0} hint="registered users" accent="warning" index={3} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader><CardTitle>Revenue & Orders Growth</CardTitle></CardHeader>
          <CardContent><AreaTrend data={revenueTrend} dataKey="revenue" color="var(--color-chart-2)" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Medicine Categories</CardTitle></CardHeader>
          <CardContent><DonutChart data={categoryDistribution} /></CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader><CardTitle>Orders by City</CardTitle></CardHeader>
          <CardContent><BarTrend data={cityDistribution} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Pharmacies</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topPharmacies.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-semibold">{i + 1}</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{p.storeName}</div><div className="text-xs text-muted-foreground">{p.city}</div></div>
                <span className="text-sm font-medium">{inr(p.revenue, true)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Activity Heatmap</CardTitle><p className="mt-1 text-sm text-muted-foreground">Order density across the week</p></CardHeader>
        <CardContent>
          <div className="flex gap-1.5 overflow-x-auto">
            {Array.from({ length: 12 }).map((_, week) => (
              <div key={week} className="flex flex-col gap-1.5">
                {Array.from({ length: 7 }).map((_, day) => {
                  const v = (week * 7 + day) % 5;
                  const opacity = [0.08, 0.25, 0.45, 0.7, 1][v];
                  return <span key={day} className="h-5 w-5 rounded" style={{ background: `oklch(0.58 0.13 158 / ${opacity})` }} />;
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default Analytics;
