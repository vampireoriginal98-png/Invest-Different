import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 shadow-lg shadow-amber-500/20",
        gold: "gold-gradient text-slate-950 font-semibold hover:brightness-110 shadow-lg shadow-amber-500/25 border border-amber-300/30",
        outline: "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600",
        secondary: "bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-md shadow-emerald-900/30",
        ghost: "hover:bg-slate-800/80 text-slate-300 hover:text-white",
        destructive: "bg-red-600/90 text-white hover:bg-red-500 font-medium shadow-md shadow-red-900/30",
      },
      size: {
        default: "h-10 py-2.5 px-5",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl font-semibold",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
