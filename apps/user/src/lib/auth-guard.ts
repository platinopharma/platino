import { redirect } from "next/navigation";
import { useAuth } from "@/stores/auth";

export function requireAuth(returnUrl?: string) {
  if (!useAuth.getState().accessToken) {
    redirect(`/login${returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : ""}`);
  }
}
