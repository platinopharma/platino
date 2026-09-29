"use client";
import { ShieldCheck, FileText, Download, Eye, RefreshCw } from "lucide-react";
import { Btn, Card, PageHeader, Pill, toast } from "@/features/live/ui";

const DOCS = [
  { name: "Drug License (Retail)", ref: "KA-B21-20241105", status: "verified", expires: "Nov 2027" },
  { name: "GST Certificate", ref: "29ABCDE1234F1Z5", status: "verified", expires: "—" },
  { name: "PAN Card", ref: "ABCDE1234F", status: "verified", expires: "—" },
  { name: "Pharmacist Registration", ref: "KSPC-49820", status: "verified", expires: "Mar 2028" },
  { name: "Shop Establishment", ref: "BBMP/E/2024/44120", status: "pending", expires: "—" },
];

const TIMELINE = [
  { t: "Application submitted", d: "12 Jun 2026", done: true },
  { t: "Documents received", d: "12 Jun 2026", done: true },
  { t: "Compliance review", d: "13 Jun 2026", done: true },
  { t: "Field verification", d: "15 Jun 2026", done: true },
  { t: "Store approved · live", d: "16 Jun 2026", done: true },
];

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Compliance"
        title="Profile & verification"
        description="Your registered business information, compliance documents and verification history."
        actions={<Pill tone="signal"><ShieldCheck className="mr-1 size-3" /> Verified partner</Pill>}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Business details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Legal name" value="Platino Retail Pvt Ltd" />
            <Info label="Trade name" value="Platino Pharma — Indiranagar" />
            <Info label="Registered address" value="12 Rosewood Apts, Indiranagar, Bengaluru 560038" />
            <Info label="Store type" value="Retail pharmacy · 24×7" />
            <Info label="Owner" value="Meera Kulkarni" />
            <Info label="Owner contact" value="+91 96329 88712" />
            <Info label="Pharmacist in charge" value="R. Iyer (KSPC-49820)" />
            <Info label="Store area" value="820 sq. ft." />
          </div>
        </Card>

        <Card title="Verification timeline">
          <ol className="space-y-3">
            {TIMELINE.map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className={`mt-1 size-2 shrink-0 rounded-full ${t.done ? "bg-signal" : "bg-ink/20"}`} />
                <div>
                  <div className="text-[12px] font-medium text-ink">{t.t}</div>
                  <div className="font-mono text-[10px] text-ink-subtle">{t.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card title="Uploaded documents" padded={false}>
        <ul className="divide-y divide-line">
          {DOCS.map((d) => (
            <li key={d.name} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-ink">{d.name}</div>
                <div className="font-mono text-[10px] text-ink-subtle">Ref {d.ref} · Expires {d.expires}</div>
              </div>
              <Pill tone={d.status === "verified" ? "signal" : "warn"}>{d.status}</Pill>
              <div className="flex gap-1">
                <Btn size="sm" variant="outline" onClick={() => toast(`Previewing ${d.name}`)}><Eye className="size-3.5" /> Preview</Btn>
                <Btn size="sm" variant="outline" onClick={() => toast(`Downloading ${d.name}`)}><Download className="size-3.5" /> Download</Btn>
                <Btn size="sm" variant="ghost" onClick={() => toast(`Upload a new ${d.name}`)}><RefreshCw className="size-3.5" /> Replace</Btn>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">{label}</div>
      <div className="mt-1 text-[13px] text-ink">{value}</div>
    </div>
  );
}
