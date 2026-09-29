import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role } from "@/lib/types";

export interface AdminUser {
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthState {
  user: AdminUser | null;
  hydrated: boolean;
  login: (userData?: AdminUser) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      login: (userData?: AdminUser) => set({ user: userData }),
      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("platino_admin_token");
        }
        set({ user: null });
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "platino_admin_token",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

// Role -> allowed module keys
export const ROLE_MODULES: Record<Role, string[] | "all"> = {
  "Super Admin": "all",
  Operations: ["dashboard", "pharmacies", "inventory", "medicines", "orders", "customers", "maps", "analytics", "finance"],
  "Verification Team": ["dashboard", "verification", "pharmacies", "maps"],
  "Support Team": ["dashboard", "support", "orders", "customers", "notifications"],
  Finance: ["dashboard", "analytics", "orders", "settings", "audit", "finance"],
};

export function canAccess(role: Role | string | undefined, key: string) {
  if (!role) return false;
  
  // Map database role string to frontend display role
  const normRole = (role || "").toLowerCase();
  let mappedRole: Role = "Support Team";

  if (normRole === "superadmin" || normRole === "admin") mappedRole = "Super Admin";
  else if (normRole === "operations" || normRole === "inventory") mappedRole = "Operations";
  else if (normRole === "verification") mappedRole = "Verification Team";
  else if (normRole === "support") mappedRole = "Support Team";
  else if (normRole === "finance") mappedRole = "Finance";

  // Admins management module is strictly reserved for Super Admin
  if (key === "admins") {
    return mappedRole === "Super Admin";
  }

  const mods = ROLE_MODULES[mappedRole] || [];
  return mods === "all" || mods.includes(key);
}
