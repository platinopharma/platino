"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Ban, ShieldCheck, MoreHorizontal, Users, SearchX } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import { useAdminCustomers, useUpdateAdminCustomerMutation } from "@/hooks/useAdminDataQueries";
import { inr, num, fmtDate } from "@/lib/format";
import { initials } from "@/lib/format";



function StatusPill({ blocked }: { blocked: boolean }) {
  return blocked ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"><Ban className="h-3 w-3" />Blocked</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"><ShieldCheck className="h-3 w-3" />Active</span>
  );
}

function Customers() {
  const [q, setQ] = useState("");
  
  const { data, isLoading: loading } = useAdminCustomers();
  const updateMut = useUpdateAdminCustomerMutation();
  const ALL = data?.customers || [];
  
  const items = ALL.filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase()));

  const toggle = async (id: string, isBlocked: boolean) => {
    try {
      await updateMut.mutateAsync({ id, blocked: !isBlocked });
      toast.success(isBlocked ? "Customer unblocked" : "Customer blocked");
    } catch (err) {
      toast.error("Failed to update customer");
    }
  };

  const isEmpty = !loading && items.length === 0;

  return (
    <>
      <PageHeader title="Customer Management" subtitle={`${num(ALL.length)} registered customers`} />
      <div className="relative sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" aria-label="Search customers" className="pl-9" />
      </div>
      <Card className="overflow-hidden p-0">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : isEmpty ? (
          <EmptyState
            icon={q ? SearchX : Users}
            title={q ? "No matching customers" : "No customers yet"}
            description={q ? "Try a different name, email, or city." : "Registered customers will appear here."}
            action={q ? { label: "Clear search", onClick: () => setQ("") } : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spend</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.2) }} className="border-b hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(c.name)}</span>
                          <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></div>
                        </div>
                      </TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>{c.orders}</TableCell>
                      <TableCell className="font-medium">{inr(c.totalSpend)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(c.since)}</TableCell>
                      <TableCell><StatusPill blocked={c.blocked} /></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Row actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggle(c.id, c.blocked)}>
                              {c.blocked ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}{c.blocked ? "Unblock" : "Block"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {items.map((c, i) => (
                <motion.li key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.25) }} className="flex min-h-16 items-center gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(c.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.city} · {c.orders} orders · {inr(c.totalSpend)}</p>
                    <div className="mt-1.5"><StatusPill blocked={c.blocked} /></div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-10 w-10 shrink-0" aria-label={`Actions for ${c.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggle(c.id, c.blocked)}>
                        {c.blocked ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}{c.blocked ? "Unblock" : "Block"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}

export default Customers;
