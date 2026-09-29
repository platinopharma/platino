import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { Pharmacy, Medicine, Order, Customer } from "@/lib/types";

export function useAdminPharmacies() {
  return useQuery<{ pharmacies: Pharmacy[] }>({
    queryKey: ["admin", "pharmacies"],
    queryFn: () => apiGet("/admin/pharmacies"),
  });
}

export function useAdminMedicines(page = 1, limit = 50) {
  return useQuery<{ medicines: Medicine[], pagination: any }>({
    queryKey: ["admin", "medicines", page, limit],
    queryFn: () => apiGet(`/admin/medicines?page=${page}&limit=${limit}`),
  });
}

export function useAdminOrders() {
  return useQuery<{ orders: Order[] }>({
    queryKey: ["admin", "orders"],
    queryFn: () => apiGet("/admin/orders"),
  });
}

export function useAdminCustomers() {
  return useQuery<{ customers: Customer[] }>({
    queryKey: ["admin", "customers"],
    queryFn: () => apiGet("/admin/customers"),
  });
}

export function useUpdateAdminMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { apiPatch } = await import("@/lib/api");
      return apiPatch(`/admin/medicines/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "medicines"] });
    },
  });
}

export function useUpdateAdminCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, blocked }: { id: string; blocked: boolean }) => {
      const { apiPatch } = await import("@/lib/api");
      return apiPatch(`/admin/customers/${id}`, { blocked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
  });
}
