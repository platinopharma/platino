import { api } from "@/lib/axios";

// ─── Request payload types ────────────────────────────────────────────────────

export interface LoginPayload {
  email?: string;
  phone?: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface OtpPayload {
  email?: string;
  phone?: string;
  otp: string;
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface AuthResponse {
  message?: string;
  /** Short-lived JWT returned by login / OTP verification */
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
}

// ─── Service functions ────────────────────────────────────────────────────────

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/user/auth/register", data);
    return response.data;
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/user/auth/login", data);
    return response.data;
  },

  async verifyOtp(data: OtpPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/user/auth/verify-otp", data);
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/api/user/auth/logout");
    return response.data;
  },

  async deactivateAccount(): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>("/api/customer/v1/profile/deactivate");
    return response.data;
  },

  async forgetPassword(data: { email?: string; phone?: string }): Promise<{ message: string }> {
    // Backend route is /forgot-password
    const response = await api.post<{ message: string }>("/api/user/auth/forgot-password", data);
    return response.data;
  },

  async resetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/api/user/auth/reset-password", data);
    return response.data;
  },

  /**
   * Silently refreshes the access token using the httpOnly refreshToken cookie.
   * The axios interceptor calls this automatically on 401 — you usually do not
   * need to call this manually.
   */
  async refreshToken(): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>("/api/user/auth/refresh");
    return response.data;
  },
};

