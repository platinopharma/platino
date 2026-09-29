import { z, type ZodError, type ZodTypeAny, type infer as zInfer } from "zod";
import { toast } from "@/features/live/ui";

// --------------------------- Error → toast mapping ---------------------------

/** Normalized error shape used across the app. */
export type AppError = {
  kind: "validation" | "network" | "not_found" | "forbidden" | "server" | "unknown";
  message: string;
  fieldErrors?: Record<string, string[]>;
  cause?: unknown;
};

export function toAppError(err: unknown): AppError {
  if (err && typeof err === "object" && "issues" in err) {
    const ze = err as ZodError;
    const fieldErrors: Record<string, string[]> = {};
    for (const i of ze.issues) {
      const key = i.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(i.message);
    }
    const first = ze.issues[0];
    return {
      kind: "validation",
      message: first ? `${first.path.join(".") || "Input"}: ${first.message}` : "Invalid input",
      fieldErrors,
      cause: err,
    };
  }
  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return { kind: "network", message: "Network unavailable. Check your connection.", cause: err };
  }
  if (err instanceof Response) {
    if (err.status === 404) return { kind: "not_found", message: "Not found.", cause: err };
    if (err.status === 401 || err.status === 403) return { kind: "forbidden", message: "You don't have permission for that.", cause: err };
    if (err.status >= 500) return { kind: "server", message: "Server error. Please try again.", cause: err };
    return { kind: "unknown", message: `Request failed (${err.status})`, cause: err };
  }
  if (err instanceof Error) return { kind: "unknown", message: err.message || "Something went wrong", cause: err };
  return { kind: "unknown", message: "Something went wrong" };
}

/** Wrap any async action; on failure shows a toast and returns null. */
export async function tryAsync<T>(fn: () => Promise<T> | T, opts?: { onError?: (e: AppError) => void }): Promise<T | null> {
  try {
    return await fn();
  } catch (raw) {
    const err = toAppError(raw);
    if (opts?.onError) opts.onError(err);
    toast(err.message, err.kind === "validation" || err.kind === "forbidden" ? "warn" : "error");
    if (process.env.NODE_ENV === "development") console.error("[tryAsync]", err.kind, err.cause ?? err);
    return null;
  }
}

/** Parse with a schema; returns { ok, data } or { ok:false, error } — never throws. */
export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: AppError };

export function parse<S extends ZodTypeAny>(schema: S, input: unknown): ParseResult<zInfer<S>> {
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, error: toAppError(r.error) };
}

/** Parse and toast on failure. Returns typed data or null. */
export function parseOrToast<S extends ZodTypeAny>(schema: S, input: unknown): zInfer<S> | null {
  const r = parse(schema, input);
  if (r.ok) return r.data;
  toast(r.error.message, "warn");
  return null;
}

// --------------------------- Reusable primitives ---------------------------

const trimmed = (max: number, label = "Value") =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be under ${max} chars`);

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email").max(255);
export const phoneInSchema = z
  .string()
  .trim()
  .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid Indian phone number");
export const otpSchema = z.string().trim().regex(/^\d{4,6}$/, "OTP must be 4–6 digits");
export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z0-9]Z[A-Z0-9]$/, "Enter a valid 15-char GSTIN");
export const drugLicenseSchema = trimmed(40, "Drug license").regex(/^[A-Z0-9\-\/]+$/i, "License has invalid characters");
export const rupeesSchema = z.coerce.number({ invalid_type_error: "Must be a number" }).finite().min(0, "Cannot be negative").max(10_00_000, "Too large");
export const kmSchema = z.coerce.number().finite().min(0, "Cannot be negative").max(50, "Max 50 km");
export const timeHmSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h)");

// --------------------------- Feature schemas ---------------------------

export const staffRoleSchema = z.enum(["Owner", "Manager", "Pharmacist", "Delivery"]);

export const inviteStaffSchema = z.object({
  name: trimmed(80, "Name"),
  email: emailSchema,
  role: staffRoleSchema,
});
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;

export const storeSettingsSchema = z.object({
  pharmacyName: trimmed(120, "Pharmacy name"),
  city: trimmed(60, "City"),
  email: emailSchema,
  opens: timeHmSchema,
  closes: timeHmSchema,
  radius: kmSchema,
  minOrder: rupeesSchema,
  holiday: z.boolean(),
}).refine((v) => v.opens < v.closes, { path: ["closes"], message: "Closes must be after opens" });
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export const onboardingBusinessSchema = z.object({
  pharmacyName: trimmed(120, "Pharmacy name"),
  ownerName: trimmed(80, "Owner name"),
  email: emailSchema,
  phone: phoneInSchema,
  gst: gstinSchema,
  license: drugLicenseSchema,
  address: trimmed(200, "Address"),
  city: trimmed(60, "City"),
});
export type OnboardingBusinessInput = z.infer<typeof onboardingBusinessSchema>;

export const inventoryItemSchema = z.object({
  name: trimmed(120, "Medicine name"),
  sku: trimmed(40, "SKU"),
  stock: z.coerce.number().int("Whole number only").min(0, "Cannot be negative").max(999999),
  price: rupeesSchema,
  batch: trimmed(40, "Batch").optional(),
  expiry: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM").optional(),
});
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

export const orderStatusSchema = z.enum(["pending", "accepted", "packing", "out_for_delivery", "delivered", "cancelled"]);