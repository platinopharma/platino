import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { Pharmacy } from "@/lib/types";

export function useVerificationListQuery() {
  return useQuery({
    queryKey: ["admin-verification-list"],
    queryFn: async () => {
      const res = await apiGet<{ pharmacies: Pharmacy[] }>("/admin/verification/list");
      return res.pharmacies;
    },
  });
}

export function useApproveVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId: string) => {
      return await apiPost("/admin/verification/approve", { registrationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pharmacies"] });
    },
  });
}

export function useRejectVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      return await apiPost("/admin/verification/reject", { registrationId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-list"] });
    },
  });
}

export function useRequestDocsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      return await apiPost("/admin/verification/request-docs", { registrationId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-list"] });
    },
  });
}

export function useSuspendMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      return await apiPost("/admin/verification/suspend", { registrationId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-list"] });
    },
  });
}

export function useBlacklistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      return await apiPost("/admin/verification/blacklist", { registrationId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-list"] });
    },
  });
}
