"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RefreshCw, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminFinanceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settlementHoldHours, setSettlementHoldHours] = useState(24);
  const [commissionPercentage, setCommissionPercentage] = useState(15);
  const [paymentFeePercentage, setPaymentFeePercentage] = useState(2);
  const [minimumWithdrawalAmount, setMinimumWithdrawalAmount] = useState(1000);
  const [maximumWithdrawalAmount, setMaximumWithdrawalAmount] = useState(50000);
  const [withdrawalFee, setWithdrawalFee] = useState(0);
  const [settlementFrequency, setSettlementFrequency] = useState("WEEKLY");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch("/api/v1/admin/finance/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setSettlementHoldHours(data.settings.settlementHoldHours || 24);
        setCommissionPercentage(data.settings.commissionPercentage || 15);
        setPaymentFeePercentage(data.settings.paymentFeePercentage || 2);
        setMinimumWithdrawalAmount(data.settings.minimumWithdrawalAmount || 1000);
        setMaximumWithdrawalAmount(data.settings.maximumWithdrawalAmount || 50000);
        setWithdrawalFee(data.settings.withdrawalFee || 0);
        setSettlementFrequency(data.settings.settlementFrequency || "WEEKLY");
      }
    } catch (err) {
      toast.error("Failed to load financial settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("platino_admin_token") : null;
      const res = await fetch("/api/v1/admin/finance/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settlementHoldHours: Number(settlementHoldHours),
          commissionPercentage: Number(commissionPercentage),
          paymentFeePercentage: Number(paymentFeePercentage),
          minimumWithdrawalAmount: Number(minimumWithdrawalAmount),
          maximumWithdrawalAmount: Number(maximumWithdrawalAmount),
          withdrawalFee: Number(withdrawalFee),
          settlementFrequency,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Financial rules & commission settings updated!");
      } else {
        toast.error(data.detail || "Failed to update settings");
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
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/finance" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Finance Dashboard
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight">Financial Rules & Commission Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure platform commission rates, settlement hold durations, and merchant payout thresholds.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Commission (%)
            </label>
            <Input
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={commissionPercentage}
              onChange={(e) => setCommissionPercentage(parseFloat(e.target.value))}
              required
              className="mt-1 text-xs font-mono"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Default commission deducted from merchant order gross sales.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Processing Fee (%)
            </label>
            <Input
              type="number"
              step="0.1"
              min={0}
              max={20}
              value={paymentFeePercentage}
              onChange={(e) => setPaymentFeePercentage(parseFloat(e.target.value))}
              required
              className="mt-1 text-xs font-mono"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Gateway processing fee deducted from merchant earnings.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settlement Hold Period (Hours)
            </label>
            <Input
              type="number"
              min={0}
              max={720}
              value={settlementHoldHours}
              onChange={(e) => setSettlementHoldHours(parseInt(e.target.value))}
              required
              className="mt-1 text-xs font-mono"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Hours delivered orders remain in hold before moving to available balance (e.g. 24h).
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settlement Schedule Frequency
            </label>
            <select
              value={settlementFrequency}
              onChange={(e) => setSettlementFrequency(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
            >
              <option value="DAILY">DAILY (T+1 Rolling Release)</option>
              <option value="WEEKLY">WEEKLY (Monday - Sunday)</option>
              <option value="MONTHLY">MONTHLY (Calendar Month)</option>
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Payout release cycle for automated settlement calculations.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Minimum Withdrawal Limit (₹)
            </label>
            <Input
              type="number"
              min={10}
              value={minimumWithdrawalAmount}
              onChange={(e) => setMinimumWithdrawalAmount(parseFloat(e.target.value))}
              required
              className="mt-1 text-xs font-mono"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Minimum available balance required to initiate a withdrawal request.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Maximum Withdrawal Limit (₹)
            </label>
            <Input
              type="number"
              min={100}
              value={maximumWithdrawalAmount}
              onChange={(e) => setMaximumWithdrawalAmount(parseFloat(e.target.value))}
              required
              className="mt-1 text-xs font-mono"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Maximum amount a merchant can withdraw in a single request.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Backend Enforcement</span> — All financial rules are enforced server-side during order earning calculation, settlement hold release, and withdrawal requests.
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving Settings…" : "Save Financial Rules"}
          </Button>
        </div>
      </form>
    </div>
  );
}
