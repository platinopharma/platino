"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  FileSpreadsheet,
  X,
  Check,
} from "lucide-react";

interface ExceptionItem {
  _id: string;
  runId: string;
  level: number;
  entityType: string;
  entityId: string;
  providerReference?: string;
  expectedAmountInPaise: number;
  actualAmountInPaise: number;
  differenceInPaise: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "IGNORED";
  reason: string;
  resolutionNote?: string;
  resolvedAt?: string;
  createdAt: string;
}

export default function FinancialExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (levelFilter) params.append("level", levelFilter);
      if (severityFilter) params.append("severity", severityFilter);

      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const res = await fetch(`/api/v1/admin/finance/exceptions?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.exceptions)) {
        setExceptions(json.exceptions);
      } else {
        setExceptions([]);
      }
    } catch (err) {
      console.error("Failed to fetch financial exceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [statusFilter, levelFilter, severityFilter]);

  const handleRunReconciliation = async () => {
    setReconciling(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const res = await fetch("/api/v1/admin/finance/reconcile-full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        setMessage({
          text: `7-Level Reconciliation completed! Found ${json.run?.exceptionCount || 0} exceptions out of ${json.run?.totalRecordsChecked || 0} records.`,
          type: "success",
        });
        fetchExceptions();
      } else {
        setMessage({ text: json.error || "Reconciliation failed.", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to run reconciliation.", type: "error" });
    } finally {
      setReconciling(false);
    }
  };

  const handleResolve = async (ignoreOnly: boolean = false) => {
    if (!selectedException) return;
    if (!resolutionNote.trim() && !ignoreOnly) {
      setMessage({ text: "Please enter a resolution note detailing the fix.", type: "error" });
      return;
    }

    setResolving(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const res = await fetch(`/api/v1/admin/finance/exceptions/${selectedException._id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resolutionNote: resolutionNote.trim(),
          ignoreOnly,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ text: `Exception #${selectedException._id} updated successfully.`, type: "success" });
        setSelectedException(null);
        setResolutionNote("");
        fetchExceptions();
      } else {
        setMessage({ text: json.error || "Failed to resolve exception.", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error resolving exception.", type: "error" });
    } finally {
      setResolving(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "OPEN":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "INVESTIGATING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getLevelLabel = (lvl: number) => {
    const map: Record<number, string> = {
      1: "L1: Customer Payment ↔ Gateway",
      2: "L2: Order Status ↔ Payment Verification",
      3: "L3: Payment ↔ Ledger Entry",
      4: "L4: Merchant Ledger ↔ Account Projection",
      5: "L5: Rider Ledger ↔ Account Projection",
      6: "L6: Withdrawal ↔ Payout Execution",
      7: "L7: Gateway Settlement ↔ Internal Accounting",
    };
    return map[lvl] || `Level ${lvl}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Financial Exception Center</h1>
              <p className="text-sm text-slate-400">7-Level Automated Reconciliation Audit & Discrepancy Manager</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExceptions}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition flex items-center space-x-2 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunReconciliation}
            disabled={reconciling}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition flex items-center space-x-2 text-sm font-semibold shadow-lg shadow-emerald-950/50"
          >
            <RefreshCw className={`w-4 h-4 ${reconciling ? "animate-spin" : ""}`} />
            <span>{reconciling ? "Reconciling..." : "Run 7-Level Audit"}</span>
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border-rose-500/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Filter Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg p-2.5 focus:border-emerald-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open Discrepancies</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IGNORED">Ignored</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Reconciliation Level
          </label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg p-2.5 focus:border-emerald-500 outline-none"
          >
            <option value="">All 7 Levels</option>
            <option value="1">L1: Customer Payment ↔ Gateway</option>
            <option value="2">L2: Order Status ↔ Payment Verification</option>
            <option value="3">L3: Payment ↔ Ledger Entry</option>
            <option value="4">L4: Merchant Ledger ↔ Account</option>
            <option value="5">L5: Rider Ledger ↔ Account</option>
            <option value="6">L6: Withdrawal ↔ Payout Execution</option>
            <option value="7">L7: Gateway Settlement ↔ Accounting</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Severity Level
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg p-2.5 focus:border-emerald-500 outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Exception Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Level & Entity</th>
                <th className="py-3.5 px-4 font-semibold">Reason / Description</th>
                <th className="py-3.5 px-4 font-semibold">Expected vs Actual</th>
                <th className="py-3.5 px-4 font-semibold">Difference</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    Scanning audit exceptions...
                  </td>
                </tr>
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No financial exceptions detected matching criteria.
                  </td>
                </tr>
              ) : (
                exceptions.map((ex) => (
                  <tr key={ex._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{getLevelLabel(ex.level)}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {ex.entityType}: {ex.entityId}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs truncate text-slate-300">
                      {ex.reason}
                    </td>

                    <td className="py-4 px-4 font-mono text-xs">
                      <div className="text-slate-300">Exp: ₹{(ex.expectedAmountInPaise / 100).toFixed(2)}</div>
                      <div className="text-slate-400">Act: ₹{(ex.actualAmountInPaise / 100).toFixed(2)}</div>
                    </td>

                    <td className="py-4 px-4 font-mono font-semibold text-rose-400">
                      ₹{(ex.differenceInPaise / 100).toFixed(2)}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getSeverityBadge(ex.severity)}`}>
                        {ex.severity}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(ex.status)}`}>
                        {ex.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedException(ex);
                          setResolutionNote(ex.resolutionNote || "");
                        }}
                        className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 hover:text-white transition text-xs font-medium border border-slate-700"
                      >
                        Inspect / Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Inspect Discrepancy #{selectedException._id.substring(0, 8)}</h2>
                <p className="text-xs text-slate-400">{getLevelLabel(selectedException.level)}</p>
              </div>
              <button onClick={() => setSelectedException(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-400">Root Cause Reason:</div>
                <div className="text-slate-200 font-medium">{selectedException.reason}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Expected Ledger Amount</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                    ₹{(selectedException.expectedAmountInPaise / 100).toFixed(2)}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Actual Account Amount</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-1">
                    ₹{(selectedException.actualAmountInPaise / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Admin Resolution Note & Correction Reference
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain resolution action taken, manual adjustment reference, or investigation outcome..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => handleResolve(true)}
                disabled={resolving}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition text-sm font-medium"
              >
                Mark Ignored
              </button>

              <button
                onClick={() => handleResolve(false)}
                disabled={resolving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition text-sm font-semibold flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{resolving ? "Saving..." : "Mark Resolved"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
