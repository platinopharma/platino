"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft, User, Store, FileText, CreditCard, Truck, MapPin, Package, Check, Clock, Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

import { fromNow, inr } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";

const orders: any[] = [];
const medicines: any[] = [];



function OrderDetail() {
  const { id } = useParams();
  const o = orders.find((x) => x.id === id);
  if (!o) return <div className="py-20 text-center text-muted-foreground">Order not found.</div>;

  const items = medicines.slice(0, o.items);
  const steps = [
    { label: "Order Placed", icon: Package, done: true },
    { label: "Confirmed by Pharmacy", icon: Check, done: o.status !== "pending" },
    { label: "Preparing", icon: Clock, done: ["preparing", "out_for_delivery", "delivered"].includes(o.status) },
    { label: "Out for Delivery", icon: Truck, done: ["out_for_delivery", "delivered"].includes(o.status) },
    { label: "Delivered", icon: MapPin, done: o.status === "delivered" },
  ];

  return (
    <>
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">{o.id}</h1>
        <StatusBadge status={o.status} />
        <StatusBadge status={o.paymentStatus} />
        <span className="ml-auto text-sm text-muted-foreground">Placed {fromNow(o.placedAt)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Delivery Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative space-y-6 pl-7">
                <div className="absolute left-[11px] top-1 h-[calc(100%-1.5rem)] w-px bg-border" />
                {steps.map((s, i) => (
                  <div key={i} className="relative flex items-center gap-3">
                    <span className={`absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full ${s.done ? "bg-success text-success-foreground" : "border-2 border-border bg-card text-muted-foreground"}`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${!s.done && "text-muted-foreground"}`}>{s.label}</div>
                      {s.done && <div className="text-xs text-muted-foreground">{fmtDate(o.placedAt)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Medicines ({items.length})</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {items.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div><div className="font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.manufacturer}</div></div>
                  <div className="font-medium">{inr(m.sellingPrice)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 font-medium">
                <span>Total</span><span className="font-display text-lg">{inr(o.total)}</span>
              </div>
            </CardContent>
          </Card>

          {o.driver && (
            <Card>
              <CardHeader><CardTitle>Driver & Route</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{o.driver[0]}</span>
                <div className="flex-1"><div className="font-medium">{o.driver}</div><div className="text-xs text-muted-foreground">Delivery partner · {o.city}</div></div>
                <Button variant="outline" size="sm"><Phone className="mr-1.5 h-4 w-4" />Contact</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" />Customer</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="font-medium">{o.customer}</div>
              <div className="text-muted-foreground">{o.city}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-4 w-4" />Pharmacy</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="font-medium">{o.pharmacy}</div>
              <div className="text-muted-foreground">{o.city}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={o.paymentStatus} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{inr(o.total)}</span></div>
            </CardContent>
          </Card>
          {o.prescription && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />Prescription</CardTitle></CardHeader>
              <CardContent>
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed bg-muted/30 text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderDetail;
