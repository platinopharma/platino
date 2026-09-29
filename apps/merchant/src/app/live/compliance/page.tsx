"use client";
import { ShieldCheck, AlertTriangle, FileText, Upload } from "lucide-react";
import { Btn, Card, PageHeader, Pill, toast } from "@/features/live/ui";
import { COMPLIANCE, AUDIT_LOGS, type ComplianceItem } from "@/features/live/data";

const TONE: Record<ComplianceItem["status"], "signal" | "warn" | "alert" | "brand"> = {
  ok: "signal", expiring: "warn", expired: "alert", review: "brand",
};
const LABEL: Record<ComplianceItem["status"], string> = {
  ok: "Valid", expiring: "Expiring soon", expired: "Expired", review: "Under review",
};

export default function CompliancePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Regulatory"
        title="Compliance & safety"
        description="Licences, certificates and audit trails required for pharmacy operations. Renew expiring documents before the due date to avoid service disruption."
        actions={<Btn variant="outline" size="sm" onClick={() => toast("Select a document to upload")}><Upload className="size-3.5" /> Upload document</Btn>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Licences & certificates" className="lg:col-span-2" padded={false}>
          <ul className="divide-y divide-line">
            {COMPLIANCE.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                    {c.status === "ok" ? <ShieldCheck className="size-4 text-signal" /> : <AlertTriangle className="size-4 text-warn" />}
                    {c.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-ink-subtle">{c.value}</div>
                </div>
                <div className="text-right">
                  <Pill tone={TONE[c.status]}>{LABEL[c.status]}</Pill>
                  <div className="mt-1 font-mono text-[10px] text-ink-subtle">Exp {c.expires}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="At a glance">
          <ul className="space-y-3 text-[12px]">
            <li className="flex items-center justify-between"><span className="text-ink-muted">Drug licence status</span><Pill tone="signal">Valid</Pill></li>
            <li className="flex items-center justify-between"><span className="text-ink-muted">GST</span><Pill tone="signal">Filed Jun'26</Pill></li>
            <li className="flex items-center justify-between"><span className="text-ink-muted">Rx-linked orders</span><span className="text-ink">62% of total</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-muted">Schedule H/H1 SKUs</span><span className="text-ink">18 tracked</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-muted">Records retention</span><span className="text-ink">24 months</span></li>
            <li className="flex items-center justify-between"><span className="text-ink-muted">Last audit</span><span className="text-ink">2026-05-14</span></li>
          </ul>
        </Card>
      </div>
      <Card title="Audit log" action={<Btn size="sm" variant="ghost" onClick={() => toast("Audit log exported")}><FileText className="size-3.5" /> Export</Btn>} padded={false}>
        <ul className="divide-y divide-line">
          {AUDIT_LOGS.map((a) => (
            <li key={a.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 text-[12px]">
              <span className="font-mono text-[10px] text-ink-subtle">{a.time.replace("T", " ")}</span>
              <div>
                <div className="text-ink">{a.action}</div>
                <div className="text-ink-muted">{a.target}</div>
              </div>
              <span className="font-mono text-[10px] text-ink-subtle">{a.actor}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
