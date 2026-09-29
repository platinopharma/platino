import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";

// Resolve API base URL cleanly for Next.js same-origin or dedicated backend deployment
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/**
 * Standardized API client for Customer / Partner Frontend with automated
 * credentials forwarding and unified interceptors.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000, // 15s network timeout
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // If client authentication token exists in storage/cookie, attach Authorization header
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("platino_merchant_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor & Unified Error Normalization ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const is401 = error.response?.status === 401;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/") || originalRequest?.url?.includes("/login");

    if (is401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem("platino_merchant_token", data.accessToken);
        }
        
        api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        
        processQueue(null, data.accessToken);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("platino_merchant_token");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        // Do NOT reset isRefreshing = false here. By leaving it true, any subsequent
        // requests will be queued and naturally aborted when the page unloads,
        // preventing React Query from getting stuck in an infinite retry-refresh loop.
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status && error.response.status >= 500) {
      if (typeof window !== "undefined") {
        import("sonner").then(({ toast }) => toast.error("Internal Server Error. Our team has been notified."));
      }
    }

    // Normalize error message for seamless UI integration
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred.";

    return Promise.reject(new Error(errorMessage));
  },
);

/** Helper for clean JSON POST submissions using the configured axios client */
export async function apiPost<T = unknown>(path: string, body: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.post<T>(path, body, config);
  return data;
}

/** Helper for clean JSON GET queries using the configured axios client */
export async function apiGet<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get<T>(path, config);
  return data;
}

/** Helper for clean JSON PUT requests using the configured axios client */
export async function apiPut<T = unknown>(path: string, body: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.put<T>(path, body, config);
  return data;
}

/** Helper for clean JSON DELETE requests using the configured axios client */
export async function apiDelete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.delete<T>(path, config);
  return data;
}
