"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft, Phone, Mail, MapPin, Clock, Navigation, Star, Truck, Package,
  IndianRupee, ShoppingBag, FileText, Calendar, CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AreaTrend } from "@/components/charts";
import { IndiaMap } from "@/components/india-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { inr, num, fmtDate } from "@/lib/format";

import { useAdminPharmacies } from "@/hooks/useAdminDataQueries";
import { useVerificationListQuery } from "@/hooks/useAdminVerificationQueries";

const ordersTrend: any[] = [];
const medicines: any[] = [];

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <Icon className="mb-2 h-5 w-5 text-primary" />
      <div className="font-display text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Profile() {
  const { id } = useParams();
  
  const { data: verifications = [] } = useVerificationListQuery();
  const { data: activeData } = useAdminPharmacies();
  
  const allPharmacies = [...verifications, ...(activeData?.pharmacies || [])];
  const p = allPharmacies.find((x) => x.id === id);
  
  if (!p) return <div className="py-20 text-center text-muted-foreground">Pharmacy not found.</div>;

  const timeline = [
    { label: "Application submitted", date: p.registeredAt, done: true },
    { label: "Documents uploaded", date: p.registeredAt, done: true },
    { label: "Document review", date: p.registeredAt, done: p.verification === "verified" },
    { label: "Verification complete", date: p.registeredAt, done: p.verification === "verified" },
  ];
  const inventory = medicines.slice(0, 6);

  return (
    <>
      <Link href="/pharmacies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to pharmacies
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-semibold text-white" style={{ background: p.avatarColor }}>
          {p.storeName.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">{p.storeName}</h1>
            <StatusBadge status={p.status} />
            <StatusBadge status={p.verification} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{p.ownerName} · {p.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Phone className="mr-1.5 h-4 w-4" />Call</Button>
          <Button variant="outline" size="sm"><Mail className="mr-1.5 h-4 w-4" />Email</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total Revenue" value={inr(p.revenue, true)} icon={IndianRupee} />
        <Stat label="Total Orders" value={num(p.totalOrders)} icon={ShoppingBag} />
        <Stat label="Rating" value={`${p.rating || 0} ★`} icon={Star} />
        <Stat label="Delivery Radius" value={`${p.deliveryRadius || 5} km`} icon={Truck} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Order Performance</CardTitle></CardHeader>
              <CardContent><AreaTrend data={ordersTrend} dataKey="orders" /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[[Phone, p.phone || "N/A"], [Mail, p.email], [MapPin, `${p.city || "Unknown"}, ${p.state || ""}`], [Clock, p.operatingHours || "09:00 AM - 09:00 PM"], [Navigation, `${(p.lat || 0).toFixed(3)}, ${(p.lng || 0).toFixed(3)}`], [Calendar, `Since ${fmtDate(p.registeredAt)}`]].map(([Icon, v]: any, i) => (
                  <div key={i} className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-muted-foreground" /><span>{v}</span></div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-lg bg-muted px-2 py-1 text-xs">License: {p.licenseNo}</span>
                  <span className="rounded-lg bg-muted px-2 py-1 text-xs">GST: {p.gstNo}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Map Location</CardTitle></CardHeader>
            <CardContent><IndiaMap pharmacies={[p]} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Inventory ({inventory.length})</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {inventory.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div><div className="font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.manufacturer} · {m.category}</div></div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">Stock <b className="text-foreground">{m.stock}</b></span>
                    <span>{inr(m.sellingPrice)}</span>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(p.documents || []).map((d: any) => (
              <div key={d.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="flex-1"><div className="text-sm font-medium">{d.type}</div><div className="text-xs text-muted-foreground">{d.status}</div></div>
                {d.verified && <CheckCircle2 className="h-4 w-4 text-success" />}
              </div>
            ))}
            {!(p.documents?.length) && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No documents available</div>}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Verification Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative space-y-6 pl-6">
                <div className="absolute left-[9px] top-1 h-[calc(100%-1rem)] w-px bg-border" />
                {timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <span className={`absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${t.done ? "bg-success" : "bg-muted border-2 border-border"}`}>
                      {t.done && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
                    </span>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{fmtDate(t.date)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default Profile;
