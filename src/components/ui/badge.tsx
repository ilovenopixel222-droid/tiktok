import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "accent" | "primary" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-white/10 text-foreground": variant === "default",
          "bg-success/15 text-success": variant === "success",
          "bg-warning/15 text-warning": variant === "warning",
          "bg-accent/15 text-accent": variant === "accent",
          "bg-primary/15 text-primary-light": variant === "primary",
          "border border-white/20 text-foreground/70": variant === "outline",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
