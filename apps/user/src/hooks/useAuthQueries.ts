'use client';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, LoginPayload, RegisterPayload, OtpPayload } from "@/services/auth";
import { useAuth } from "@/stores/auth";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { invalidateCache } from "@/app/actions";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
  });
}

export function useLoginMutation() {
  const setAuth = useAuth((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (data) => {
      // Backend returns { accessToken, user }
      if (data.accessToken) {
        setAuth(data.accessToken, data.user);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
    },
  });
}

export function useVerifyOtpMutation() {
  const setAuth = useAuth((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OtpPayload) => authService.verifyOtp(data),
    onSuccess: (data) => {
      // If backend returns a token upon OTP verification
      if (data.accessToken) {
        setAuth(data.accessToken, data.user);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
    },
  });
}

export function useLogoutMutation() {
  const clearAuth = useAuth((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Guaranteed to clear local JWT tokens and store metadata whether backend request succeeds or fails (e.g. offline)
      clearAuth();
      queryClient.clear(); // Zeroes out all sensitive cached health/order records instantly
      router.refresh();
    },
  });
}

export function useDeactivateAccountMutation() {
  const clearAuth = useAuth((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.deactivateAccount(),
    onSettled: () => {
      // Client-Side Cache & Storage Audit FIX:
      // Explicitly clear local session stores upon account deactivation
      clearAuth();
      queryClient.clear();
      localStorage.removeItem("platino_patient_token");
      sessionStorage.clear();
      
      // Purge Next.js caches
      router.refresh();
      invalidateCache('/', 'layout');
    },
  });
}

export function useForgetPasswordMutation() {
  return useMutation({
    mutationFn: (data: { email?: string; phone?: string }) => authService.forgetPassword(data),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
      authService.resetPassword(data),
  });
}

/**
 * Manually trigger a token refresh.
 * In most cases this is not needed since the axios interceptor handles
 * silent refresh automatically — but this hook is available for explicit use.
 */
export function useRefreshTokenMutation() {
  const setAccessToken = useAuth((state) => state.setAccessToken);

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data) => {
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
    },
  });
}

