import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { message: "Label is required" })
    .max(30, { message: "Label must be 30 characters or fewer" }),
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(80, { message: "Name must be 80 characters or fewer" }),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Phone number is too short" })
    .max(20, { message: "Phone number is too long" })
    .regex(/^[0-9+\s()-]{7,20}$/, { message: "Enter a valid phone number" }),
  line1: z
    .string()
    .trim()
    .min(3, { message: "Address line 1 is required" })
    .max(120, { message: "Address line 1 must be 120 characters or fewer" }),
  line2: z
    .string()
    .trim()
    .max(120, { message: "Address line 2 must be 120 characters or fewer" })
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, { message: "City is required" })
    .max(60, { message: "City must be 60 characters or fewer" }),
  state: z
    .string()
    .trim()
    .max(80, { message: "State must be 80 characters or fewer" })
    .optional()
    .or(z.literal("")),
  landmark: z
    .string()
    .trim()
    .max(120, { message: "Landmark must be 120 characters or fewer" })
    .optional()
    .or(z.literal("")),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: "Pincode must be exactly 6 digits" }),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional()
    .nullable(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export interface Address extends AddressInput {
  id: string;
}

interface AddressState {
  addresses: Address[];
  selectedId: string | null;
  hasLoaded: boolean;
  loadAddresses: () => Promise<void>;
  add: (a: Omit<Address, "id">) => Promise<string>;
  update: (id: string, patch: Partial<Omit<Address, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  setSelected: (id: string) => void;
}

import { api } from "@/lib/axios";

export const useAddresses = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedId: null,
      hasLoaded: false,
      loadAddresses: async () => {
        try {
          const res = await api.get('/api/customer/v1/addresses');
          if (res.data?.success) {
            const list: Address[] = res.data.data;
            set({ addresses: list, hasLoaded: true });
            const s = get();
            if (!s.selectedId && list.length > 0) {
              const def = list.find((a: Address) => a.isDefault);
              set({ selectedId: def ? def.id : list[0].id });
            }
          }
        } catch (e) {
          console.error("Failed to load addresses", e);
        }
      },
      add: async (a) => {
        const res = await api.post('/api/customer/v1/addresses', a);
        const id = res.data.data.addressId;
        const newAddr = { ...a, id };
        set((s) => {
          const list = [newAddr, ...s.addresses];
          const shouldDefault = a.isDefault || list.length === 1;
          return {
            addresses: shouldDefault
              ? list.map((x) => ({ ...x, isDefault: x.id === id }))
              : list,
            selectedId: s.selectedId ?? id,
          };
        });
        return id;
      },
      update: async (id, patch) => {
        await api.put(`/api/customer/v1/addresses/${id}`, patch);
        set((s) => ({
          addresses: s.addresses.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }));
      },
      remove: async (id) => {
        await api.delete(`/api/customer/v1/addresses/${id}`);
        set((s) => {
          const list = s.addresses.filter((x) => x.id !== id);
          const wasDefault = s.addresses.find((x) => x.id === id)?.isDefault;
          if (wasDefault && list[0]) list[0].isDefault = true;
          return {
            addresses: list,
            selectedId: s.selectedId === id ? list[0]?.id ?? null : s.selectedId,
          };
        });
      },
      setDefault: async (id) => {
        const addr = get().addresses.find(x => x.id === id);
        if (addr) {
           await api.put(`/api/customer/v1/addresses/${id}`, { isDefault: true });
           set((s) => ({
             addresses: s.addresses.map((x) => ({ ...x, isDefault: x.id === id })),
           }));
        }
      },
      setSelected: (id) => set({ selectedId: id }),
    }),
    { name: "platino-addresses" },
  ),
);

export function formatAddress(a: Address) {
  return [a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(", ");
}

/** Returns the effective address for checkout: explicit selection, default, or first. */
export function pickCheckoutAddress(
  addresses: Address[],
  selectedId: string | null,
): Address | null {
  if (addresses.length === 0) return null;
  const sel = selectedId ? addresses.find((a) => a.id === selectedId) : undefined;
  if (sel) return sel;
  const def = addresses.find((a) => a.isDefault);
  if (def) return def;
  return addresses[0] ?? null;
}

export type AddressFieldErrors = Partial<Record<keyof AddressInput, string>>;

export function validateAddress(input: AddressInput):
  | { ok: true; data: AddressInput }
  | { ok: false; errors: AddressFieldErrors } {
  const result = addressSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: AddressFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof AddressInput | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
