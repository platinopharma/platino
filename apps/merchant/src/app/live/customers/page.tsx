"use client";
import { useMemo, useState } from "react";
import { Search, Phone, MapPin, Star, FileText } from "lucide-react";
import { Btn, Card, PageHeader, SlideOver, StatCard, Pill, toast } from "@/features/live/ui";
import { money, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/features/live/data";
import { usePharmacyOrders } from "@/hooks/usePharmacyQueries";
import { TableLoadingSkeleton, TableEmptyState } from "@/components/ui/state-displays";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  lastOrder: string;
  rating: number;
  rxHistory: number;
  address: string;
};

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<CustomerRow | null>(null);

  const { data: apiData, isLoading } = usePharmacyOrders(100);
  const liveOrders = useMemo(() => apiData?.orders ?? [], [apiData]);

  const customerRows: CustomerRow[] = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    liveOrders.forEach((o) => {
      const phone = (o.customerPhone as string) || "N/A";
      const existing = map.get(phone) ?? {
        id: (o._id as string) || phone,
        name: (o.customerName as string) || "Unknown Customer",
        phone,
        orders: 0,
        spent: 0,
        lastOrder: (o.createdAt as string) || "",
        rating: 4.8, // Mock rating as it's not in order schema
        rxHistory: 0,
        address: (o.deliveryAddress as string) || "",
      };

      existing.orders += 1;
      if (o.orderStatus !== "CANCELLED" && o.orderStatus !== "REJECTED") {
        existing.spent += (o.totalAmount as number) || 0;
      }
      if (o.prescriptionUrl || ((o.items as any[]) && (o.items as any[]).some((it: any) => it.rxRequired))) {
        existing.rxHistory += 1;
      }
      
      // Keep most recent address/date
      if (new Date((o.createdAt as string) || 0) > new Date(existing.lastOrder || 0)) {
        existing.lastOrder = (o.createdAt as string) || "";
        existing.address = (o.deliveryAddress as string) || "";
      }

      map.set(phone, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [liveOrders]);

  const rows = useMemo(() =>
    customerRows.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)),
  [q, customerRows]);

  const totalCustomers = customerRows.length;
  const totalSpent = customerRows.reduce((a, c) => a + c.spent, 0);
  const repeat = customerRows.filter((c) => c.orders > 1).length;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="People" title="Customers" description="Every customer who has ordered from this pharmacy." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total customers" value={totalCustomers.toString()} />
        <StatCard label="Repeat buyers" value={repeat.toString()} delta={`${Math.round((repeat / totalCustomers) * 100)}% of base`} tone="signal" />
        <StatCard label="Lifetime spend" value={money(totalSpent)} delta="+18% MoM" tone="signal" />
        <StatCard label="Avg. rating" value="4.7" delta="128 reviews" tone="brand" />
      </div>

      <label className="flex items-center gap-2 rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] focus-within:border-brand">
        <Search className="size-3.5 text-ink-subtle" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer name or phone…" className="flex-1 bg-transparent text-ink focus:outline-none" />
      </label>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-paper-alt/60 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">
              <tr>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Orders</th>
                <th className="px-3 py-2.5">Total spent</th>
                <th className="px-3 py-2.5">Last order</th>
                <th className="px-3 py-2.5">Rating</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/15 font-mono text-[10px] font-semibold text-brand">
                        {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink">{c.name}</div>
                        <div className="truncate font-mono text-[10px] text-ink-subtle">{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-ink">{c.orders}</td>
                  <td className="px-3 py-3 font-mono text-ink">{money(c.spent)}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-ink-muted">{c.lastOrder.slice(0, 10)}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 text-ink"><Star className="size-3 fill-warn text-warn" /> {c.rating.toFixed(1)}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Btn size="sm" variant="outline" onClick={() => setSel(c)}>View</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SlideOver open={!!sel} onClose={() => setSel(null)} title={sel?.name ?? ""} width="max-w-xl">
        {sel && <CustomerDetail c={sel} liveOrders={liveOrders as unknown as BackendOrder[]} />}
      </SlideOver>
    </div>
  );
}

type BackendOrder = { _id?: string; orderNumber?: string; customerPhone?: string; orderStatus?: string; totalAmount?: number; createdAt?: string; deliveryAddress?: string; items?: any[]; prescriptionUrl?: string; [key: string]: unknown };

function CustomerDetail({ c, liveOrders }: { c: CustomerRow, liveOrders: BackendOrder[] }) {
  const orders = liveOrders.filter((o) => o.customerPhone === c.phone);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-brand/15 font-mono text-[13px] font-semibold text-brand">
          {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div className="font-display text-xl text-ink">{c.name}</div>
          <div className="font-mono text-[11px] text-ink-subtle">{c.phone}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card padded={false} className="p-3"><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Orders</div><div className="mt-1 font-display text-xl text-ink">{c.orders}</div></Card>
        <Card padded={false} className="p-3"><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Spent</div><div className="mt-1 font-display text-xl text-ink">{money(c.spent)}</div></Card>
        <Card padded={false} className="p-3"><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Rx history</div><div className="mt-1 font-display text-xl text-ink">{c.rxHistory}</div></Card>
      </div>

      <div className="rounded-lg border border-line p-3 text-[12px] text-ink-muted">
        <div className="mb-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle"><MapPin className="size-3" /> Address</div>
        {c.address}
        <div className="mt-2 flex gap-2">
          <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-paper px-2.5 text-[12px] font-medium text-ink hover:bg-hover"><Phone className="size-3.5" /> Call</a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-paper px-2.5 text-[12px] font-medium text-ink hover:bg-hover"><MapPin className="size-3.5" /> Map</a>
          <Btn size="sm" variant="ghost" onClick={() => toast(`Loyalty offer sent to ${c.name}`)}>Send offer</Btn>
        </div>
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Order history</div>
        <div className="divide-y divide-line rounded-lg border border-line">
          {orders.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            const firstName = items[0]?.medicineName || "Unknown";
            const amount = Number(o.totalAmount || 0);
            const status = ((o.orderStatus as string) || "pending").toLowerCase();
            return (
              <div key={o._id as string} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[12px]">
                <div className="min-w-0">
                  <div className="font-mono text-ink-muted">#{(o.orderNumber as string) || (o._id as string)}</div>
                  <div className="truncate text-ink">{firstName}{items.length > 1 && <span className="text-ink-subtle"> +{items.length - 1}</span>}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {o.prescriptionUrl && <FileText className="size-3.5 text-brand" />}
                  <span className="font-mono text-ink">{money(amount)}</span>
                  <Pill tone={ORDER_STATUS_TONE[status as keyof typeof ORDER_STATUS_TONE] || "muted"}>{ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL] || (o.orderStatus as string)}</Pill>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
