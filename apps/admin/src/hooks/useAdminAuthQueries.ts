import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiPost("/admin/auth/login", data);
    },
  });
}

export function useAdminForgotPwdMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiPost("/admin/auth/forgot-password", data);
    },
  });
}

export function useAdminVerifyOtpMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiPost("/admin/auth/verify-otp", data);
    },
  });
}

export function useAdminResetPwdMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiPost("/admin/auth/reset-password", data);
    },
  });
}
