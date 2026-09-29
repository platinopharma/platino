"use client";

import Link from "next/link";
import { useState } from "react";

import { Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { IndiaMap } from "@/components/india-map";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminPharmacies } from "@/hooks/useAdminDataQueries";
import { cn } from "@/lib/utils";



function NetworkMap() {
  const { data, isLoading: loading } = useAdminPharmacies();
  const ALL = data?.pharmacies || [];

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = ALL
    .filter((p) => (filter ? p.verification === filter || p.status === filter : true))
    .filter((p) => `${p.storeName} ${p.city}`.toLowerCase().includes(q.toLowerCase()));

  const legend = [
    { key: "verified", label: "Verified", cls: "bg-success" },
    { key: "pending", label: "Pending", cls: "bg-warning" },
    { key: "offline", label: "Offline", cls: "bg-muted-foreground" },
    { key: "suspended", label: "Suspended", cls: "bg-destructive" },
  ];

  return (
    <>
      <PageHeader title="Network Map" subtitle="Pharmacy distribution across India — click a marker to open its profile." />
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {legend.map((l) => (
                <button key={l.key} onClick={() => setFilter(filter === l.key ? null : l.key)}
                  className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors", filter === l.key ? "border-primary bg-primary/5" : "hover:bg-muted")}>
                  <span className={cn("h-2 w-2 rounded-full", l.cls)} />{l.label}
                </button>
              ))}
            </div>
            <IndiaMap pharmacies={filtered} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search map locations" className="pl-9" />
            </div>
            <div className="max-h-[440px] space-y-1 overflow-y-auto">
              {filtered.map((p) => (
                <Link key={p.id} href={`/pharmacies/${p.id }`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold text-white" style={{ background: p.avatarColor }}>{p.storeName.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{p.storeName}</div><div className="text-xs text-muted-foreground">{p.city}</div></div>
                  <StatusBadge status={p.verification} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default NetworkMap;
