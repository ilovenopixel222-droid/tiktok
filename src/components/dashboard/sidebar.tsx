"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Scissors, Upload, FolderOpen, BarChart3,
  Calendar, Settings, Zap, Bot, Bell, Crown, LogOut, ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const mainNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload / Paste" },
  { href: "/dashboard/clips", icon: Scissors, label: "My Clips" },
  { href: "/dashboard/library", icon: FolderOpen, label: "Video Library" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Content Calendar" },
  { href: "/dashboard/automation", icon: Bot, label: "Automation" },
];

const bottomNav = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-white/5 bg-[#0a0520]/95 backdrop-blur-xl transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[72px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-foreground">
              Clip<span className="gradient-text">Viral</span>
            </span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary-light border border-primary/20"
                      : "text-muted hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-light")} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/5 px-3 py-4 space-y-1">
        {sidebarOpen && (
          <div className="mb-3 mx-1 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-light">
              <Crown className="h-3.5 w-3.5" />
              Pro Plan
            </div>
            <p className="mt-1 text-[10px] text-muted">73/100 clips used this month</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[73%] rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>
        )}
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/15 text-primary-light"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-foreground transition-all">
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </div>

      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
            IC
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Isaac Creator</div>
              <div className="truncate text-xs text-muted">isaac@clipviral.ai</div>
            </div>
          )}
          {sidebarOpen && (
            <Bell className="ml-auto h-4 w-4 shrink-0 text-muted hover:text-foreground cursor-pointer" />
          )}
        </div>
      </div>
    </aside>
  );
}
