"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 backdrop-blur-sm transition-all duration-200",
              "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
              "hover:border-white/20",
              icon && "pl-10",
              error && "border-accent/50 focus:border-accent focus:ring-accent/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
