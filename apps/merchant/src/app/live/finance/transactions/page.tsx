"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  ledgerEntryId: string;
  orderId?: string;
  withdrawalId?: string;
  type: string;
  direction: "CREDIT" | "DEBIT";
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  description: string;
  effectiveAt: string;
}

export default function MerchantTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search ? { search } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      const res = await fetch(`/api/customer/v1/pharmacy/finance/transactions?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.transactions);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.detail || "Failed to load transactions");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleExportCsv = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const res = await fetch("/api/customer/v1/pharmacy/finance/reports/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `platino-financial-ledger-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("CSV report exported successfully");
    } catch (err) {
      toast.error("Failed to export CSV");
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Financial Ledger</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Immutable transaction history for all orders, commissions, fees, refunds, and withdrawals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:bg-hover"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper p-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search by ID, Order # or Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-background pl-9 pr-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          <option value="">All Transaction Types</option>
          <option value="ORDER_EARNING">Order Earning</option>
          <option value="COMMISSION">Commission</option>
          <option value="PAYMENT_FEE">Payment Fee</option>
          <option value="REFUND">Refund</option>
          <option value="WITHDRAWAL">Withdrawal</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SETTLED">Settled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button type="submit" className="rounded-xl bg-brand px-4 py-1.5 text-xs font-semibold text-white">
          Apply Filter
        </button>
      </form>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 font-mono uppercase tracking-wider text-ink-subtle border-b border-line">
              <tr>
                <th className="px-4 py-3">Effective Date</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-right">Running Balance</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand mb-2" />
                    Loading transaction ledger…
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    No financial ledger transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.ledgerEntryId} className="hover:bg-hover/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-ink-muted whitespace-nowrap">
                      {new Date(t.effectiveAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-ink whitespace-nowrap">
                      {t.ledgerEntryId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        t.direction === "CREDIT"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink font-medium max-w-xs truncate">
                      {t.description}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${
                      t.direction === "CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {t.direction === "CREDIT" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-muted whitespace-nowrap">
                      ₹{t.balanceAfter.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        t.status === "SETTLED"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : t.status === "PENDING"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-slate-500/15 text-slate-600"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
