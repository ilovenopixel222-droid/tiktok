import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, hover, glow }: CardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6",
        hover && "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        glow && "glow-purple",
        className
      )}
    >
      {children}
    </div>
  );
}
