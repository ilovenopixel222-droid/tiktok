import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center hero-gradient grid-bg px-4 py-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Clip<span className="gradient-text">Viral</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
