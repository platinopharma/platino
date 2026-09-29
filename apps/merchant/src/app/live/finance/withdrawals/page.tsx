"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Withdrawal {
  withdrawalId: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  bankAccount: {
    accountHolderName: string;
    accountNumberMasked: string;
    ifscCode: string;
    bankName: string;
  };
  status: string;
  providerReference?: string;
  failureReason?: string;
  requestedAt: string;
  completedAt?: string;
}

export default function MerchantWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      const res = await fetch(`/api/customer/v1/pharmacy/finance/withdrawals?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWithdrawals(data.withdrawals);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.detail || "Failed to load withdrawal history");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [page, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> PAID
          </span>
        );
      case "PROCESSING":
      case "VALIDATING":
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
      case "REJECTED":
      case "FAILED":
      case "REVERSED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-3 w-3" /> {status}
          </span>
        );
      default:
        return <span className="font-mono text-[10px] text-ink-subtle">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/live/finance" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Finance Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Withdrawal History</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Track real-time status of payout transfers to your bank account.
          </p>
        </div>
        <div>
          <button
            onClick={fetchWithdrawals}
            className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-hover"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3 shadow-sm">
        <span className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">Status Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          <option value="">All Payout Statuses</option>
          <option value="REQUESTED">Requested</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Withdrawals Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 font-mono uppercase tracking-wider text-ink-subtle border-b border-line">
              <tr>
                <th className="px-4 py-3">Requested Date</th>
                <th className="px-4 py-3">Withdrawal ID</th>
                <th className="px-4 py-3">Destination Bank</th>
                <th className="px-4 py-3 text-right">Requested Amount</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-right">Net Payout</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Ref ID / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand mb-2" />
                    Loading withdrawal history…
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    No withdrawal requests recorded yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.withdrawalId} className="hover:bg-hover/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-ink-muted whitespace-nowrap">
                      {new Date(w.requestedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-ink whitespace-nowrap">
                      {w.withdrawalId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-ink">{w.bankAccount.bankName}</div>
                      <div className="text-[10px] font-mono text-ink-subtle">{w.bankAccount.accountNumberMasked}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink whitespace-nowrap">
                      ₹{w.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-muted whitespace-nowrap">
                      ₹{w.fee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ₹{w.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(w.status)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-[11px] max-w-xs truncate">
                      {w.providerReference || w.failureReason || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-ink-muted">
          <div>Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-line px-3 py-1 text-ink disabled:opacity-50 hover:bg-hover"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-line px-3 py-1 text-ink disabled:opacity-50 hover:bg-hover"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
