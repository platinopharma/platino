'use client';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-1/4 w-full h-full bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-full h-full bg-mint/10 blur-[100px] rounded-full pointer-events-none" />

      <Link href="/" className="mb-8 z-10 flex items-center gap-2">
        <span className="font-display text-3xl font-bold tracking-tight">
          <span className="text-foreground">Platino </span>
          <span className="text-primary">Pharma</span>
        </span>
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="glass-strong rounded-3xl p-8 shadow-elevated w-full relative overflow-hidden">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
