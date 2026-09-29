'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/auth';
import { useRouter } from 'next/navigation';

function AuthSync() {
  const clearAuth = useAuth((s) => s.clearAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'platino-auth') {
        if (!e.newValue) {
          clearAuth();
          queryClient.clear();
          router.push('/login');
        } else {
          try {
            const data = JSON.parse(e.newValue);
            if (data?.state && !data.state.accessToken) {
              clearAuth();
              queryClient.clear();
              router.push('/login');
            }
          } catch {}
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearAuth, queryClient, router]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              const err = error as { message?: string; response?: { status?: number } };
              if (err?.message?.includes('401') || err?.response?.status === 401) return false;
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
    </QueryClientProvider>
  );
}
