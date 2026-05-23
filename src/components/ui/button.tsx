"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "accent" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", glow, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]":
              variant === "primary",
            "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20":
              variant === "secondary",
            "text-foreground hover:bg-white/5": variant === "ghost",
            "border border-primary/30 text-primary-light hover:bg-primary/10 hover:border-primary/50":
              variant === "outline",
            "bg-gradient-to-r from-accent to-pink-500 text-white hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02]":
              variant === "accent",
            "glass text-foreground hover:bg-white/10": variant === "glass",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-7 py-3 text-base": size === "lg",
            "px-9 py-4 text-lg": size === "xl",
          },
          glow && variant === "primary" && "glow-purple",
          glow && variant === "accent" && "glow-accent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
