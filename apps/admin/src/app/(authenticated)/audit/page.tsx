"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, ScrollText, SearchX } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import { useSimulatedLoading } from "@/hooks/use-loading";
import { fromNow, initials } from "@/lib/format";

const ALL: any[] = [];


function Audit() {
  const [q, setQ] = useState("");
  const loading = useSimulatedLoading(600, []);
  const items = ALL.filter((l) => `${l.admin} ${l.action} ${l.target} ${l.ip}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const isEmpty = !loading && items.length === 0;

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Every action performed by every admin, fully traceable."
        actions={<Button variant="outline" onClick={() => toast.success("Audit log exported")}><Download className="mr-2 h-4 w-4" />Export</Button>} />
      <div className="relative sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search admin, action, IP…" aria-label="Search audit logs" className="pl-9" />
      </div>
      <Card className="overflow-hidden p-0">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : isEmpty ? (
          <EmptyState
            icon={q ? SearchX : ScrollText}
            title={q ? "No matching log entries" : "No audit activity"}
            description={q ? "Try a different admin, action, or IP address." : "Admin actions across the platform will be recorded here."}
            action={q ? { label: "Clear search", onClick: () => setQ("") } : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((l, i) => (
                    <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.2) }} className="border-b hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(l.admin)}</span>
                          <span className="font-medium">{l.admin}</span>
                        </div>
                      </TableCell>
                      <TableCell>{l.action}</TableCell>
                      <TableCell><span className="rounded-lg bg-muted px-2 py-0.5 font-mono text-xs">{l.target}</span></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.ip}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fromNow(l.at)}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {items.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.25) }} className="flex min-h-16 items-start gap-3 p-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(l.admin)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm"><span className="font-medium">{l.admin}</span> · {l.action}</p>
                    <p className="mt-0.5 truncate"><span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{l.target}</span></p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{l.ip} · {fromNow(l.at)}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}

export default Audit;
