"use client";

import { useId } from "react";
import { toast } from "sonner";
import { ShieldCheck, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ROLE_MODULES } from "@/stores/auth-store";
import { NAV } from "@/lib/nav";
import type { Role } from "@/lib/types";



function Field({ label, defaultValue, suffix }: { label: string; defaultValue: string; suffix?: string }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-2">
        <Input id={id} defaultValue={defaultValue} />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function Settings() {
  const roles = Object.keys(ROLE_MODULES) as Role[];
  return (
    <>
      <PageHeader title="Settings" subtitle="Configure platform, billing and security."
        actions={<Button onClick={() => toast.success("Settings saved")}>Save changes</Button>} />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing & GST</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Platform Name" defaultValue="platinopharma" />
              <Field label="Support Email" defaultValue="support@platinopharma.in" />
              <Field label="Primary Color" defaultValue="#10b981" />
              <Field label="Default Currency" defaultValue="INR (₹)" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>GST & Charges</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="GST Number" defaultValue="29ABCDE1234F1Z5" />
              <Field label="GST Rate" defaultValue="18" suffix="%" />
              <Field label="Delivery Charge" defaultValue="40" suffix="₹" />
              <Field label="Free Delivery Above" defaultValue="500" suffix="₹" />
              <Field label="Platform Commission" defaultValue="12" suffix="%" />
              <Field label="Payout Cycle" defaultValue="Weekly" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Payment Gateway</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Provider" defaultValue="Razorpay" />
              <Field label="Mode" defaultValue="Live" />
              <Field label="Merchant ID" defaultValue="acc_platino_2026" />
              <Field label="Settlement Account" defaultValue="HDFC ••• 4821" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Notification Templates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="mb-1.5 block">Order Confirmation</Label><Textarea rows={2} defaultValue="Hi {customer}, your order {order_id} is confirmed and being prepared." /></div>
              <div><Label className="mb-1.5 block">Pharmacy Approved</Label><Textarea rows={2} defaultValue="Congratulations {store}! Your pharmacy is verified and live on platinopharma." /></div>
              <div><Label className="mb-1.5 block">Application Rejected</Label><Textarea rows={2} defaultValue="Your application could not be approved. Reason: {reason}." /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Role-Based Permissions</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Each role only sees its allowed modules.</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Module</th>
                    {roles.map((r) => <th key={r} className="px-2 py-2 text-center font-medium">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {NAV.map((n) => (
                    <tr key={n.key} className="border-b">
                      <td className="py-2.5 pr-4 font-medium">{n.label}</td>
                      {roles.map((r) => {
                        const mods = ROLE_MODULES[r];
                        const ok = mods === "all" || mods.includes(n.key);
                        return <td key={r} className="px-2 py-2.5 text-center">{ok ? <Check className="mx-auto h-4 w-4 text-success" /> : <span className="text-muted-foreground/40">—</span>}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Privacy Policy</CardTitle></CardHeader>
            <CardContent><Textarea rows={5} defaultValue="platinopharma respects your privacy. We collect only the data necessary to operate the platform…" /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Terms of Service</CardTitle></CardHeader>
            <CardContent><Textarea rows={5} defaultValue="By using platinopharma, partners and customers agree to the following terms…" /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default Settings;
