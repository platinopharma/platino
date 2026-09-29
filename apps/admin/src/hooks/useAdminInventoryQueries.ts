import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import { AdminInventoryItem } from "@/lib/types";

export interface InventoryFilterParams {
  search?: string;
  category?: string;
  subcategory?: string;
  stockStatus?: string;
  pharmacyId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InventoryResponse {
  success: boolean;
  data: AdminInventoryItem[];
  medicines: AdminInventoryItem[];
  stats: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  pharmacies: Array<{ id: string; name: string; city: string }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useAdminInventory(params: InventoryFilterParams = {}) {
  const queryStr = new URLSearchParams();
  if (params.search) queryStr.set("search", params.search);
  if (params.category && params.category !== "all") queryStr.set("category", params.category);
  if (params.subcategory && params.subcategory !== "all") queryStr.set("subcategory", params.subcategory);
  if (params.stockStatus && params.stockStatus !== "all") queryStr.set("stockStatus", params.stockStatus);
  if (params.pharmacyId && params.pharmacyId !== "all") queryStr.set("pharmacyId", params.pharmacyId);
  if (params.status && params.status !== "all") queryStr.set("status", params.status);
  if (params.page) queryStr.set("page", params.page.toString());
  if (params.limit) queryStr.set("limit", params.limit.toString());
  if (params.sortBy) queryStr.set("sortBy", params.sortBy);
  if (params.sortOrder) queryStr.set("sortOrder", params.sortOrder);

  const qs = queryStr.toString();
  const endpoint = `/admin/inventory${qs ? `?${qs}` : ""}`;

  return useQuery<InventoryResponse>({
    queryKey: ["admin", "inventory", params],
    queryFn: () => apiGet<InventoryResponse>(endpoint),
    staleTime: 10000,
  });
}

export function useCreateAdminInventoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => apiPost<any>("/admin/inventory", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "medicines"] });
    },
  });
}

export function useUpdateAdminInventoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiPut<any>(`/admin/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "medicines"] });
    },
  });
}

export function useDeleteAdminInventoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<any>(`/admin/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "medicines"] });
    },
  });
}
