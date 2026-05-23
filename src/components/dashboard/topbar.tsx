"use client";

import { Bell, Search, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { sidebarOpen } = useAppStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl px-6 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-[72px]"
      )}
    >
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search clips..."
            className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none"
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted hover:bg-white/10 hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
            3
          </span>
        </button>

        <Link href="/dashboard/upload">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Clip
          </Button>
        </Link>
      </div>
    </header>
  );
}
