"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Scissors, Eye, TrendingUp, Zap, ArrowUpRight, Play,
  Clock, BarChart3, Sparkles, Upload, FileVideo
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import { formatNumber } from "@/lib/utils";

interface Clip {
  id: string;
  title: string;
  viralScore: number;
  views: number;
  status: string;
  platform: string;
  duration: string;
  moment: string;
}

interface ProcessingJob {
  id: string;
  title: string;
  progress: number;
  clipsFound: number;
  status: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "published": return <Badge variant="success">Published</Badge>;
    case "ready": return <Badge variant="primary">Ready</Badge>;
    case "processing": return <Badge variant="warning">Processing</Badge>;
    case "scheduled": return <Badge variant="outline">Scheduled</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

function loadStoredClips(): Clip[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("clipviral_clips");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function computeStats(clipsData: Clip[]) {
  return {
    totalClips: clipsData.length,
    totalViews: clipsData.reduce((a, c) => a + (c.views || 0), 0),
    avgViralScore: clipsData.length > 0
      ? Math.round(clipsData.reduce((a, c) => a + (c.viralScore || 0), 0) / clipsData.length)
      : 0,
    thisMonth: clipsData.length,
  };
}

export default function DashboardPage() {
  const [clips, setClips] = useState<Clip[]>(loadStoredClips);
  const [jobs] = useState<ProcessingJob[]>([]);
  const stats = useMemo(() => computeStats(clips), [clips]);

  useEffect(() => {
    if (clips.length > 0) return;
    // Fallback: try API
    fetch("/api/clips").then(r => r.json()).then(data => {
      if (data.clips && data.clips.length > 0) {
        setClips(data.clips);
      }
    }).catch(() => {});
  }, [clips.length]);

  const statCards = [
    { label: "Total Clips", value: stats.totalClips, icon: Scissors, color: "from-purple-500 to-violet-600" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "from-cyan-500 to-blue-600" },
    { label: "Viral Score Avg", value: stats.avgViralScore, icon: TrendingUp, color: "from-emerald-500 to-green-600", suffix: "%" },
    { label: "This Month", value: stats.thisMonth, icon: Zap, color: "from-amber-500 to-orange-600" },
  ];

  return (
    <>
      <Topbar title="Dashboard" subtitle="Welcome back! Here's your content overview." />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">
                      {typeof stat.value === "number" && stat.value > 999
                        ? formatNumber(stat.value)
                        : stat.value}
                      {stat.suffix || ""}
                    </p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/[0.02] to-transparent" />
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Clips */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Recent Clips</h2>
                <Link href="/dashboard/clips">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              {clips.length > 0 ? (
                <div className="space-y-3">
                  {clips.slice(0, 5).map((clip) => (
                    <Link
                      href="/dashboard/clips"
                      key={clip.id}
                      className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5">
                        <Play className="h-4 w-4 text-primary-light" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{clip.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {clip.duration}
                          </span>
                          <span>{clip.platform}</span>
                          {clip.views > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(clip.views)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                            <Sparkles className="h-3 w-3" />
                            {clip.viralScore}%
                          </div>
                          <div className="text-[10px] text-muted">Viral Score</div>
                        </div>
                        {getStatusBadge(clip.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-2xl bg-primary/10 p-4 mb-4">
                    <FileVideo className="h-8 w-8 text-primary-light" />
                  </div>
                  <h3 className="text-sm font-semibold">No clips yet</h3>
                  <p className="mt-1 text-xs text-muted max-w-xs">
                    Upload your first video or paste a link to start generating viral clips with AI.
                  </p>
                  <Link href="/dashboard/upload" className="mt-4">
                    <Button size="sm">
                      <Upload className="h-3.5 w-3.5" />
                      Create Your First Clip
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Processing & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-base font-semibold mb-4">Processing Queue</h2>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <div key={job.id || i} className="rounded-xl bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{job.title}</span>
                        <span className="shrink-0 text-xs text-primary-light">{job.progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 1, delay: i * 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <span>{job.status}</span>
                        <span>{job.clipsFound} clips found</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No active processing jobs.</p>
              )}
            </Card>

            <Card>
              <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/upload">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    <Zap className="h-3.5 w-3.5" />
                    New Clip
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/calendar">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    Schedule
                  </Button>
                </Link>
                <Link href="/dashboard/clips">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    <Scissors className="h-3.5 w-3.5" />
                    My Clips
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
