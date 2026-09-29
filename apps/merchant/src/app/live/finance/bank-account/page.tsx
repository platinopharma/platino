"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function MerchantBankAccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankAccount, setBankAccount] = useState<any>(null);

  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const res = await fetch("/api/customer/v1/pharmacy/finance/bank-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBankAccount(data.bankAccount);
        if (data.bankAccount) {
          setAccountHolderName(data.bankAccount.accountHolderName || "");
          setIfscCode(data.bankAccount.ifscCode || "");
          setBankName(data.bankAccount.bankName || "");
        }
      }
    } catch (err) {
      toast.error("Failed to load bank account details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_merchant_token") : null;
      const res = await fetch("/api/customer/v1/pharmacy/finance/bank-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountHolderName,
          accountNumber,
          ifscCode: ifscCode.toUpperCase(),
          bankName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Bank account details saved and verified successfully!");
        setBankAccount(data.bankAccount);
        setAccountNumber("");
      } else {
        toast.error(data.detail || "Failed to update bank account");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div>
        <Link href="/live/finance" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Finance Dashboard
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Payout Bank Account</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Configure the target bank account for automated & manual withdrawal payouts.
        </p>
      </div>

      {/* Current Bank Status */}
      {bankAccount?.accountNumberMasked && (
        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-semibold text-ink">{bankAccount.bankName}</div>
                <div className="font-mono text-xs text-ink-muted">
                  {bankAccount.accountHolderName} · {bankAccount.accountNumberMasked}
                </div>
                <div className="font-mono text-[10px] text-ink-subtle">IFSC: {bankAccount.ifscCode}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        </div>
      )}

      {/* Update Bank Form */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink mb-1">
          {bankAccount?.accountNumberMasked ? "Update Bank Account" : "Register Bank Account"}
        </h2>
        <p className="text-xs text-ink-muted mb-6">
          Ensure all bank credentials match your registered pharmacy legal entity GSTIN.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Account Holder Name
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="e.g. Apollo Pharmacy Pvt Ltd"
              required
              className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Bank Account Number
            </label>
            <input
              type="password"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter full bank account number"
              required
              className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2.5 font-mono text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                required
                className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2.5 font-mono text-xs text-ink uppercase focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                required
                className="mt-1 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-xs text-ink focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-3 text-xs text-ink-muted flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink">Encryption & Security</span> — Full account details are encrypted and masked for security.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? "Saving & Verifying…" : "Save & Verify Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
