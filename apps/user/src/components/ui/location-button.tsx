'use client';
import { Navigation, Loader2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface LocationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onLocationFound?: (address: string) => void;
  onDone?: () => void;
  variant?: "row" | "chip" | "default" | "outline" | "secondary" | "ghost" | "link";
}

export function LocationButton({ onLocationFound, onDone, className, variant = "row", ...props }: LocationButtonProps) {
  const { requestLocation, detecting, address } = useGeolocation();

  useEffect(() => {
    if (address && onLocationFound) {
      onLocationFound(address.formattedAddress);
    }
  }, [address, onLocationFound]);

  const handle = () => {
    requestLocation();
    onDone?.();
  };

  // Keep backwards compatibility for the custom Navbar UI variants
  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={detecting || props.disabled}
        className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary disabled:opacity-70", className)}
        {...props}
      >
        {detecting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Navigation className="h-3.5 w-3.5" />
        )}
        {detecting ? "Detecting…" : "Use my location"}
      </button>
    );
  }
  
  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={detecting || props.disabled}
        className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft disabled:opacity-70", className)}
        {...props}
      >
        {detecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        {detecting ? "Detecting your location…" : "Use my current location"}
      </button>
    );
  }

  // Generic fallback for other uses
  return (
    <button
      type="button"
      onClick={handle}
      disabled={detecting || props.disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {detecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4" />
      )}
      {detecting ? "Locating..." : "Use Current Location"}
    </button>
  );
}
