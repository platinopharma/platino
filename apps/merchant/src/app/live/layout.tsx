import type { Metadata } from "next";
import { AppShell } from "@/features/live/app-shell";
import { AuthGuard } from "@/features/auth/auth-guard";

export const metadata: Metadata = {
  title: {
    template: "%s | Platino Partner Portal",
    default: "Partner Operations Portal | Platino Pharma",
  },
  description:
    "Operate your Platino Pharma store: orders, inventory, delivery, analytics, and settings — all in one secure operational portal.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/live" },
};

export const dynamic = 'force-dynamic'; // Prevent edge proxy caching of merchant operating metrics

export default function LiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
