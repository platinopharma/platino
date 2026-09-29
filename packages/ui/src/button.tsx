import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", style, ...props }: ButtonProps) {
  const colors =
    variant === "primary"
      ? { background: "#2563eb", color: "#fff" }
      : { background: "#e5e7eb", color: "#111827" };

  return (
    <button
      type="button"
      style={{
        border: "none",
        borderRadius: 6,
        padding: "8px 16px",
        cursor: "pointer",
        ...colors,
        ...style,
      }}
      {...props}
    />
  );
}
