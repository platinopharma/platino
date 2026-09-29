"use client";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, Phone, Navigation, Printer, FileText, Download, X, RefreshCcw, Package, PhoneCall, Headphones, MapPin, CheckCircle, PackageCheck, Truck, ShieldAlert, Siren, Zap, AlertCircle } from "lucide-react";
import { TableLoadingSkeleton, TableEmptyState } from "@/components/ui/state-displays";
import { socketManager } from "@/lib/socket";
import {
  Btn,
  Card,
  Confirm,
  IconBtn,
  PageHeader,
  Pill,
  SlideOver,
  downloadCSV,
  toast,
} from "@/features/live/ui";
import { SupportChatDrawer } from "@/features/live/ui/SupportChatDrawer";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  money,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/features/live/data";
import { usePharmacyOrders, useUpdateOrderStatusMutation } from "@/hooks/usePharmacyQueries";

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "packed", label: "Packed" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function mapApiOrder(apiOrder: any): Order & { orderNumber: string } {
  let status = (apiOrder?.orderStatus ?? "pending").toLowerCase();
  if (status === 'placed' || status === 'draft') status = 'pending';

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
    isEmergency: apiOrder?.isEmergency ?? false,
    emergencyNotes: apiOrder?.emergencyNotes ?? "",
    priorityLevel: apiOrder?.priorityLevel ?? "NORMAL"
  };
}

export default function OrdersPage() {
  const { data: apiData, isLoading, refetch } = usePharmacyOrders(100);
  const updateMutation = useUpdateOrderStatusMutation();
  const [overrides, setOverrides] = useState<Record<string, Partial<Order & { orderNumber: string }>>>({});
  const [activeSupportOrder, setActiveSupportOrder] = useState<Order & { orderNumber: string } | null>(null);

  // Real-time WebSocket sync
  useEffect(() => {
    const socket = socketManager.connect();

    const joinStore = () => {
      try {
        const token = window.localStorage.getItem("platino_merchant_token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const pharmacyId = payload.pharmacyId || payload.storeId || payload.id;
          if (pharmacyId) {
            socket.emit("join_store_room", { pharmacyId });
          }
        }
      } catch (e) {
        console.warn("Failed to join store room from token");
      }
    };

    joinStore();
    socket.on("connect", joinStore);

    const handleSync = (data: { orderId: string; status: OrderStatus }) => {
      console.log("[MerchantSocket] Received status change:", data);
      if (data && data.orderId && data.status) {
        const nextStatus = data.status;
        setOverrides((cur) => ({
          ...cur,
          [data.orderId]: { ...cur[data.orderId], status: nextStatus },
        }));
        toast(`Order updated to ${ORDER_STATUS_LABEL[nextStatus] || nextStatus}`, "info");
      }
    };

    socket.on("order_status_updated", handleSync);

    return () => {
      socket.off("connect", joinStore);
      socket.off("order_status_updated", handleSync);
      // Let the socket manager handle disconnection if needed, or leave room
      try {
        const token = window.localStorage.getItem("platino_merchant_token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const pharmacyId = payload.pharmacyId || payload.storeId || payload.id;
          if (pharmacyId) {
            socket.emit("leave_store_room", { pharmacyId });
          }
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    setOverrides({});
  }, [apiData]);

  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const orders: (Order & { orderNumber: string })[] = useMemo(() => {
    const list = apiData?.orders ?? [];
    return list.map((raw: any) => {
      const mapped = mapApiOrder(raw);
      const override = overrides[mapped.id] || {};
      return { ...mapped, ...override };
    });
  }, [apiData, overrides]);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId]);
  const refunding = useMemo(() => orders.find((o) => o.id === refundingId) ?? null, [orders, refundingId]);
  const rejecting = useMemo(() => orders.find((o) => o.id === rejectingId) ?? null, [orders, rejectingId]);

  const rows = useMemo(() => {
    return orders.filter((o) => (filter === "all" ? true : o.status === filter)).filter(
      (o) =>
        !q ||
        o.orderNumber.toLowerCase().includes(q.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(q.toLowerCase()) ||
        o.items.some((it) => it.name.toLowerCase().includes(q.toLowerCase())),
    );
  }, [filter, q, orders]);

  function toggle(id: string) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  }

  const patchOrder = (id: string, p: Partial<Order>) =>
    setOverrides((cur) => ({ ...cur, [id]: { ...cur[id], ...p } }));

  const bulk = async (status: string, label: string) => {
    toast(`Processing ${checked.size} order(s)...`);
    for (const id of Array.from(checked)) {
      try {
        const action = status === "accepted" ? "accept" : "status";
        await updateMutation.mutateAsync({ id, action, status: status.toUpperCase() });
        patchOrder(id, { status: status as OrderStatus });
      } catch (e) {
        console.error(e);
      }
    }
    toast(`${checked.size} order${checked.size > 1 ? "s" : ""} marked ${label}`);
    setChecked(new Set());
  };

  const exportCSV = () => {
    downloadCSV("orders.csv", [
      ["OrderNumber", "Customer", "Phone", "Address", "Items", "Amount", "Payment", "Status", "Placed"],
      ...rows.map((o) => [o.orderNumber, o.customer.name, o.customer.phone, o.address, o.items.map((i) => `${i.qty}× ${i.name}`).join(" | "), o.amount, `${o.payment}/${o.paymentStatus}`, o.status, o.createdAt]),
    ]);
    toast("Exported orders.csv");
  };

  return (
    <div className="space-y-5 bg-background text-foreground min-h-[90vh] p-4 sm:p-6 rounded-2xl border border-border">
      <PageHeader
        eyebrow="Orders"
        title="Order management"
        description="Search, filter and process every order from pending through delivered."
        actions={
          <>
            <Btn variant="outline" size="sm" onClick={() => refetch()} className="border-border text-muted-foreground hover:bg-muted"><RefreshCcw className="size-3.5" /> Refresh</Btn>
            <Btn variant="outline" size="sm" onClick={exportCSV} className="border-border text-muted-foreground hover:bg-muted"><Download className="size-3.5" /> Export</Btn>
            <Btn size="sm" onClick={() => window.print()} className="bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800"><Printer className="size-3.5" /> Print invoices</Btn>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[220px] items-center gap-2 rounded-md border border-input bg-card px-2.5 py-2 text-[12px] focus-within:border-primary">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order ID, customer or medicine…"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
        <Btn variant="outline" size="sm" className="border-border text-muted-foreground"><Filter className="size-3.5" /> More filters</Btn>
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const n = f.key === "all" ? orders.length : orders.filter((o) => o.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-md border px-3 py-1.5 text-[12px] transition-colors ${active ? "border-primary bg-primary/20 text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
            >
              {f.label} <span className={`ml-1 font-mono text-[10px] ${active ? "text-emerald-400" : "text-gray-600"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {checked.size > 0 && (
        <div className="flex flex-col gap-2.5 rounded-md border border-emerald-800/40 bg-emerald-950/20 px-3.5 py-2.5 text-[12px] text-emerald-100 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">{checked.size} selected</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Btn size="sm" variant="outline" onClick={() => bulk("accepted", "accepted")} className="border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-200">Accept</Btn>
            <Btn size="sm" variant="outline" onClick={() => bulk("preparing", "preparing")} className="border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-200">Preparing</Btn>
            <Btn size="sm" variant="outline" onClick={() => bulk("packed", "packed")} className="border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-200">Packed</Btn>
            <Btn size="sm" variant="outline" onClick={() => bulk("out_for_delivery", "out for delivery")} className="border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-200">Out for delivery</Btn>
            <Btn size="sm" variant="outline" onClick={() => bulk("delivered", "delivered")} className="border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-200">Delivered</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setChecked(new Set())} className="text-gray-400 hover:text-gray-200">Clear</Btn>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-background text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all orders on page"
                    onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                    className="rounded border-gray-600 bg-transparent"
                  />
                </th>
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right sticky right-0 bg-background shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <TableLoadingSkeleton rows={6} colSpan={8} />}
              {!isLoading && rows.length === 0 && (
                <TableEmptyState
                  colSpan={8}
                  icon={Package}
                  title="No orders found"
                  description="No orders currently match your applied search filter or status tab."
                />
              )}
              {rows.map((o) => {
                const isFinal = o.status === 'delivered' || o.status === 'cancelled' || o.status === 'rejected';
                return (
                  <tr key={o.id} className={cn("transition-colors", o.isEmergency ? "border-red-600/60 bg-red-950/20 text-red-200 hover:bg-red-950/30 border-l-4 border-l-red-600" : "hover:bg-muted/50 border-b border-border")}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select order ${o.orderNumber}`}
                        checked={checked.has(o.id)}
                        onChange={() => toggle(o.id)}
                        className="rounded border-gray-600 bg-transparent"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => setSelectedId(o.id)} className="font-mono text-primary hover:text-primary/80 font-semibold">{o.orderNumber}</button>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className={cn("font-medium", o.isEmergency ? "text-red-200" : "text-foreground")}>{o.customer.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{o.customer.phone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="max-w-[200px] truncate text-foreground" title={o.items.map(i => `${i.name} (x${i.qty})`).join(", ")}>
                        {o.items[0]?.name || "Unknown"}
                        {o.items.length > 1 && <span className="text-muted-foreground"> +{o.items.length - 1}</span>}
                      </div>
                      {(o.prescriptionUrl || o.items.some(i => i.rx)) && (
                        <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-emerald-500">
                          <FileText className="size-3" /> Rx attached
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="uppercase text-gray-400 font-medium mb-1">{o.payment}</div>
                      <Pill tone={o.paymentStatus === "paid" ? "signal" : o.paymentStatus === "failed" ? "alert" : "pending_amber"}>
                        {o.paymentStatus}
                      </Pill>
                    </td>
                    <td className="px-3 py-3 font-mono text-gray-200 font-semibold">
                      {o.isEmergency ? (
                        <span className="text-red-300 text-[11px] font-sans">₹0 (Emergency Waiver)</span>
                      ) : (
                        money(o.amount)
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <Pill tone={
                          o.status === 'accepted' || o.status === 'preparing' ? 'accepted' :
                            o.status === 'delivered' ? 'delivered' :
                              o.status === 'pending' ? 'pending_amber' :
                                ORDER_STATUS_TONE[o.status] || "muted"
                        }>
                          {ORDER_STATUS_LABEL[o.status] || o.status}
                        </Pill>
                        {o.isEmergency && (
                          <div className="inline-flex items-center gap-1 bg-red-950/60 text-red-400 border border-red-700/60 rounded-full px-2.5 py-0.5 text-xs font-bold animate-pulse mt-1">
                            <Siren className="size-3" /> [ CRITICAL SOS ]
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 sticky right-0 bg-background shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-end gap-1.5">
                        {nextStatus(o.status) && (
                          <button
                            onClick={() => {
                              const next = nextStatus(o.status);
                              if (!next) return;
                              const action = next === 'accepted' ? 'accept' : 'status';
                              updateMutation.mutateAsync({ id: o.id, action, status: next.toUpperCase() })
                                .then(() => {
                                  patchOrder(o.id, { status: next });
                                  toast(`Advanced ${o.orderNumber} → ${ORDER_STATUS_LABEL[next]}`);
                                })
                                .catch((e: any) => toast(e.message || "Failed to update order", "error"));
                            }}
                            className={cn("border transition-colors flex items-center gap-1", o.isEmergency ? "bg-red-700 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs border-red-600" : "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border-emerald-700/60 rounded-lg px-3 py-1.5 text-[11px] font-semibold")}
                          >
                            {o.isEmergency ? <Zap className="size-3.5" /> : "→"}
                            {o.isEmergency ? "Priority Dispatch" : ORDER_STATUS_LABEL[nextStatus(o.status)!]}
                          </button>
                        )}
                        <a
                          href={`tel:${o.customer.phone.replace(/\s+/g, "")}`}
                          title="Call customer"
                          className="grid size-7 place-items-center rounded-lg border border-zinc-700/50 bg-zinc-900 text-gray-400 hover:text-gray-200 hover:bg-zinc-800 transition-colors"
                        ><PhoneCall className="size-3.5" /></a>
                        <button
                          onClick={() => setActiveSupportOrder(o)}
                          title="Contact Support"
                          className="grid size-7 place-items-center rounded-lg border border-zinc-700/50 bg-zinc-900 text-gray-400 hover:text-gray-200 hover:bg-zinc-800 transition-colors"
                        ><Headphones className="size-3.5" /></button>
                        <button
                          title="Print invoice"
                          onClick={() => { window.print(); toast(`Printing invoice ${o.orderNumber}`); }}
                          className="grid size-7 place-items-center rounded-lg border border-zinc-700/50 bg-zinc-900 text-gray-400 hover:text-gray-200 hover:bg-zinc-800 transition-colors"
                        ><Printer className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver open={!!selected} onClose={() => setSelectedId(null)} title={selected ? `Order ${selected.orderNumber}` : ""} width="max-w-xl">
        {selected && (
          <OrderDetailDrawer
            order={selected}
            onAdvance={async () => {
              const next = nextStatus(selected.status);
              if (!next) { toast("Order already at final state", "warn"); return; }
              const action = next === 'accepted' ? 'accept' : 'status';
              try {
                await updateMutation.mutateAsync({ id: selected.id, action, status: next.toUpperCase() });
                patchOrder(selected.id, { status: next });
                toast(`Advanced ${selected.orderNumber} → ${ORDER_STATUS_LABEL[next]}`);
              } catch (e: unknown) {
                const err = e instanceof Error ? e : new Error(String(e));
                toast(err.message || "Failed to update order", "error");
              }
            }}
            onRefund={() => setRefundingId(selected.id)}
            onReject={() => setRejectingId(selected.id)}
          />
        )}
      </SlideOver>

      <Confirm
        open={!!refunding}
        title="Issue refund?"
        message={refunding ? `Refund ${money(refunding.amount)} to ${refunding.customer.name} for ${refunding.orderNumber}?` : ""}
        confirmLabel="Refund"
        tone="alert"
        onCancel={() => setRefundingId(null)}
        onConfirm={() => {
          if (refunding) {
            patchOrder(refunding.id, { paymentStatus: "refunded", status: "refund_requested" });
            toast(`Refund of ${money(refunding.amount)} initiated`);
          }
          setRefundingId(null);
        }}
      />

      <Confirm
        open={!!rejecting}
        title="Reject order?"
        message={rejecting ? `Are you sure you want to reject order ${rejecting.orderNumber} from ${rejecting.customer.name}? This cannot be undone.` : ""}
        confirmLabel="Reject Order"
        tone="alert"
        onCancel={() => setRejectingId(null)}
        onConfirm={async () => {
          if (rejecting) {
            try {
              await updateMutation.mutateAsync({ id: rejecting.id, action: "reject", reason: "Rejected by pharmacy via dashboard" });
              patchOrder(rejecting.id, { status: "rejected" });
              toast(`${rejecting.orderNumber} rejected`, "warn");
            } catch (e: unknown) {
              const err = e instanceof Error ? e : new Error(String(e));
              toast(err.message || "Failed to reject order", "error");
            }
          }
          setRejectingId(null);
        }}
      />

      <SupportChatDrawer
        open={!!activeSupportOrder}
        onClose={() => setActiveSupportOrder(null)}
        order={activeSupportOrder}
      />
    </div>
  );
}

const TIMELINE: OrderStatus[] = ["pending", "accepted", "preparing", "packed", "out_for_delivery", "delivered"];

function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = TIMELINE.indexOf(s);
  if (i < 0 || i === TIMELINE.length - 1) return null;
  return TIMELINE[i + 1];
}

function OrderDetailDrawer({ order, onAdvance, onRefund, onReject }: { order: Order & { orderNumber: string }; onAdvance: () => void; onRefund: () => void; onReject: () => void }) {
  const currentIdx = TIMELINE.indexOf(order.status);
  const finalState = currentIdx === TIMELINE.length - 1 || order.status === "cancelled" || order.status === "rejected" || order.status === "refund_requested";

  return (
    <div className="space-y-6 bg-[#05110A] text-white p-2">
      {order.isEmergency && (
        <div className="bg-red-950/40 border border-red-700/50 rounded-lg p-4 -mt-2">
          <div className="flex items-center gap-2 text-red-400 font-bold mb-3 text-sm">
            <Siren className="size-5" /> CRITICAL MEDICAL EMERGENCY ORDER
          </div>
          <p className="text-red-200/80 text-xs mb-4">{order.emergencyCategory || order.emergencyNotes || "High priority emergency dispatch requested."}</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-red-700/50">
              <PhoneCall className="size-3.5" /> Direct Call Customer
            </button>
            <button className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg">
              <Truck className="size-3.5" /> Assign Emergency Rider
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#122B1C] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">#{order.orderNumber}</h2>
          <div className="font-mono text-[11px] text-gray-400">Created {new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <Pill tone={
          order.status === 'accepted' || order.status === 'preparing' ? 'accepted' :
            order.status === 'delivered' ? 'delivered' :
              order.status === 'pending' ? 'pending_amber' :
                ORDER_STATUS_TONE[order.status] || "muted"
        }>
          {ORDER_STATUS_LABEL[order.status] || order.status}
        </Pill>
      </div>

      {/* Item Breakdown */}
      <div className="rounded-xl border border-[#122B1C] bg-[#030B06] overflow-hidden">
        <div className="bg-[#05110A] px-4 py-2 border-b border-[#122B1C] font-mono text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
          Prescription & Items
        </div>
        <ul className="divide-y divide-[#122B1C]">
          {order.items.map((it, idx) => (
            <li key={idx} className="flex items-center justify-between p-4 text-[13px]">
              <div>
                <div className="font-semibold text-gray-200">{it.name}</div>
                <div className="font-mono text-[11px] text-gray-500 mt-1">Qty {it.qty} &times; {money(it.price)} {it.rx && <span className="text-emerald-500 bg-emerald-950/40 px-1 py-0.5 rounded ml-1">Rx Required</span>}</div>
              </div>
              <div className="font-mono font-medium text-emerald-400">{money(it.qty * it.price)}</div>
            </li>
          ))}
        </ul>
        <div className="px-4 py-3 bg-[#05110A] border-t border-[#122B1C] flex justify-between items-center">
          <div className="text-[12px] text-gray-400">Total Amount ({order.payment.toUpperCase()})</div>
          <div className="text-lg font-bold text-white">{money(order.amount)}</div>
        </div>
      </div>

      {/* Rider & Logistics Tracking */}
      <div className="rounded-xl border border-[#122B1C] bg-[#030B06] overflow-hidden p-4">
        <div className="flex items-center gap-2 text-gray-300 font-medium mb-4 text-sm">
          <Truck className="size-4 text-emerald-500" />
          Logistics & Delivery
        </div>

        {order.status === 'out_for_delivery' || order.status === 'delivered' ? (
          <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-3">
            <div>
              <div className="text-[13px] font-semibold text-emerald-300">Rider Assigned</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Delivery in progress</div>
            </div>
            <button className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
              <MapPin className="size-3.5" /> Track Rider
            </button>
          </div>
        ) : (
          <div className="text-[12px] text-gray-500 bg-[#05110A] p-3 rounded-lg border border-[#122B1C] flex items-center gap-2">
            <Clock className="size-4 text-amber-500" />
            Waiting for order to be packed to assign rider.
          </div>
        )}
      </div>

      {/* Merchant Support / Quick Actions */}
      <div className="rounded-xl border border-red-950/50 bg-red-950/10 p-4">
        <div className="flex items-center gap-2 text-red-400 font-medium mb-3 text-sm">
          <ShieldAlert className="size-4" /> Need help with this order?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button className="text-left bg-[#05110A] border border-[#122B1C] hover:border-red-900/50 p-2.5 rounded-lg text-[12px] text-gray-300 transition-colors">
            Item Out of Stock
          </button>
          <button className="text-left bg-[#05110A] border border-[#122B1C] hover:border-red-900/50 p-2.5 rounded-lg text-[12px] text-gray-300 transition-colors">
            Rider Delayed
          </button>
          <button
            onClick={() => window.open(`/live/support?orderId=${order.id}`, '_blank')}
            className="sm:col-span-2 text-left bg-zinc-900 border border-zinc-700 hover:border-zinc-500 p-2.5 rounded-lg text-[12px] text-white flex items-center gap-2 transition-colors"
          >
            <Headphones className="size-4" /> Contact Support Console
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex gap-2 justify-end">
        {order.status === "pending" && <Btn variant="ghost" onClick={onReject} className="text-red-400 hover:text-red-300 hover:bg-red-950/30"><X className="size-3.5" /> Reject</Btn>}
        <Btn variant="ghost" onClick={onRefund} disabled={order.paymentStatus === "refunded"} className="text-gray-400 hover:text-white">Refund</Btn>
        <Btn onClick={onAdvance} disabled={finalState} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg">
          {finalState ? "Final state" : `Advance → ${ORDER_STATUS_LABEL[nextStatus(order.status)!] ?? "next"}`}
        </Btn>
      </div>
    </div>
  );
}

function Clock(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  );
}
