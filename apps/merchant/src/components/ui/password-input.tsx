"use client";

import * as React from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [capsLockActive, setCapsLockActive] = React.useState(false);

    const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState("CapsLock")) {
        setCapsLockActive(true);
      } else {
        setCapsLockActive(false);
      }
    };

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          onKeyDown={checkCapsLock}
          onKeyUp={checkCapsLock}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-1 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-ink-muted hover:text-ink transition-colors focus:outline-none"
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        {capsLockActive && (
          <div className="absolute left-0 -bottom-6 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-500 font-medium animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="size-3" /> Caps Lock is ON
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
