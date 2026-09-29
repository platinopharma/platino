import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/axios";

interface LoginRequest {
  email: string;
  password?: string;
}

interface LoginResponse {
  accessToken?: string;
  user?: Record<string, unknown>;
  message?: string;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      return await apiPost<LoginResponse>("/auth/login", data);
    },
  });
}
