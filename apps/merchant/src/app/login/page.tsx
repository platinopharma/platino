import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Partner Sign In | Platino Pharmacy",
  description: "Secure authentication portal and onboarding application recovery for registered pharmacy partners and healthcare providers.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-paper font-sans text-ink antialiased">
      <LoginClient />
    </main>
  );
}
