import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/customer/admin";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      // 401 is handled upstream now, but if it reaches here, we abort
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    } else if (response.status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (response.status >= 500) {
      toast.error("Internal Server Error. Our team has been notified.");
    } else {
      toast.error(data?.error || data?.message || "An unexpected error occurred.");
    }
    throw { response: { status: response.status, data } };
  }

  return data as T;
}

async function fetchWithAuth(endpoint: string, options: RequestInit, token?: string, _retry = false): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const localToken = window.localStorage.getItem("platino_admin_token");
    if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
  }

  options.headers = headers;
  options.credentials = "include";
  if (!options.signal) {
    options.signal = AbortSignal.timeout(15_000);
  }

  let url: string;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    url = endpoint;
  } else if (endpoint.startsWith("/api/")) {
    const origin = BASE_URL.split("/api/")[0] || "http://localhost:8000";
    url = `${origin}${endpoint}`;
  } else {
    const cleanEndpoint = endpoint.startsWith("/admin") ? endpoint.slice(6) : endpoint;
    url = `${BASE_URL}${cleanEndpoint}`;
  }

  const response = await fetch(url, options);

  if (response.status === 401 && !endpoint.includes("/auth") && !_retry) {
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        headers["Authorization"] = `Bearer ${newToken}`;
        options.headers = headers;
        return fetch(`${BASE_URL}${endpoint}`, options);
      } catch (err) {
        throw err;
      }
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" });
      if (!refreshRes.ok) throw new Error("Refresh failed");
      const refreshData = await refreshRes.json();
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem("platino_admin_token", refreshData.accessToken);
      }
      
      headers["Authorization"] = `Bearer ${refreshData.accessToken}`;
      options.headers = headers;
      
      processQueue(null, refreshData.accessToken);
      return fetch(url, options);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.localStorage.removeItem("platino_admin_token");
        window.location.href = "/login";
      }
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

export async function apiGet<T = any>(endpoint: string, token?: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method: "GET" }, token);
  return handleResponse<T>(response);
}

export async function apiPost<T = any>(endpoint: string, body: any, token?: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method: "POST", body: JSON.stringify(body) }, token);
  return handleResponse<T>(response);
}

export async function apiPut<T = any>(endpoint: string, body: any, token?: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method: "PUT", body: JSON.stringify(body) }, token);
  return handleResponse<T>(response);
}

export async function apiPatch<T = any>(endpoint: string, body: any, token?: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method: "PATCH", body: JSON.stringify(body) }, token);
  return handleResponse<T>(response);
}

export async function apiDelete<T = any>(endpoint: string, token?: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method: "DELETE" }, token);
  return handleResponse<T>(response);
}
