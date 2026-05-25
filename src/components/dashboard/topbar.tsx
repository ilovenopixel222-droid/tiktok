"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { sidebarOpen } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/dashboard/clips?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const notifications = [
    { id: 1, text: "Welcome to ClipViral!", time: "Just now", unread: true },
    { id: 2, text: "Upload a video to get started", time: "1m ago", unread: true },
    { id: 3, text: "Connect your TikTok account", time: "5m ago", unread: true },
  ];

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-muted hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
              {notifications.filter(n => n.unread).length}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-[#0a0520] shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold">Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}>
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-white/5 text-center">
                <Link href="/dashboard/settings" className="text-xs text-primary-light hover:underline" onClick={() => setShowNotifications(false)}>
                  Manage Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

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
