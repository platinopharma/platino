"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("platino_merchant_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, router, pathname]);

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-subtle" />
      </div>
    );
  }

  return <>{children}</>;
}
