"use client";
import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Btn, Card, PageHeader, Pill, toast } from "@/features/live/ui";
import { usePharmacySettings, useUpdatePharmacySettingsMutation } from "@/hooks/usePharmacyQueries";
import { CardLoadingSkeleton } from "@/components/ui/state-displays";
import { PasswordInput } from "@/components/ui/password-input";

export default function SettingsPage() {
  const { data: snap, isLoading } = usePharmacySettings();
  const updateMutation = useUpdatePharmacySettingsMutation();

  const [formData, setFormData] = useState({
    pharmacyName: "",
    city: "",
    email: "",
    opens: "08:00",
    closes: "23:00",
    radius: 5,
    minOrder: 199,
    lat: null as number | null,
    lng: null as number | null,
  });
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [holiday, setHoliday] = useState(false);

  useEffect(() => {
    if (snap) {
      setFormData({
        pharmacyName: (snap.pharmacyName as string) || "",
        city: (snap.city as string) || "",
        email: (snap.email as string) || "",
        opens: (snap.opens as string) || "08:00",
        closes: (snap.closes as string) || "23:00",
        radius: (snap.radius as number) || 5,
        minOrder: (snap.minOrder as number) || 199,
        lat: (snap.lat as number) || null,
        lng: (snap.lng as number) || null,
      });
      if (snap.lat && snap.lng) setLocStatus("success");
      setHoliday((snap.holiday as boolean) || false);
    }
  }, [snap]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      toast("Browser does not support geolocation", "error");
      return;
    }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateMutation.mutateAsync({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setFormData((prev) => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setLocStatus("success");
          toast("Location saved to database successfully");
        } catch (err: unknown) {
          setLocStatus("error");
          const e = err instanceof Error ? err : new Error(String(err));
          toast(e.message || "Failed to save location", "error");
        }
      },
      () => {
        setLocStatus("error");
        toast("Failed to detect location. Check permissions.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const save = async () => {
    try {
      await updateMutation.mutateAsync({ ...formData, holiday });
      toast("Store settings saved");
    } catch (err: unknown) {
      console.error(err);
      const e = err instanceof Error ? err : new Error(String(err));
      toast(e.message || "Failed to save settings", "error");
    }
  };

  const discard = () => {
    if (snap) {
      setFormData({
        pharmacyName: (snap.pharmacyName as string) || "",
        city: (snap.city as string) || "",
        email: (snap.email as string) || "",
        opens: (snap.opens as string) || "08:00",
        closes: (snap.closes as string) || "23:00",
        radius: (snap.radius as number) || 5,
        minOrder: (snap.minOrder as number) || 199,
        lat: (snap.lat as number) || null,
        lng: (snap.lng as number) || null,
      });
      if (snap.lat && snap.lng) setLocStatus("success");
      else setLocStatus("idle");
      setHoliday((snap.holiday as boolean) || false);
    }
    toast("Changes discarded", "warn");
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Configuration" title="Store settings" description="Manage store information, operating hours, delivery, tax and payouts." />
        <div className="grid gap-4 lg:grid-cols-2">
          <CardLoadingSkeleton />
          <CardLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Configuration" title="Store settings" description="Manage store information, operating hours, delivery, tax and payouts." />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Store information">
          <Grid>
            <Field label="Pharmacy name" name="pharmacyName" value={formData.pharmacyName} onChange={handleChange} />
            <Field label="City" name="city" value={formData.city} onChange={handleChange} />
            <Field label="Email" name="email" value={formData.email} onChange={handleChange} />
            <Field label="Emergency contact" value="+91 98450 21134" readOnly />
          </Grid>
          
          <div className="mt-4 pt-4 border-t border-line/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold text-ink">Store GPS Location</div>
                <div className="text-[11px] text-ink-muted">Used for delivery routing and customer pickups.</div>
              </div>
              {locStatus === "success" && formData.lat && formData.lng ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                  </div>
                  <button onClick={detectLocation} type="button" className="text-[11px] font-medium text-ink hover:underline">Update</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locStatus === "loading"}
                  className="flex items-center gap-2 rounded-md bg-paper-alt px-3 py-1.5 text-[11px] font-medium text-ink transition-colors hover:bg-line disabled:opacity-50"
                >
                  {locStatus === "loading" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-subtle" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-ink-subtle" />
                  )}
                  Detect Location
                </button>
              )}
            </div>
            {locStatus === "error" && (
              <div className="mt-2 text-[11px] text-alert">Failed to detect location. Please check browser permissions.</div>
            )}
          </div>
        </Card>

        <Card title="Operating hours" action={
          <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            <input type="checkbox" checked={holiday} onChange={(e) => setHoliday(e.target.checked)} /> Holiday mode
            {holiday && <Pill tone="warn">store paused</Pill>}
          </label>
        }>
          <Grid>
            <Field label="Opens" name="opens" value={formData.opens} onChange={handleChange} />
            <Field label="Closes" name="closes" value={formData.closes} onChange={handleChange} />
          </Grid>
          <p className="mt-3 text-[12px] text-ink-muted">During holiday mode your store stops accepting new orders but continues fulfilling active ones.</p>
        </Card>

        <Card title="Delivery">
          <Grid>
            <Field label="Delivery radius (km)" name="radius" value={formData.radius.toString()} onChange={handleChange} type="number" />
            <Field label="Delivery charge (₹)" value="29" readOnly />
            <Field label="Minimum order (₹)" name="minOrder" value={formData.minOrder.toString()} onChange={handleChange} type="number" />
            <Field label="Free delivery above (₹)" value="499" readOnly />
          </Grid>
        </Card>

        <Card title="Bank & tax">
          <Grid>
            <Field label="Account holder" value="Platino Retail Pvt Ltd" readOnly />
            <Field label="Bank" value="HDFC Bank" readOnly />
            <Field label="Account number" value="••••••4421" readOnly />
            <Field label="IFSC" value="HDFC0001102" readOnly />
            <Field label="GSTIN" value="29ABCDE1234F1Z5" readOnly />
            <Field label="Tax rate" value="5% / 12%" readOnly />
          </Grid>
        </Card>

        <Card title="Notification preferences">
          <ul className="space-y-2.5 text-[13px]">
            {["New orders", "Cancelled orders", "Low stock alerts", "Expiry alerts", "Payout updates", "System announcements"].map((n) => (
              <li key={n} className="flex items-center justify-between">
                <span className="text-ink">{n}</span>
                <label className="inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <span className="h-5 w-9 rounded-full bg-ink/15 peer-checked:bg-brand transition-colors relative">
                    <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-paper peer-checked:translate-x-4 transition-transform" />
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Password & security">
          <Grid>
            <label className="block">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">Current password</div>
              <PasswordInput placeholder="••••••••" className="w-full rounded-md border border-line bg-paper text-[12px] text-ink focus:border-brand focus:outline-none" />
            </label>
            <label className="block">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">New password</div>
              <PasswordInput placeholder="At least 8 characters" className="w-full rounded-md border border-line bg-paper text-[12px] text-ink focus:border-brand focus:outline-none" />
            </label>
          </Grid>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted">
            <input type="checkbox" defaultChecked /> Enable two-factor authentication
          </div>
          <div className="mt-4 flex justify-end"><Btn onClick={() => toast("Password updated")}>Update password</Btn></div>
        </Card>
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Btn variant="ghost" onClick={discard}>Discard</Btn>
        <Btn onClick={save}>Save changes</Btn>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, value, placeholder, name, onChange, type = "text", readOnly = false }: { label: string; value: string | number; placeholder?: string; name?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; type?: string; readOnly?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">{label}</div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] text-ink focus:border-brand focus:outline-none read-only:bg-paper-alt read-only:text-ink-subtle"
      />
    </label>
  );
}
