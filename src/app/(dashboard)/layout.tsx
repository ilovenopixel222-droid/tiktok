"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-[72px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
