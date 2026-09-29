"use client";
import { useState } from "react";
import { FileSignature, ZoomIn, Check, X, RotateCcw, StickyNote } from "lucide-react";
import { Btn, Card, PageHeader, Pill, SlideOver, toast } from "@/features/live/ui";
import { PRESCRIPTIONS, type Prescription, type RxStatus } from "@/features/live/data";

const TONE: Record<RxStatus, "warn" | "signal" | "alert" | "brand"> = {
  pending: "warn", approved: "signal", rejected: "alert", reupload: "brand",
};

const LABEL: Record<RxStatus, string> = {
  pending: "Pending review", approved: "Approved", rejected: "Rejected", reupload: "Re-upload requested",
};

export default function PrescriptionsPage() {
  const [rows, setRows] = useState<Prescription[]>(PRESCRIPTIONS);
  const [open, setOpen] = useState<Prescription | null>(null);
  const [tab, setTab] = useState<RxStatus | "all">("all");

  const setStatus = (id: string, status: RxStatus) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    setOpen((o) => (o && o.id === id ? { ...o, status } : o));
  };

  const visible = rows.filter((r) => tab === "all" || r.status === tab);
  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    reupload: rows.filter((r) => r.status === "reupload").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Compliance"
        title="Prescription review"
        description="Verify Rx before dispensing. Approved prescriptions are stored with the order for audit."
        actions={<Btn variant="outline" size="sm" onClick={() => toast("Prescription log exported")}><FileSignature className="size-3.5" /> Export log</Btn>}
      />

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {(["all", "pending", "approved", "reupload", "rejected"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-[12px] capitalize ${tab === k ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-muted hover:text-ink"}`}
          >
            {k} <span className={`ml-1 font-mono text-[10px] ${tab === k ? "text-paper/70" : "text-ink-subtle"}`}>{counts[k]}</span>
          </button>
        ))}
      </div>

      <Card padded={false}>
        <ul className="divide-y divide-line">
          {visible.map((r) => (
            <li key={r.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
              <button onClick={() => setOpen(r)} className="grid size-12 shrink-0 place-items-center rounded-md border border-line bg-paper-alt text-ink-subtle hover:text-ink">
                <FileSignature className="size-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate text-[13px] font-medium text-ink">{r.id} · {r.customer}</div>
                  <Pill tone={TONE[r.status]}>{LABEL[r.status]}</Pill>
                </div>
                <div className="mt-0.5 truncate text-[12px] text-ink-muted">{r.doctor} · {r.meds.join(", ")}</div>
                <div className="mt-1 font-mono text-[10px] text-ink-subtle">Order {r.orderId} · {r.uploadedAt.replace("T", " ")}</div>
              </div>
              <Btn size="sm" variant="outline" onClick={() => setOpen(r)}>Review</Btn>
            </li>
          ))}
        </ul>
      </Card>

      <SlideOver open={!!open} onClose={() => setOpen(null)} title={open ? `${open.id} · ${open.customer}` : ""}>
        {open && (
          <div className="space-y-4">
            <div className="grid place-items-center rounded-lg border border-line bg-paper-alt py-16">
              <div className="text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-md border border-line bg-paper text-ink-subtle">
                  <FileSignature className="size-6" />
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-subtle">Prescription scan</div>
              <button onClick={() => toast("Prescription zoomed")} className="mt-2 inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"><ZoomIn className="size-3.5" /> Zoom</button>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-[12px]">
              <div><dt className="text-ink-subtle">Doctor</dt><dd className="text-ink">{open.doctor}</dd></div>
              <div><dt className="text-ink-subtle">Order</dt><dd className="text-ink">{open.orderId}</dd></div>
              <div className="col-span-2"><dt className="text-ink-subtle">Medicines</dt><dd className="text-ink">{open.meds.join(", ")}</dd></div>
              {open.notes && <div className="col-span-2"><dt className="text-ink-subtle">Notes</dt><dd className="text-ink">{open.notes}</dd></div>}
            </dl>
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">
              <Btn size="sm" onClick={() => { setStatus(open.id, "approved"); toast(`${open.id} approved`); }}><Check className="size-3.5" /> Approve</Btn>
              <Btn size="sm" variant="outline" onClick={() => { setStatus(open.id, "reupload"); toast(`Re-upload requested for ${open.id}`, "warn"); }}><RotateCcw className="size-3.5" /> Ask re-upload</Btn>
              <Btn size="sm" variant="outline" onClick={() => { setStatus(open.id, "rejected"); toast(`${open.id} rejected`, "warn"); }}><X className="size-3.5" /> Reject</Btn>
              <Btn size="sm" variant="ghost" onClick={() => { const n = window.prompt("Internal note"); if (n) toast("Note saved to prescription"); }}><StickyNote className="size-3.5" /> Add note</Btn>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
