import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "gold";
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = "info", children, ...props }: BadgeProps) {
  const variants = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    gold: "bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
