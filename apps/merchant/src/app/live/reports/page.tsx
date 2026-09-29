import { Download, FileText } from "lucide-react";
import { Btn, Card, PageHeader } from "@/features/live/ui";

const REPORTS = [
  { name: "Sales report", desc: "Aggregated sales by day, week, month.", updated: "Today · 10:04" },
  { name: "Medicine sales", desc: "Per-SKU quantity and revenue breakdown.", updated: "Today · 09:58" },
  { name: "Inventory report", desc: "Current stock levels, reorder needs, valuation.", updated: "Yesterday · 22:00" },
  { name: "Expiry report", desc: "Batches expiring in next 30 / 60 / 90 days.", updated: "Yesterday · 22:00" },
  { name: "Revenue report", desc: "Gross revenue, refunds and net payouts.", updated: "Yesterday · 22:00" },
  { name: "GST summary", desc: "Tax collected, taxable turnover, HSN-wise.", updated: "1 Jul 2026" },
  { name: "Order report", desc: "All orders with status, timing and rider info.", updated: "Today · 10:04" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Downloads"
        title="Reports"
        description="Generate and export operational reports for accounting, compliance and analysis."
        actions={<Btn size="sm" variant="outline">Custom range</Btn>}
      />

      <Card padded={false}>
        <ul className="divide-y divide-line">
          {REPORTS.map((r) => (
            <li key={r.name} className="flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{r.name}</div>
                <div className="text-[12px] text-ink-muted">{r.desc}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-subtle">Last generated {r.updated}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="outline"><Download className="size-3.5" /> CSV</Btn>
                <Btn size="sm" variant="outline"><Download className="size-3.5" /> Excel</Btn>
                <Btn size="sm"><Download className="size-3.5" /> PDF</Btn>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
