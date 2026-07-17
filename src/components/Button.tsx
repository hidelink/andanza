import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium transition-colors hover:bg-surface-2 active:scale-[0.98] ${className}`}
      {...props}
    />
  );
}
