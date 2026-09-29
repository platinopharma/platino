"use client";

import { useMemo } from "react";
import { IndianRupee, Download, ArrowUpRight } from "lucide-react";
import { Btn, Card, PageHeader, Pill, StatCard, downloadCSV, toast } from "@/features/live/ui";
import { SETTLEMENTS, money } from "@/features/live/data";
import { usePharmacyOrders } from "@/hooks/usePharmacyQueries";

export default function PaymentsPage() {
  const { data: apiData } = usePharmacyOrders(100);
  const liveOrders = useMemo(() => apiData?.orders ?? [], [apiData]);

  const paid = liveOrders.filter((o) => ((o.paymentStatus as string) || "").toUpperCase() === "PAID").reduce((a: number, o) => a + ((o.totalAmount as number) || 0), 0);
  const pending = liveOrders.filter((o) => { const s = ((o.paymentStatus as string) || "").toUpperCase(); return s === "UNPAID" || s === "PENDING"; }).reduce((a: number, o) => a + ((o.totalAmount as number) || 0), 0);
  const refunded = liveOrders.filter((o) => ((o.paymentStatus as string) || "").toUpperCase() === "REFUNDED").reduce((a: number, o) => a + ((o.totalAmount as number) || 0), 0);
  const byMethod = liveOrders.reduce((acc: Record<string, number>, o) => {
    const method = (o.paymentMethod as string) || "UNKNOWN";
    acc[method] = (acc[method] || 0) + ((o.totalAmount as number) || 0);
    return acc;
  }, {} as Record<string, number>);
  const total = (Object.values(byMethod) as number[]).reduce((a: number, b: number) => a + b, 0) || 1;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finance"
        title="Payments & settlements"
        description="Track collections across UPI, cards, wallets and COD. Payouts settle T+1 to your linked bank account."
        actions={
          <Btn
            variant="outline" size="sm"
            onClick={() => {
              downloadCSV("settlements.csv", [
                ["ID", "Date", "Method", "Gross", "Fees", "Refunds", "Net", "UTR", "Status"],
                ...SETTLEMENTS.map((s) => [s.id, s.date, s.method, s.gross, s.fees, s.refunds, s.net, s.utr, s.status]),
              ]);
              toast("Statement downloaded");
            }}
          ><Download className="size-3.5" /> Statement</Btn>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Paid" value={money(paid)} delta="↑ 12.4% MoM" tone="signal" />
        <StatCard label="Pending" value={money(pending)} delta="3 orders" tone="warn" />
        <StatCard label="Refunded" value={money(refunded)} delta="1 order" tone="alert" />
        <StatCard label="Next payout" value={money(12168)} delta="Processing" tone="brand" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Payment method mix" className="lg:col-span-1">
          <ul className="space-y-3">
            {(Object.entries(byMethod) as [string, number][]).map(([k, v]) => (
              <li key={k}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-mono uppercase tracking-wider text-ink-muted">{k}</span>
                  <span className="text-ink">{money(v)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/5">
                  <div className="h-full bg-ink" style={{ width: `${(v / total) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Settlements" className="lg:col-span-2" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-paper-alt/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2 text-right">Gross</th>
                  <th className="px-3 py-2 text-right">Fees</th>
                  <th className="px-3 py-2 text-right">Net</th>
                  <th className="px-3 py-2">UTR</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {SETTLEMENTS.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 font-mono text-ink">{s.id}</td>
                    <td className="px-3 py-2 text-ink-muted">{s.date}</td>
                    <td className="px-3 py-2 text-ink-muted">{s.method}</td>
                    <td className="px-3 py-2 text-right text-ink">{money(s.gross)}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{money(s.fees)}</td>
                    <td className="px-3 py-2 text-right font-medium text-ink">{money(s.net)}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-ink-subtle">{s.utr}</td>
                    <td className="px-3 py-2">
                      <Pill tone={s.status === "settled" ? "signal" : s.status === "processing" ? "brand" : "warn"}>{s.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Linked account">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink"><IndianRupee className="size-4" /> HDFC Bank ••4421</div>
            <div className="mt-0.5 font-mono text-[11px] text-ink-subtle">UPI: platinopharma@hdfc · IFSC HDFC0001902</div>
          </div>
          <Btn variant="outline" size="sm" onClick={() => toast("Opening bank settings")}>Manage <ArrowUpRight className="size-3.5" /></Btn>
        </div>
      </Card>
    </div>
  );
}
