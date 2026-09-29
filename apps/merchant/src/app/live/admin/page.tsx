"use client";
import { useState } from "react";
import { Megaphone, Search, Building2 } from "lucide-react";
import { Btn, Card, PageHeader, Pill, StatCard, toast } from "@/features/live/ui";
import { PARTNERS, type PartnerRow } from "@/features/live/data";

const TONE: Record<PartnerRow["status"], "signal" | "warn" | "brand" | "alert" | "muted"> = {
  approved: "signal", pending: "warn", review: "brand", suspended: "alert", rejected: "muted",
};

export default function AdminPage() {
  const [rows, setRows] = useState<PartnerRow[]>(PARTNERS);
  const [q, setQ] = useState("");
  const setStatus = (id: string, status: PartnerRow["status"]) =>
    setRows((r) => r.map((p) => (p.id === id ? { ...p, status } : p)));
  const filtered = rows.filter((p) => (p.pharmacy + p.city + p.owner + p.id).toLowerCase().includes(q.toLowerCase()));
  const counts = {
    approved: rows.filter((r) => r.status === "approved").length,
    pending: rows.filter((r) => r.status === "pending" || r.status === "review").length,
    suspended: rows.filter((r) => r.status === "suspended").length,
    volume: rows.reduce((a, r) => a + r.monthlyOrders, 0),
  };
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Platform"
        title="Admin console"
        description="Approve pharmacies, monitor compliance and broadcast announcements across the network."
        actions={
          <Btn size="sm" onClick={() => {
            const msg = window.prompt("Broadcast message to all partner pharmacies");
            if (msg && msg.trim()) toast(`Broadcast sent to ${rows.length} partners`);
          }}><Megaphone className="size-3.5" /> Broadcast</Btn>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active partners" value={String(counts.approved)} delta="↑ 2 this week" tone="signal" />
        <StatCard label="Awaiting review" value={String(counts.pending)} delta="Action needed" tone="warn" />
        <StatCard label="Suspended" value={String(counts.suspended)} delta="Compliance flag" tone="alert" />
        <StatCard label="Monthly orders" value={counts.volume.toLocaleString("en-IN")} delta="Network-wide" tone="brand" />
      </div>
      <Card
        title="Pharmacies"
        padded={false}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="h-8 w-48 rounded-md border border-line bg-paper pl-7 pr-2 text-[12px] outline-none focus:border-ink"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-paper-alt/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-3 py-2">Pharmacy</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2 text-right">Orders / mo</th>
                <th className="px-3 py-2 text-right">Compliance</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid size-8 place-items-center rounded-md bg-paper-alt text-ink-subtle"><Building2 className="size-4" /></div>
                      <div>
                        <div className="font-medium text-ink">{p.pharmacy}</div>
                        <div className="font-mono text-[10px] text-ink-subtle">{p.id} · {p.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{p.owner}</td>
                  <td className="px-3 py-3 text-ink-muted">{p.submittedAt}</td>
                  <td className="px-3 py-3 text-right text-ink">{p.monthlyOrders.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-3 text-right">
                    <span className={p.compliance >= 90 ? "text-signal" : p.compliance >= 70 ? "text-warn" : "text-alert"}>{p.compliance}%</span>
                  </td>
                  <td className="px-3 py-3"><Pill tone={TONE[p.status]}>{p.status}</Pill></td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {p.status !== "approved" && <Btn size="sm" onClick={() => setStatus(p.id, "approved")}>Approve</Btn>}
                      {p.status === "approved" && <Btn size="sm" variant="outline" onClick={() => setStatus(p.id, "suspended")}>Suspend</Btn>}
                      {p.status === "pending" && <Btn size="sm" variant="outline" onClick={() => setStatus(p.id, "rejected")}>Reject</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
