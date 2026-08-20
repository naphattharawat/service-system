import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "neutral" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: string;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button className={`btn ${variant} ${className}`.trim()} disabled={disabled || loading} {...rest}>
      {(icon || loading) && (
        <span
          className="material-symbols-rounded"
          style={loading ? { animation: "spin 1s linear infinite" } : undefined}
        >
          {loading ? "cached" : icon}
        </span>
      )}
      {children}
    </button>
  );
}
