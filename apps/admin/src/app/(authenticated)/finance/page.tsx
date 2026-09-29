"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  Search,
  Settings,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminSummary {
  merchantCount: number;
  totalGrossVolume: number;
  totalCommissionEarned: number;
  totalFeesCollected: number;
  totalPendingSettlement: number;
  totalAvailableBalance: number;
  totalProcessingWithdrawals: number;
  totalWithdrawnPaid: number;
  pendingWithdrawalQueueCount: number;
  processingWithdrawalQueueCount: number;
}

interface MerchantAccount {
  financialAccountId: string;
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
  grossEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  processingBalance: number;
  withdrawnTotal: number;
  bankAccount?: {
    bankName?: string;
    accountNumberMasked?: string;
    verificationStatus?: string;
  };
}

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [merchants, setMerchants] = useState<MerchantAccount[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Manual Adjustment Modal
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [adjPharmacyId, setAdjPharmacyId] = useState("");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjDirection, setAdjDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjReason, setAdjReason] = useState("");
  const [submittingAdj, setSubmittingAdj] = useState(false);

  const fetchAdminFinanceData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const [sumRes, merchRes] = await Promise.all([
        fetch("/api/v1/admin/finance/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/v1/admin/finance/merchants?page=${page}&search=${search}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const sumData = await sumRes.json();
      const merchData = await merchRes.json();

      if (sumRes.ok && sumData.success) setSummary(sumData.summary);
      if (merchRes.ok && merchData.success) {
        setMerchants(merchData.merchants);
        setTotalPages(merchData.totalPages || 1);
      }
    } catch (err) {
      toast.error("Failed to load admin financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminFinanceData();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAdminFinanceData();
  };

  const handlePostAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjPharmacyId || !adjAmount || !adjReason) {
      toast.error("All fields are required for financial adjustments.");
      return;
    }

    setSubmittingAdj(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch("/api/v1/admin/finance/adjustments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pharmacyId: adjPharmacyId,
          amount: parseFloat(adjAmount),
          direction: adjDirection,
          description: adjReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Manual ledger adjustment posted successfully!");
        setAdjModalOpen(false);
        setAdjAmount("");
        setAdjReason("");
        fetchAdminFinanceData();
      } else {
        toast.error(data.detail || "Adjustment failed");
      }
    } catch (err) {
      toast.error("Error submitting adjustment");
    } finally {
      setSubmittingAdj(false);
    }
  };

  const handleRunReconciliation = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch("/api/v1/admin/finance/reconcile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Reconciliation completed!");
        fetchAdminFinanceData();
      }
    } catch (err) {
      toast.error("Reconciliation failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Finance & Payout Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            System-wide merchant ledger balances, platform commissions, withdrawal queues & audit controls.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRunReconciliation}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reconcile Balances
          </Button>
          <Link href="/finance/withdrawals">
            <Button variant="outline" size="sm" className="relative">
              <Clock className="mr-2 h-4 w-4" /> Withdrawal Queue
              {(summary?.pendingWithdrawalQueueCount || 0) > 0 && (
                <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {summary?.pendingWithdrawalQueueCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/finance/settings">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" /> Financial Rules
            </Button>
          </Link>
          <Button size="sm" onClick={() => setAdjModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Post Adjustment
          </Button>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Total Gross Volume</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold">
            ₹{(summary?.totalGrossVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {summary?.merchantCount || 0} active merchants
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <span>Platform Commission Earned</span>
            <IndianRupee className="h-4 w-4" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{(summary?.totalCommissionEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Plus ₹{(summary?.totalFeesCollected || 0).toLocaleString()} payment fees
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <span>Pending Merchant Settlement</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold">
            ₹{(summary?.totalPendingSettlement || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Delivered orders in hold window
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <span>Available Merchant Balance</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{(summary?.totalAvailableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Eligible for merchant withdrawal
          </div>
        </div>
      </div>

      {/* Merchant Financial Accounts Table */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b">
          <h2 className="font-display text-lg font-bold">Merchant Financial Accounts</h2>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pharmacy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-64 pl-9 text-xs"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-mono uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3">Pharmacy / Owner</th>
                <th className="px-4 py-3 text-right">Gross Sales</th>
                <th className="px-4 py-3 text-right">Pending Hold</th>
                <th className="px-4 py-3 text-right">Available Balance</th>
                <th className="px-4 py-3 text-right">Processing</th>
                <th className="px-4 py-3 text-right">Total Withdrawn</th>
                <th className="px-4 py-3 text-center">Bank Verification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-sans">
                    No merchant financial accounts registered yet.
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <tr key={m.financialAccountId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-foreground">{m.pharmacyName}</div>
                      <div className="text-xs text-muted-foreground">{m.ownerName} · {m.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      ₹{m.grossEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400 font-medium">
                      ₹{m.pendingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{m.availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-medium">
                      ₹{m.processingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      ₹{m.withdrawnTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center font-sans">
                      {m.bankAccount?.verificationStatus === "VERIFIED" ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          VERIFIED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                          PENDING
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setAdjPharmacyId(m.pharmacyId);
                          setAdjModalOpen(true);
                        }}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Adjustment Modal */}
      {adjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-xl font-bold">Post Financial Adjustment</h2>
            <p className="text-xs text-muted-foreground">
              Create an authorized manual ledger adjustment with full audit trail.
            </p>

            <form onSubmit={handlePostAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Pharmacy
                </label>
                <select
                  value={adjPharmacyId}
                  onChange={(e) => setAdjPharmacyId(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="">Select target pharmacy...</option>
                  {merchants.map((m) => (
                    <option key={m.pharmacyId} value={m.pharmacyId}>
                      {m.pharmacyName} (Avail: ₹{m.availableBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Adjustment Type
                  </label>
                  <select
                    value={adjDirection}
                    onChange={(e) => setAdjDirection(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="CREDIT">CREDIT (+ Add Balance)</option>
                    <option value="DEBIT">DEBIT (- Deduct Balance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    className="mt-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reason / Audit Note
                </label>
                <textarea
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="Reason for financial adjustment..."
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setAdjModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingAdj}>
                  {submittingAdj ? "Posting…" : "Confirm & Post Adjustment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
