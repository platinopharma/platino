"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Download,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface FinancialSummary {
  grossEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  processingBalance: number;
  withdrawnTotal: number;
  refundsTotal: number;
  commissionTotal: number;
  feesTotal: number;
  bankAccount?: {
    accountHolderName?: string;
    accountNumberMasked?: string;
    ifscCode?: string;
    bankName?: string;
    verificationStatus?: string;
  };
}

interface PeriodMetric {
  grossSales: number;
  netEarnings: number;
  orderCount: number;
}

export default function MerchantFinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [metrics, setMetrics] = useState<{ today: PeriodMetric; week: PeriodMetric; month: PeriodMetric } | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const res = await fetch("/api/customer/v1/pharmacy/finance/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSummary(data.account);
        setMetrics(data.metrics);
        setSettings(data.settings);
      } else {
        toast.error(data.detail || "Failed to load financial data");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid positive withdrawal amount");
      return;
    }

    if (summary && amountNum > summary.availableBalance) {
      toast.error(`Amount exceeds available balance (₹${summary.availableBalance.toLocaleString()})`);
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const idempotencyKey = `WTH-REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const res = await fetch("/api/customer/v1/pharmacy/finance/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ amount: amountNum }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Withdrawal request submitted successfully!");
        setWithdrawModalOpen(false);
        setWithdrawAmount("");
        fetchFinanceData();
      } else {
        toast.error(data.detail || "Withdrawal failed");
      }
    } catch (err) {
      toast.error("Network error submitting withdrawal");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const isBankVerified = summary?.bankAccount?.verificationStatus === "VERIFIED";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Finance & Earnings</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Authoritative financial ledger, settlement status, and withdrawal controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFinanceData}
            className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-hover"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={() => setWithdrawModalOpen(true)}
            disabled={!isBankVerified || (summary?.availableBalance || 0) <= 0}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-brand/90 disabled:opacity-50"
          >
            <IndianRupee className="h-4 w-4" /> Withdraw Funds
          </button>
        </div>
      </div>

      {/* Primary Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-paper to-paper p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-brand">
            <span>AVAILABLE TO WITHDRAW</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-ink">
            ₹{(summary?.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Ready for instant bank transfer.
          </p>
        </div>

        {/* Pending Settlement Card */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>PENDING SETTLEMENT</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-ink">
            ₹{(summary?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Delivered orders in {settings?.settlementHoldHours || 24}h hold.
          </p>
        </div>

        {/* Processing Withdrawal Card */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>PROCESSING WITHDRAWAL</span>
            <RefreshCw className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-ink">
            ₹{(summary?.processingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Bank transfer in progress.
          </p>
        </div>

        {/* Total Paid Out Card */}
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>TOTAL PAID OUT</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-ink">
            ₹{(summary?.withdrawnTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Cumulative total transferred to bank.
          </p>
        </div>
      </div>

      {/* Period Metrics (Today / Week / Month) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Today's Sales</span>
            <TrendingUp className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            ₹{(metrics?.today.netEarnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-ink-muted">
            {metrics?.today.orderCount || 0} orders · Gross: ₹{(metrics?.today.grossSales || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">This Week's Net</span>
            <TrendingUp className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            ₹{(metrics?.week.netEarnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-ink-muted">
            {metrics?.week.orderCount || 0} orders · Gross: ₹{(metrics?.week.grossSales || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">This Month's Net</span>
            <TrendingUp className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            ₹{(metrics?.month.netEarnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-ink-muted">
            {metrics?.month.orderCount || 0} orders · Gross: ₹{(metrics?.month.grossSales || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/live/finance/transactions"
          className="group flex items-center justify-between rounded-2xl border border-line bg-paper p-5 transition-all hover:border-brand/40 hover:shadow-md"
        >
          <div>
            <div className="font-display font-semibold text-ink group-hover:text-brand">Financial Ledger</div>
            <div className="text-xs text-ink-muted">View all order earnings, commissions & fees</div>
          </div>
          <FileText className="h-5 w-5 text-ink-subtle group-hover:text-brand" />
        </Link>

        <Link
          href="/live/finance/withdrawals"
          className="group flex items-center justify-between rounded-2xl border border-line bg-paper p-5 transition-all hover:border-brand/40 hover:shadow-md"
        >
          <div>
            <div className="font-display font-semibold text-ink group-hover:text-brand">Withdrawal History</div>
            <div className="text-xs text-ink-muted">Track payout status & bank transfers</div>
          </div>
          <Clock className="h-5 w-5 text-ink-subtle group-hover:text-brand" />
        </Link>

        <Link
          href="/live/finance/reports"
          className="group flex items-center justify-between rounded-2xl border border-line bg-paper p-5 transition-all hover:border-brand/40 hover:shadow-md"
        >
          <div>
            <div className="font-display font-semibold text-ink group-hover:text-brand">Weekly Reports</div>
            <div className="text-xs text-ink-muted">Mon-Sun revenue breakdown & CSV export</div>
          </div>
          <Download className="h-5 w-5 text-ink-subtle group-hover:text-brand" />
        </Link>
      </div>

      {/* Bank Account Target Card */}
      <div className="rounded-2xl border border-line bg-paper p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-semibold text-ink">Payout Bank Account</div>
              <div className="text-xs text-ink-muted">
                {summary?.bankAccount?.bankName
                  ? `${summary.bankAccount.bankName} · ${summary.bankAccount.accountNumberMasked}`
                  : "No bank account registered yet"}
              </div>
            </div>
          </div>
          <div>
            {isBankVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <Link
                href="/live/finance/bank-account"
                className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 hover:underline"
              >
                <AlertCircle className="h-3.5 w-3.5" /> Update Bank Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-ink">Request Withdrawal</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Transfer available balance to your verified bank account.
            </p>

            <form onSubmit={handleWithdraw} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  Available Balance
                </label>
                <div className="mt-1 font-mono text-2xl font-bold text-brand">
                  ₹{(summary?.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={settings?.minimumWithdrawalAmount || 1000}
                  max={summary?.availableBalance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Min ₹${(settings?.minimumWithdrawalAmount || 1000).toLocaleString()}`}
                  required
                  className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2.5 font-mono text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-muted/40 p-3 text-xs text-ink-muted space-y-1">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="font-medium text-ink">{summary?.bankAccount?.bankName} ({summary?.bankAccount?.accountNumberMasked})</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span className="font-medium text-ink">1-2 Business Hours</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal}
                  className="rounded-xl bg-brand px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand/90 disabled:opacity-50"
                >
                  {submittingWithdrawal ? "Submitting…" : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
