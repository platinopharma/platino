"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, BarChart2 } from "lucide-react";
import { toast } from "sonner";

interface DailyReport {
  day: string;
  date: string;
  orders: number;
  grossSales: number;
  commission: number;
  fees: number;
  refunds: number;
  netEarnings: number;
}

export default function MerchantReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<{ totalGross: number; totalNet: number; totalOrders: number } | null>(null);

  const fetchWeeklyReport = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const res = await fetch("/api/customer/v1/pharmacy/finance/reports/weekly", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDailyData(data.dailyBreakdown || []);
        setSummary(data.summary || null);
      } else {
        toast.error("Failed to load report");
      }
    } catch (err) {
      toast.error("Network error loading report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReport();
  }, []);

  const maxNet = Math.max(...dailyData.map((d) => d.netEarnings), 1);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/live/finance" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Finance Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Weekly Financial Report</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Mon-Sun daily breakdown of gross revenue, commissions, fees, refunds, and net earnings.
          </p>
        </div>
        <div>
          <button
            onClick={fetchWeeklyReport}
            className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-hover"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Weekly Gross Volume</div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            ₹{(summary?.totalGross || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Weekly Net Earnings</div>
          <div className="mt-2 font-mono text-2xl font-bold text-brand">
            ₹{(summary?.totalNet || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Total Delivered Orders</div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            {summary?.totalOrders || 0}
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-ink mb-6">Daily Net Revenue (Mon – Sun)</h2>
        <div className="flex h-48 items-end gap-3 pt-6 pb-2 border-b border-line">
          {dailyData.map((d) => {
            const heightPct = Math.max(8, Math.round((d.netEarnings / maxNet) * 100));
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono font-semibold text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{d.netEarnings.toLocaleString()}
                </div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[40px] rounded-t-lg bg-brand transition-all group-hover:bg-brand/80"
                />
                <div className="font-mono text-xs font-semibold text-ink-subtle">{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 font-mono uppercase tracking-wider text-ink-subtle border-b border-line">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-right">Gross Sales (₹)</th>
                <th className="px-4 py-3 text-right">Commission (₹)</th>
                <th className="px-4 py-3 text-right">Fees (₹)</th>
                <th className="px-4 py-3 text-right">Refunds (₹)</th>
                <th className="px-4 py-3 text-right">Net Earnings (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {dailyData.map((d) => (
                <tr key={d.day} className="hover:bg-hover/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-ink">{d.day}</td>
                  <td className="px-4 py-3 text-ink-muted">{d.date}</td>
                  <td className="px-4 py-3 text-center text-ink">{d.orders}</td>
                  <td className="px-4 py-3 text-right text-ink">₹{d.grossSales.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">-₹{d.commission.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">-₹{d.fees.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">-₹{d.refunds.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{d.netEarnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
