import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { useAuth } from "@/stores/auth";

// Fallback to Express backend port 8000 when API URL is not set
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Raw axios instance (NO interceptors) ─────────────────────────────────────
// Used ONLY for the /api/auth/refresh call so we never enter an infinite loop.
// withCredentials is required so the browser sends the httpOnly refreshToken cookie.
const rawAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000, // 10s silent refresh timeout to prevent hanging token queries
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Main API instance (has request + response interceptors) ──────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000, // 15s primary API network timeout to fail fast on hung connections
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // sends the httpOnly refreshToken cookie on every request
});

// ─── Refresh-queue state ──────────────────────────────────────────────────────
// These module-level variables ensure that if multiple requests fail with 401
// simultaneously, only ONE refresh call is made. All others are queued.
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(token as string);
    }
  });
  failedQueue = [];
}

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — silent refresh on 401 ────────────────────────────
api.interceptors.response.use(
  // Pass all successful responses straight through
  (response) => response,

  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    const is401 = error.response?.status === 401;
    const is500 = error.response?.status >= 500;
    const alreadyRetried = originalRequest._retry === true;

    if (is500) {
      if (typeof window !== "undefined") {
        import("sonner").then(({ toast }) => toast.error("Internal Server Error. Our team has been notified."));
      }
    }

    // We should NOT attempt to refresh if the request was the refresh endpoint itself,
    // OR if it was the login endpoint (where a 401 just means "wrong password").
    const isAuthEndpoint =
      originalRequest.url?.includes("/api/user/auth/refresh") ||
      originalRequest.url?.includes("/api/user/auth/login");

    // ── Guard: only intercept 401s that we haven't retried, and never loop
    //          on auth endpoints ──────────────────────────────────────────
    if (!is401 || alreadyRetried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    // ── Race-condition guard ───────────────────────────────────────────────
    // If a refresh is already in-flight, park this request in the queue.
    // It will be retried automatically once the refresh completes.
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      });
    }

    // ── This request becomes the one that triggers the silent refresh ─────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ── Step 2: Silent refresh ─────────────────────────────────────────
      // IMPORTANT: uses rawAxios (no interceptors attached) so a 401 from
      // the refresh endpoint does NOT re-enter this interceptor → no loop.
      // The browser automatically sends the httpOnly refreshToken cookie
      // because rawAxios was created with `withCredentials: true`.
      const { data } = await rawAxios.post<{ accessToken: string }>("/api/user/auth/refresh");
      const newAccessToken = data.accessToken;

      // ── Step 3: Persist the new access token to localStorage ─────────
      useAuth.getState().setAccessToken(newAccessToken);

      // ── Step 4: Unblock all queued requests with the fresh token ──────
      processQueue(null, newAccessToken);

      // ── Step 5: Retry the original failed request seamlessly ─────────
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      return api(originalRequest);

    } catch (refreshError) {
      // ── Refresh token expired / invalid — full logout ─────────────────
      processQueue(refreshError, null);
      useAuth.getState().clearAuth(); // wipes accessToken from localStorage
      if (typeof window !== "undefined") {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      // Do NOT reset isRefreshing = false here. By leaving it true, any subsequent
      // requests will be queued and naturally aborted when the page unloads,
      // preventing React Query from getting stuck in an infinite retry-refresh loop.
      return Promise.reject(refreshError);
    }
  },
);

/** Helper for clean JSON GET queries using the configured axios client */
export async function apiGet<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get<T>(path, config);
  return data;
}

/** Helper for clean JSON POST submissions using the configured axios client */
export async function apiPost<T = unknown>(path: string, body: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.post<T>(path, body, config);
  return data;
}

export default api;
