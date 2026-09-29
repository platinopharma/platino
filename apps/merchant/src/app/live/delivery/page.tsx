"use client";
import { useEffect, useState, useMemo } from "react";
import { Phone, Navigation, Camera, Clock } from "lucide-react";
import { Btn, Card, PageHeader, Pill, StatCard, toast } from "@/features/live/ui";
import { money, type Order, type OrderStatus, type PaymentStatus } from "@/features/live/data";
import { usePharmacyOrders, useUpdateOrderStatusMutation } from "@/hooks/usePharmacyQueries";
import { TableLoadingSkeleton } from "@/components/ui/state-displays";

const RIDERS = [
  { name: "Suresh K.", live: 3, done: 12, rating: 4.9, vehicle: "KA 05 MJ 4421" },
  { name: "Manoj P.", live: 2, done: 9, rating: 4.7, vehicle: "KA 03 AH 8820" },
  { name: "Deepak R.", live: 1, done: 15, rating: 4.8, vehicle: "KA 51 CH 1102" },
  { name: "Farhan A.", live: 0, done: 7, rating: 4.6, vehicle: "KA 05 KL 3390" },
];

function mapApiOrder(apiOrder: any): Order & { orderNumber: string } {
  let status = (apiOrder?.orderStatus ?? "pending").toLowerCase();
  if (status === 'placed') status = 'pending';
  
  return {
    id: apiOrder?._id ?? "", 
    orderNumber: apiOrder?.orderNumber ?? "N/A", 
    createdAt: apiOrder?.createdAt ?? "",
    customer: { name: apiOrder?.customerName ?? "Unknown", phone: apiOrder?.customerPhone ?? "" },
    address: apiOrder?.deliveryAddress ?? "",
    items: Array.isArray(apiOrder?.items) ? apiOrder.items.map((it: any) => ({
      name: it?.medicineName ?? "Medicine item",
      qty: Number(it?.quantity ?? 1),
      price: Number(it?.unitPrice ?? 0),
      rx: Boolean(it?.rxRequired)
    })) : [],
    amount: Number(apiOrder?.totalAmount ?? 0),
    payment: apiOrder?.paymentMethod ?? "UPI",
    paymentStatus: (apiOrder?.paymentStatus ?? "unpaid").toLowerCase() as PaymentStatus,
    status: status as OrderStatus,
  };
}

export default function DeliveryPage() {
  const { data: apiData, isLoading } = usePharmacyOrders(100);
  const updateMutation = useUpdateOrderStatusMutation();

  const [overrides, setOverrides] = useState<Record<string, Partial<Order & { orderNumber: string }>>>({});
  
  useEffect(() => {
    setOverrides({});
  }, [apiData]);

  const orders: (Order & { orderNumber: string })[] = useMemo(() => {
    const list = apiData?.orders ?? [];
    return list.map((raw: any) => {
      const mapped = mapApiOrder(raw);
      return { ...mapped, ...(overrides[mapped.id] || {}) };
    });
  }, [apiData, overrides]);

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  
  const active = orders.filter((o) => o.status === "out_for_delivery");
  const ready = orders.filter((o) => o.status === "ready" || o.status === "packed");
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const assign = async (orderId: string) => {
    const rider = assignments[orderId] ?? RIDERS[0].name;
    try {
      await updateMutation.mutateAsync({ id: orderId, action: "status", status: "OUT_FOR_DELIVERY" });
      setOverrides((cur) => ({ ...cur, [orderId]: { ...cur[orderId], status: "out_for_delivery", rider, eta: "20 min" } }));
      toast(`Assigned #${orderId} to ${rider}`);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast(err.message || "Failed to assign rider", "error");
    }
  };

  const markDelivered = async (orderId: string) => {
    try {
      await updateMutation.mutateAsync({ id: orderId, action: "status", status: "DELIVERED" });
      setOverrides((cur) => ({ ...cur, [orderId]: { ...cur[orderId], status: "delivered" } }));
      toast(`Order #${orderId} marked as delivered!`);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast(err.message || "Failed to mark order delivered", "error");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Fulfilment" title="Delivery" description="Assign riders, track live routes and manage proof of delivery." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Live on route" value={active.length.toString()} delta="avg 18 min ETA" tone="brand" />
        <StatCard label="Awaiting pickup" value={ready.length.toString()} delta="assign rider" tone="warn" />
        <StatCard label="Delivered today" value={delivered.toString()} delta="98.4% success" tone="signal" />
        <StatCard label="Active riders" value={RIDERS.filter((r) => r.live > 0).length.toString()} delta={`${RIDERS.length} on shift`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Active deliveries" padded={false}>
          <div className="divide-y divide-line">
            {active.map((o) => (
              <div key={o.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-[12px]">
                <div className="col-span-2 font-mono text-ink-muted">#{o.orderNumber || o.id}</div>
                <div className="col-span-3">
                  <div className="font-medium text-ink">{o.customer.name}</div>
                  <div className="truncate text-[11px] text-ink-subtle">{o.address}</div>
                </div>
                <div className="col-span-2 font-mono text-ink">{money(o.amount)}</div>
                <div className="col-span-2 text-ink-muted">{o.rider ?? "Internal Rider"}</div>
                <div className="col-span-1"><Pill tone="brand"><Clock className="mr-1 size-3" /> {o.eta || "20m"}</Pill></div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Btn size="sm" variant="outline" onClick={() => markDelivered(o.id)}>Deliver</Btn>
                  <a href={`tel:${o.customer.phone.replace(/\s+/g, "")}`} className="grid size-7 place-items-center rounded-md border border-line hover:bg-hover" title="Call" aria-label="Call"><Phone className="size-3" /></a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`} target="_blank" rel="noreferrer" className="grid size-7 place-items-center rounded-md border border-line hover:bg-hover" title="Track" aria-label="Track"><Navigation className="size-3" /></a>
                </div>
              </div>
            ))}
            {active.length === 0 && <div className="px-4 py-8 text-center text-ink-muted">No deliveries in transit.</div>}
          </div>
        </Card>

        <Card title="Riders on shift">
          <ul className="space-y-3">
            {RIDERS.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-full bg-brand/15 font-mono text-[10px] font-semibold text-brand">
                    {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium text-ink">{r.name}</div>
                    <div className="truncate font-mono text-[10px] text-ink-subtle">{r.vehicle} · ★ {r.rating}</div>
                  </div>
                </div>
                <Pill tone={r.live > 0 ? "brand" : "muted"}>{r.live} live</Pill>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Awaiting pickup" padded={false}>
        <div className="divide-y divide-line">
          {ready.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[12px]">
              <div className="min-w-0">
                <div className="font-mono text-ink-muted">#{o.id} · {o.customer.name}</div>
                <div className="truncate text-ink-subtle">{o.address}</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={assignments[o.id] ?? RIDERS[0].name}
                  onChange={(e) => setAssignments((cur) => ({ ...cur, [o.id]: e.target.value }))}
                  className="rounded-md border border-line bg-paper px-2 py-1 text-[11px] text-ink"
                >
                  {RIDERS.map((r) => <option key={r.name}>{r.name}</option>)}
                </select>
                <Btn size="sm" onClick={() => assign(o.id)}>Assign</Btn>
              </div>
            </div>
          ))}
          {ready.length === 0 && <div className="px-4 py-8 text-center text-ink-muted">All packed orders assigned.</div>}
        </div>
      </Card>

      <Card title="Proof of delivery · recent">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {orders.filter((o) => o.status === "delivered").slice(0, 4).map((o) => (
            <div key={o.id} className="rounded-md border border-line">
              <div className="grid h-24 place-items-center rounded-t-md bg-paper-alt text-ink-muted">
                <Camera className="size-5" />
              </div>
              <div className="p-2 text-[11px]">
                <div className="font-mono text-ink-subtle">#{o.id}</div>
                <div className="truncate font-medium text-ink">{o.customer.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
