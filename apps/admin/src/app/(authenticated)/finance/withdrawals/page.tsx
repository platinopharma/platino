"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, RefreshCw, Check, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Withdrawal {
  withdrawalId: string;
  pharmacyId: string;
  pharmacyName: string;
  amount: number;
  fee: number;
  netAmount: number;
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
  auditTrail?: any[];
}

export default function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("REQUESTED");

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch(`/api/v1/admin/finance/withdrawals?page=${page}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWithdrawals(data.withdrawals);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.detail || "Failed to load withdrawal queue");
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

  const handleApprove = async (id: string) => {
    if (!confirm(`Are you sure you want to approve withdrawal #${id}?`)) return;
    setSubmittingAction(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch(`/api/v1/admin/finance/withdrawals/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Withdrawal #${id} approved successfully!`);
        fetchWithdrawals();
      } else {
        toast.error(data.detail || "Failed to approve withdrawal");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error("Rejection reason is required.");
      return;
    }
    setSubmittingAction(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch(`/api/v1/admin/finance/withdrawals/${targetId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Withdrawal #${targetId} rejected and funds returned to merchant.`);
        setRejectModalOpen(false);
        setRejectReason("");
        fetchWithdrawals();
      } else {
        toast.error(data.detail || "Failed to reject withdrawal");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRetry = async (id: string) => {
    setSubmittingAction(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch(`/api/v1/admin/finance/withdrawals/${id}/retry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Withdrawal #${id} retried successfully!`);
        fetchWithdrawals();
      } else {
        toast.error(data.detail || "Failed to retry withdrawal");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/finance" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Finance Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">Withdrawal Queue & Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, approve, or reject merchant payout withdrawal requests.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWithdrawals}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Queue
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm">
        {["REQUESTED", "PROCESSING", "PAID", "REJECTED", "FAILED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-mono uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3">Requested At</th>
                <th className="px-4 py-3">Withdrawal ID</th>
                <th className="px-4 py-3">Pharmacy Partner</th>
                <th className="px-4 py-3">Bank Destination</th>
                <th className="px-4 py-3 text-right">Requested</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-right">Net Payout</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground font-sans">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                    Loading withdrawal queue…
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground font-sans">
                    No withdrawal requests found for status '{statusFilter}'.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.withdrawalId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(w.requestedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {w.withdrawalId}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-medium text-foreground">{w.pharmacyName}</div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div>{w.bankAccount?.bankName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{w.bankAccount?.accountNumberMasked}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      ₹{w.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      ₹{w.fee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{w.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center font-sans">
                      <Badge variant="outline" className={`text-[10px] ${
                        w.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : w.status === "REQUESTED"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }`}>
                        {w.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      {w.status === "REQUESTED" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5"
                            onClick={() => handleApprove(w.withdrawalId)}
                            disabled={submittingAction}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs px-2.5"
                            onClick={() => {
                              setTargetId(w.withdrawalId);
                              setRejectModalOpen(true);
                            }}
                            disabled={submittingAction}
                          >
                            <X className="mr-1 h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                      {w.status === "FAILED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleRetry(w.withdrawalId)}
                          disabled={submittingAction}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" /> Retry Payout
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-xl font-bold text-destructive">Reject Withdrawal #{targetId}</h2>
            <p className="text-xs text-muted-foreground">
              Rejecting this request will immediately return the requested funds back to the merchant's available balance.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rejection Reason (Sent to merchant)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid bank account name mismatch..."
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={submittingAction}>
                  {submittingAction ? "Rejecting…" : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
