"use client";

import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Clock,
  Plus, Sparkles, Eye, Edit3, Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

const scheduledPosts = [
  { id: "1", title: "When chat said I couldn't do it", platform: "TikTok", time: "09:00 AM", date: "2026-05-25", viralScore: 95, status: "scheduled" },
  { id: "2", title: "This reaction was INSANE", platform: "Instagram", time: "12:30 PM", date: "2026-05-25", viralScore: 91, status: "scheduled" },
  { id: "3", title: "Hot take on the new meta", platform: "YouTube", time: "03:00 PM", date: "2026-05-26", viralScore: 82, status: "scheduled" },
  { id: "4", title: "The debate got heated", platform: "TikTok", time: "06:00 PM", date: "2026-05-26", viralScore: 88, status: "scheduled" },
  { id: "5", title: "Emotional moment from stream", platform: "Reels", time: "11:00 AM", date: "2026-05-27", viralScore: 86, status: "draft" },
  { id: "6", title: "Chat went absolutely crazy", platform: "Shorts", time: "02:00 PM", date: "2026-05-28", viralScore: 93, status: "scheduled" },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const optimalTimes = [
  { time: "9:00 AM", score: 92, label: "Peak TikTok" },
  { time: "12:30 PM", score: 88, label: "Peak Reels" },
  { time: "3:00 PM", score: 85, label: "Peak Shorts" },
  { time: "6:00 PM", score: 90, label: "Peak All" },
  { time: "9:00 PM", score: 87, label: "Evening Boost" },
];

export default function CalendarPage() {
  const [currentMonth] = useState(new Date(2026, 4));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = 23;

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getPostsForDay = (day: number) => {
    const dateStr = `2026-05-${day.toString().padStart(2, "0")}`;
    return scheduledPosts.filter((p) => p.date === dateStr);
  };

  return (
    <>
      <Topbar title="Content Calendar" subtitle="Schedule and manage your posting timeline" />
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">May 2026</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-muted">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  const posts = day ? getPostsForDay(day) : [];
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
                        <>
                          <span className={`text-xs font-medium ${isToday ? "text-primary-light" : "text-muted"}`}>
                            {day}
                          </span>
                          {posts.map((post, j) => (
                            <div
                              key={j}
                              className={`mt-0.5 truncate rounded px-1 py-0.5 text-[9px] font-medium ${
                                post.status === "scheduled"
                                  ? "bg-primary/20 text-primary-light"
                                  : "bg-white/5 text-muted"
                              }`}
                            >
                              {post.title}
                            </div>
                          ))}
                        </>
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
                Best posting times based on your audience analytics
              </p>
              <div className="space-y-2">
                {optimalTimes.map((t) => (
                  <div key={t.time} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      <span className="text-sm font-medium">{t.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{t.label}</span>
                      <Badge variant="success" className="text-[10px]">{t.score}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Upcoming Posts</h2>
                <Button size="sm" variant="secondary">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {scheduledPosts.slice(0, 4).map((post) => (
                  <div key={post.id} className="rounded-lg bg-white/[0.02] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{post.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                          <span>{post.platform}</span>
                          <span>{post.date}</span>
                          <span>{post.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                        <Sparkles className="h-3 w-3" />
                        {post.viralScore}%
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <Button variant="ghost" size="sm" className="text-xs text-muted flex-1">
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-muted flex-1">
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-muted">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
