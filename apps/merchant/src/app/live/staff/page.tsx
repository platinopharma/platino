"use client";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Btn, Card, PageHeader, Pill, toast } from "@/features/live/ui";
import { STAFF, type Staff } from "@/features/live/data";
import { inviteStaffSchema } from "@/lib/validation";

export default function StaffPage() {
  const [rows, setRows] = useState<Staff[]>(STAFF);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Staff["role"]>("Pharmacist");
  const toggle = (id: string) => {
    const staff = rows.find((s) => s.id === id);
    setRows((r) => r.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    if (staff) toast(`${staff.name} ${staff.active ? "deactivated" : "activated"}`);
  };
  const invite = () => {
    const parsed = inviteStaffSchema.safeParse({ name, email, role });
    if (!parsed.success) { toast(parsed.error.issues[0]?.message ?? "Invalid input", "warn"); return; }
    const data = parsed.data;
    const perms = data.role === "Owner" ? ["inventory", "orders", "reports", "prices", "staff"] : data.role === "Manager" ? ["inventory", "orders", "reports", "prices"] : data.role === "Delivery" ? ["orders"] : ["inventory", "orders"];
    setRows((r) => [{ id: `ST-${(r.length + 1).toString().padStart(2, "0")}`, name: data.name, role: data.role, phone: "+91 90000 00000", email: data.email, shift: "9am – 6pm", active: true, permissions: perms }, ...r]);
    toast(`Invitation sent to ${data.email}`);
    setInviteOpen(false); setName(""); setEmail("");
  };
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Team"
        title="Staff & permissions"
        description="Manage owners, managers, pharmacists and delivery executives. Roles gate the modules each teammate can access."
        actions={<Btn size="sm" onClick={() => setInviteOpen(true)}><UserPlus className="size-3.5" /> Invite teammate</Btn>}
      />
      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-paper-alt/60 text-left font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Shift</th>
                <th className="px-3 py-2">Permissions</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-3">
                    <div className="font-medium text-ink">{s.name}</div>
                    <div className="font-mono text-[10px] text-ink-subtle">{s.id}</div>
                  </td>
                  <td className="px-3 py-3"><Pill tone={s.role === "Owner" ? "brand" : s.role === "Manager" ? "signal" : "muted"}>{s.role}</Pill></td>
                  <td className="px-3 py-3 text-ink-muted">
                    <div>{s.phone}</div>
                    <div className="font-mono text-[10px] text-ink-subtle">{s.email}</div>
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{s.shift}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.permissions.map((p) => (
                        <span key={p} className="rounded-md border border-line bg-paper-alt px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3"><Pill tone={s.active ? "signal" : "muted"}>{s.active ? "Active" : "Off duty"}</Pill></td>
                  <td className="px-3 py-3 text-right">
                    <Btn size="sm" variant="outline" onClick={() => toggle(s.id)}>{s.active ? "Deactivate" : "Activate"}</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {inviteOpen && (
        <div className="fixed inset-0 z-[55] grid place-items-center p-4">
          <button aria-label="Close" onClick={() => setInviteOpen(false)} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-sm rounded-xl border border-line bg-paper p-5 shadow-xl">
            <div className="font-display text-lg text-ink">Invite teammate</div>
            <div className="mt-3 space-y-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] outline-none focus:border-ink" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] outline-none focus:border-ink" />
              <select value={role} onChange={(e) => setRole(e.target.value as Staff["role"])} className="w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] outline-none focus:border-ink">
                <option>Owner</option><option>Manager</option><option>Pharmacist</option><option>Delivery</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Btn>
              <Btn onClick={invite}>Send invite</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
