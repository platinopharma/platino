'use client';
import { useState, useEffect } from "react";
import { Plus, Trash2, Star, Pencil, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useAddresses,
  formatAddress,
  validateAddress,
  type Address,
  type AddressInput,
  type AddressFieldErrors,
} from "@/stores/addresses";
import { cn } from "@/lib/utils";
import { LocationPicker } from "@/components/ui/location-picker";

interface Props {
  selectable?: boolean;
}

const emptyForm: AddressInput = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  lat: null,
  lng: null,
  location: null,
  isDefault: false,
};

const MAX_LENGTHS: Record<keyof AddressInput, number | undefined> = {
  label: 30,
  name: 80,
  phone: 20,
  line1: 120,
  line2: 120,
  landmark: 120,
  city: 60,
  state: 80,
  pincode: 6,
  lat: undefined,
  lng: undefined,
  location: undefined,
  isDefault: undefined,
};

interface AddressSuggestion {
  line1: string;
  city: string;
  pincode: string;
}
const ADDRESS_SUGGESTIONS: AddressSuggestion[] = [
  { line1: "Plot 42, Ayyappa Society, Madhapur", city: "Hyderabad", pincode: "500081" },
  { line1: "Cyber Towers, HITEC City", city: "Hyderabad", pincode: "500081" },
  { line1: "Road No. 12, Banjara Hills", city: "Hyderabad", pincode: "500034" },
  { line1: "Jubilee Hills, Road No. 36", city: "Hyderabad", pincode: "500033" },
  { line1: "Kondapur Main Road", city: "Hyderabad", pincode: "500084" },
  { line1: "MG Road, Indiranagar", city: "Bengaluru", pincode: "560038" },
  { line1: "Koramangala, 4th Block", city: "Bengaluru", pincode: "560034" },
  { line1: "Bandra West, Linking Road", city: "Mumbai", pincode: "400050" },
];

export function AddressManager({ selectable = false }: Props) {
  const addresses = useAddresses((s) => s.addresses);
  const selectedId = useAddresses((s) => s.selectedId);
  const addAddr = useAddresses((s) => s.add);
  const updateAddr = useAddresses((s) => s.update);
  const removeAddr = useAddresses((s) => s.remove);
  const setDefault = useAddresses((s) => s.setDefault);
  const setSelected = useAddresses((s) => s.setSelected);
  const loadAddresses = useAddresses((s) => s.loadAddresses);
  const hasLoaded = useAddresses((s) => s.hasLoaded);

  useEffect(() => {
    if (!hasLoaded) {
      loadAddresses();
    }
  }, [hasLoaded, loadAddresses]);

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [errors, setErrors] = useState<AddressFieldErrors>({});

  const openNew = () => {
    setForm(emptyForm);
    setErrors({});
    setEditing("new");
  };
  const openEdit = (a: Address) => {
    setForm({
      label: a.label,
      name: a.name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      landmark: a.landmark ?? "",
      city: a.city,
      state: a.state ?? "",
      pincode: a.pincode,
      lat: a.lat ?? null,
      lng: a.lng ?? null,
      location: a.location ?? null,
      isDefault: !!a.isDefault,
    });
    setErrors({});
    setEditing(a.id);
  };
  const close = () => {
    setEditing(null);
    setErrors({});
    setForm(emptyForm);
  };

  const patch = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const result = validateAddress(form);
    if (!result.ok) {
      setErrors(result.errors);
      const first = Object.values(result.errors).find(Boolean);
      toast.error(first ?? "Please fix the highlighted fields");
      return;
    }
    
    try {
      if (editing === "new") {
        const id = await addAddr(result.data);
        if (selectable) setSelected(id);
        toast.success("Address added");
      } else if (editing) {
        await updateAddr(editing, result.data);
        toast.success("Address updated");
      }
      close();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; message?: string } } };
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-3" data-testid="address-manager">
      {addresses.length === 0 && !editing && (
        <p className="text-sm text-muted-foreground">
          No addresses yet. Add one to continue.
        </p>
      )}
      {addresses.map((a) => {
        const isSel = selectable && selectedId === a.id;
        return (
          <div
            key={a.id}
            data-testid="address-row"
            data-address-id={a.id}
            className={cn(
              "rounded-2xl border bg-surface p-4 transition-colors",
              isSel ? "border-primary bg-primary-soft" : "border-border",
            )}
          >
            <div className="flex items-start gap-3">
              {selectable && (
                <input
                  type="radio"
                  name="address-select"
                  checked={selectedId === a.id}
                  onChange={() => setSelected(a.id)}
                  className="mt-1 accent-primary"
                  aria-label={`Select ${a.label} address`}
                  data-testid="address-select-radio"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{a.label}</span>
                  {a.isDefault && (
                    <span
                      data-testid="address-default-badge"
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                    >
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground break-words">
                  {a.name} · {a.phone}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground break-words">
                  {formatAddress(a)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!a.isDefault && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await setDefault(a.id);
                          toast.success(`${a.label} set as default`);
                        } catch (e) {
                          toast.error("Failed to set default");
                        }
                      }}
                      data-testid="address-set-default"
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 text-[11px] font-medium hover:border-primary"
                    >
                      <Star className="h-3 w-3" /> Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 text-[11px] font-medium hover:border-primary"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await removeAddr(a.id);
                          toast.success("Address removed");
                        } catch(e: unknown) {
                          const err = e as { response?: { data?: { error?: string } } };
                          toast.error(err?.response?.data?.error || "Failed to remove address");
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 text-[11px] font-medium text-destructive hover:border-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {editing ? (
        <div
          className="rounded-2xl border border-primary/40 bg-surface-elevated p-4"
          data-testid="address-form"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">
              {editing === "new" ? "Add new address" : "Edit address"}
            </h3>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div
            role="alert"
            aria-live="polite"
            data-testid="address-error-summary"
            className={cn(
              "mt-3 overflow-hidden rounded-xl border text-xs transition-all",
              Object.values(errors).some(Boolean)
                ? "border-destructive/40 bg-destructive/[0.06] p-3 text-destructive"
                : "hidden",
            )}
          >
            {Object.values(errors).some(Boolean) && (
              <>
                <div className="flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> Please fix the following:
                </div>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {(Object.entries(errors) as [keyof AddressInput, string | undefined][])
                    .filter(([, v]) => Boolean(v))
                    .map(([k, v]) => (
                      <li key={k} data-testid={`address-summary-${k}`}>
                        {v}
                      </li>
                    ))}
                </ul>
              </>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field
              label="Label"
              name="label"
              value={form.label}
              onChange={(v) => patch("label", v)}
              placeholder="Home, Office…"
              error={errors.label}
              maxLength={MAX_LENGTHS.label}
              required
            />
            <Field
              label="Recipient name"
              name="name"
              value={form.name}
              onChange={(v) => patch("name", v)}
              placeholder="Full name"
              error={errors.name}
              maxLength={MAX_LENGTHS.name}
              required
            />
            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={(v) => patch("phone", v)}
              placeholder="+91 98XXX XX210"
              inputMode="tel"
              error={errors.phone}
              maxLength={MAX_LENGTHS.phone}
              required
            />
            <Field
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={(v) => patch("pincode", v.replace(/\D/g, ""))}
              placeholder="500081"
              inputMode="numeric"
              maxLength={MAX_LENGTHS.pincode}
              error={errors.pincode}
              required
            />
            <div className="sm:col-span-2">
              <Field
                label="Address line 1"
                name="line1"
                value={form.line1}
                onChange={(v) => patch("line1", v)}
                placeholder="Start typing to see suggestions…"
                error={errors.line1}
                maxLength={MAX_LENGTHS.line1}
                required
              />

              <AddressSuggestions
                query={form.line1}
                onPick={(s) => {
                  setForm((f) => ({ ...f, line1: s.line1, city: s.city, pincode: s.pincode }));
                  setErrors((e) => ({
                    ...e,
                    line1: undefined,
                    city: undefined,
                    pincode: undefined,
                  }));
                }}
              />
            </div>

            <Field
              className="sm:col-span-2"
              label="Address line 2"
              name="line2"
              value={form.line2 ?? ""}
              onChange={(v) => patch("line2", v)}
              placeholder="Landmark, area (optional)"
              error={errors.line2}
              maxLength={MAX_LENGTHS.line2}
            />
            <Field
              label="Landmark (Optional)"
              name="landmark"
              value={form.landmark ?? ""}
              onChange={(v) => patch("landmark", v)}
              placeholder="Opposite Metro Station..."
              error={errors.landmark}
              maxLength={MAX_LENGTHS.landmark}
            />
            <Field
              label="City"
              name="city"
              value={form.city}
              onChange={(v) => patch("city", v)}
              placeholder="Hyderabad"
              error={errors.city}
              maxLength={MAX_LENGTHS.city}
              required
            />
            <Field
              label="State (Optional)"
              name="state"
              value={form.state ?? ""}
              onChange={(v) => patch("state", v)}
              placeholder="Telangana"
              error={errors.state}
              maxLength={MAX_LENGTHS.state}
            />
            
            {/* Interactive Location Picker for Map Pin Fine-Tuning */}
            <div className="sm:col-span-2 pt-2">
              <LocationPicker
                initialLat={form.lat ? Number(form.lat) : 17.3850}
                initialLng={form.lng ? Number(form.lng) : 78.4867}
                title="Delivery Location Pin"
                subtitle="Search delivery area or position pin over exact entrance"
                onLocationSelect={(loc) => {
                  setForm((f) => ({
                    ...f,
                    lat: loc.lat,
                    lng: loc.lng,
                    location: { type: "Point", coordinates: [loc.lng, loc.lat] },
                    line1: loc.addressLine1 || f.line1,
                    city: loc.city || f.city,
                    state: loc.state || f.state,
                    pincode: loc.pincode || f.pincode,
                  }));
                }}
              />
            </div>

            <label className="flex items-center gap-2 self-end text-sm sm:col-span-2 pt-1">
              <input
                type="checkbox"
                checked={!!form.isDefault}
                onChange={(e) => patch("isDefault", e.target.checked)}
                className="h-4 w-4 accent-primary"
                data-testid="address-is-default"
              />
              Set as default delivery address
            </label>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-full border border-border bg-surface-elevated px-4 text-sm font-medium hover:border-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              data-testid="address-save"
              className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-95"
            >
              {editing === "new" ? "Save address" : "Update"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openNew}
          data-testid="address-add-new"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" /> Add new address
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  className,
  inputMode,
  maxLength,
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  maxLength?: number;
  error?: string;
  required?: boolean;
}) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <label className={cn("block text-xs font-medium text-muted-foreground", className)}>
      <span className="mb-1 flex items-center gap-1">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        data-testid={`address-field-${name}`}
        className={cn(
          "h-11 w-full rounded-xl border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40",
          error
            ? "border-destructive focus:border-destructive"
            : "border-border focus:border-primary",
        )}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          data-testid={`address-error-${name}`}
          className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
        >
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      )}
    </label>
  );
}

function AddressSuggestions({
  query,
  onPick,
}: {
  query: string;
  onPick: (s: AddressSuggestion) => void;
}) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  const matches = ADDRESS_SUGGESTIONS.filter(
    (s) =>
      s.line1.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.pincode.startsWith(q),
  ).slice(0, 5);
  // Suppress the listbox when the field already exactly matches a picked value.
  const exact = matches.find((m) => m.line1.toLowerCase() === q);
  if (exact && matches.length === 1) return null;
  if (matches.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="address-suggestions-empty"
        className="mt-2 rounded-xl border border-dashed border-border bg-surface p-2 text-[11px] text-muted-foreground"
      >
        No matching addresses. Keep typing to enter it manually.
      </div>
    );
  }
  return (
    <ul
      role="listbox"
      id="address-suggestions"
      aria-label="Address suggestions"
      data-testid="address-suggestions"
      className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-1 text-sm shadow-sm"
    >
      {matches.map((s, i) => (
        <li key={`${s.line1}-${i}`} role="none">
          <button
            type="button"
            role="option"
            aria-selected={false}
            data-testid="address-suggestion"
            onClick={() => onPick(s)}
            className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-primary-soft focus:bg-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span className="text-xs font-medium text-foreground">{s.line1}</span>
            <span className="text-[11px] text-muted-foreground">
              {s.city} · {s.pincode}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
