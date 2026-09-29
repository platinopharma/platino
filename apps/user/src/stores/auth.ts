import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface AuthState {
  /** Short-lived JWT access token — stored in localStorage */
  accessToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, user?: User | null) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user = null) => {
        if (typeof document !== "undefined") {
          document.cookie = `patient_session=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          document.cookie = `platino_patient_jwt=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        set({ accessToken, user });
      },
      setAccessToken: (accessToken) => {
        if (typeof document !== "undefined") {
          document.cookie = `patient_session=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          document.cookie = `platino_patient_jwt=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        set({ accessToken });
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        if (typeof document !== "undefined") {
          document.cookie = `patient_session=; path=/; max-age=0; SameSite=Lax`;
          document.cookie = `platino_patient_jwt=; path=/; max-age=0; SameSite=Lax`;
        }
        set({ accessToken: null, user: null });
      },
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "platino_patient_token",
      // Safely target localStorage in client browser while shielding Node.js SSR against runtime ReferenceErrors
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    },
  ),
);
