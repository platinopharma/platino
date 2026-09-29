"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Medicine, Order } from "@/features/live/data";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const PHARMACY_QUERY_KEYS = {
  dashboard: ["pharmacy", "dashboard"] as const,
  recentOrders: ["pharmacy", "dashboard", "recentOrders"] as const,
  allOrders: ["pharmacy", "orders"] as const,
  orders: (limit?: number) => ["pharmacy", "orders", limit ?? 100] as const,
  settings: ["pharmacy", "settings"] as const,
  medicines: ["pharmacy", "medicines"] as const,
  inventory: ["pharmacy", "inventory"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch live operations dashboard overview metrics */
export function usePharmacyDashboard() {
  return useQuery<Record<string, unknown>>({
    queryKey: PHARMACY_QUERY_KEYS.dashboard,
    queryFn: async ({ signal }) => {
      const res = await api.get("/v1/pharmacy/dashboard", { signal });
      return res.data;
    },
    staleTime: 30_000,
  });
}

/** Fetch live order stream for front dashboard */
export function usePharmacyRecentOrders() {
  return useQuery<Record<string, unknown>[]>({
    queryKey: PHARMACY_QUERY_KEYS.recentOrders,
    queryFn: async ({ signal }) => {
      const res = await api.get("/v1/pharmacy/dashboard/recent-orders", { signal });
      return Array.isArray(res.data) ? res.data : (res.data?.orders ?? []);
    },
    staleTime: 5_000,
    refetchInterval: 5_000, // Live auto-polling every 5 seconds for new orders
  });
}

/** Fetch complete order management table with configurable limits */
export function usePharmacyOrders(limit = 100) {
  return useQuery<{ orders: (Order & { _id?: string; orderNumber?: string; orderStatus?: string; customerName?: string; customerPhone?: string; deliveryAddress?: string; totalAmount?: number; paymentMethod?: string; paymentStatus?: string })[] }>({
    queryKey: PHARMACY_QUERY_KEYS.orders(limit),
    queryFn: async ({ signal }) => {
      const res = await api.get(`/v1/pharmacy/orders?limit=${limit}`, { signal });
      return res.data;
    },
    staleTime: 5_000,
    refetchInterval: 5_000, // Live auto-polling every 5 seconds for incoming orders
  });
}

/** Fetch pharmacy inventory medicines */
export function usePharmacyMedicines(page = 1, limit = 100) {
  return useQuery<Record<string, unknown>>({
    queryKey: [...PHARMACY_QUERY_KEYS.medicines, page, limit],
    queryFn: async ({ signal }) => {
      const res = await api.get(`/v1/pharmacy/medicines?page=${page}&limit=${limit}`, { signal });
      return res.data;
    },
    staleTime: 60_000,
  });
}

/** Fetch store settings configuration */
export function usePharmacySettings() {
  return useQuery<Record<string, unknown>>({
    queryKey: PHARMACY_QUERY_KEYS.settings,
    queryFn: async ({ signal }) => {
      const res = await api.get("/v1/pharmacy/settings", { signal });
      return res.data;
    },
    staleTime: 60_000,
  });
}

/** Mutation to update store configuration settings */
export function useUpdatePharmacySettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await api.patch("/v1/pharmacy/settings", body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PHARMACY_QUERY_KEYS.settings, data);
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.settings });
    },
  });
}

/** Mutation to update an order's status or accept/reject an order */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      status,
      reason,
    }: {
      id: string;
      action: "status" | "accept" | "reject";
      status?: string;
      reason?: string;
    }) => {
      let path = `/v1/pharmacy/orders/${id}/${action}`;
      let body: Record<string, unknown> | undefined = undefined;
      if (action === "status" && status) body = { status };
      if (action === "reject" && reason) body = { reason };

      const res = await api.patch(path, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.allOrders });
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.recentOrders });
    },
  });
}

// ─── Inventory Hooks ──────────────────────────────────────────────────────────

/** Fetch complete pharmacy inventory */
export function useInventory() {
  return useQuery<Medicine[]>({
    queryKey: PHARMACY_QUERY_KEYS.inventory,
    queryFn: async ({ signal }) => {
      const res = await api.get("/v1/pharmacy/inventory", { signal });
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.inventory)) return raw.inventory;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    },
    staleTime: 5_000,
  });
}

export function useAddMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await api.post("/v1/pharmacy/inventory", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.inventory });
    },
  });
}

export function useUpdateMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> | Partial<Medicine> }) => {
      const res = await api.patch(`/v1/pharmacy/inventory/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.inventory });
    },
  });
}

export function useDeleteMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/v1/pharmacy/inventory/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEYS.inventory });
    },
  });
}

export function useUploadMedicineImageMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/v1/pharmacy/inventory/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url as string;
    },
  });
}

/** Fetch master catalog medicines created by Admin for easy 1-click import */
export function useMasterCatalog(search = "", category = "all") {
  return useQuery<{ success: boolean; catalog: Record<string, unknown>[]; total: number }>({
    queryKey: ["master-catalog", search, category],
    queryFn: async () => {
      const queryStr = new URLSearchParams();
      if (search) queryStr.set("search", search);
      if (category && category !== "all") queryStr.set("category", category);
      const qs = queryStr.toString();
      const res = await api.get(`/v1/pharmacy/inventory/master-catalog${qs ? `?${qs}` : ""}`);
      return res.data;
    },
    staleTime: 60_000,
  });
}

