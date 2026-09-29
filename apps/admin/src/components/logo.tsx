import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({
  collapsed = false,
  variant = "default",
  className,
}: {
  collapsed?: boolean;
  variant?: "default" | "light";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-10 w-auto shrink-0 items-center">
        <Image
          src="/turtle-logo.png"
          alt="Platino Pharma Logo"
          width={120}
          height={80}
          quality={100}
          priority
          className="h-full w-auto object-contain"
        />
      </div>
      {!collapsed && (
        <div className="leading-none">
          <div
            className={cn(
              "font-display text-[16px] font-semibold tracking-tight",
              variant === "light" ? "text-white" : "text-foreground"
            )}
          >
            platino<span className={variant === "light" ? "text-emerald-200" : "text-primary"}>pharma</span>
          </div>
          <div
            className={cn(
              "mt-0.5 text-[11px] font-medium",
              variant === "light" ? "text-white/70" : "text-muted-foreground"
            )}
          >
            Operations Console
          </div>
        </div>
      )}
    </div>
  );
}
