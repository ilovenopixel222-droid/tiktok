"use client";

import { useState } from "react";
import {
  ChevronLeft, ChevronRight,
  Plus, Sparkles, Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/topbar";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  return (
    <>
      <Topbar title="Content Calendar" subtitle="Schedule and manage your posting timeline" />
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{monthName} {year}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-muted">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  const isToday = day === today;
                  return (
                    <div
                      key={i}
                      className={`relative min-h-[80px] rounded-lg border p-1.5 transition-colors ${
                        day
                          ? isToday
                            ? "border-primary/40 bg-primary/5"
                            : "border-white/5 hover:border-white/10 cursor-pointer"
                          : "border-transparent"
                      }`}
                    >
                      {day && (
                        <span className={`text-xs font-medium ${isToday ? "text-primary-light" : "text-muted"}`}>
                          {day}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Optimal Times */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary-light" />
                <h2 className="text-base font-semibold">AI Optimal Times</h2>
              </div>
              <p className="text-xs text-muted mb-3">
                Optimal posting times will be calculated once you publish clips and gather audience data.
              </p>
              <div className="flex items-center justify-center py-6 text-sm text-muted">
                No data yet
              </div>
            </Card>

            {/* Upcoming */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Upcoming Posts</h2>
                <Link href="/dashboard/upload">
                  <Button size="sm" variant="secondary">
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-2xl bg-primary/10 p-3 mb-3">
                  <CalendarIcon className="h-6 w-6 text-primary-light" />
                </div>
                <p className="text-sm text-muted">No scheduled posts</p>
                <p className="mt-1 text-xs text-muted/60">
                  Generate clips first, then schedule them for publishing.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
