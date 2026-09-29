import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  adminStatus: "active" | "suspended" | "deactivated";
  isSuperAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminInvitationItem {
  id: string;
  name: string;
  email: string;
  requestedRole: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  status: "pending" | "approved" | "expired" | "rejected";
  createdAt: string;
  expiresAt: string;
  otpAttempts: number;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetId?: string;
  targetType?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  createdAt: string;
}

export function useAdminUsers() {
  return useQuery<{ success: boolean; data: AdminUserItem[] }>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await apiGet<any>("/api/v1/admin/users");
      const list = res?.data || res?.admins || [];
      return { success: true, data: list };
    },
    staleTime: 5000,
  });
}

export function useAdminInvitations() {
  return useQuery<{ success: boolean; data: AdminInvitationItem[] }>({
    queryKey: ["admin", "invitations"],
    queryFn: async () => {
      const res = await apiGet<any>("/api/v1/admin/users/invitations");
      const list = res?.data || res?.invitations || [];
      return { success: true, data: list };
    },
    staleTime: 5000,
  });
}

export function useInviteAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; role: string }) =>
      apiPost<{ success: boolean; invitationId: string; message: string; approvalEmail: string }>(
        "/api/v1/admin/users/invite",
        body
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invitations"] });
    },
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invitationId, otp }: { invitationId: string; otp: string }) =>
      apiPost<{ success: boolean; user: AdminUserItem; message: string }>(
        `/api/v1/admin/users/invitations/${invitationId}/verify-otp`,
        { otp }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "invitations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "auditLogs"] });
    },
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiPost<{ success: boolean; message: string }>(
        `/api/v1/admin/users/invitations/${invitationId}/resend-otp`,
        {}
      ),
  });
}

export function useUpdateAdminStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "suspended" | "deactivated" }) =>
      apiPatch<{ success: boolean; message: string }>(`/api/v1/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "auditLogs"] });
    },
  });
}

export function useUpdateAdminRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiPatch<{ success: boolean; message: string }>(`/api/v1/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "auditLogs"] });
    },
  });
}

export function useRevokeAdminSessionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean; message: string }>(`/api/v1/admin/users/${id}/revoke-sessions`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "auditLogs"] });
    },
  });
}

export function useAdminAuditLogs(action?: string) {
  const endpoint = action ? `/api/v1/admin/audit-logs?action=${encodeURIComponent(action)}` : "/api/v1/admin/audit-logs";
  return useQuery<{ success: boolean; data: AuditLogItem[] }>({
    queryKey: ["admin", "auditLogs", action],
    queryFn: async () => {
      const res = await apiGet<any>(endpoint);
      const list = res?.data || res?.logs || [];
      return { success: true, data: list };
    },
    staleTime: 5000,
  });
}
