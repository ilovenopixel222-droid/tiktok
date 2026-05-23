"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye, TrendingUp, Heart, MessageSquare, Share2, BarChart3,
  Sparkles, Users, Globe2, Clock, Upload
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/topbar";
import { formatNumber } from "@/lib/utils";

interface Clip {
  id: string;
  title: string;
  views: number;
  viralScore: number;
  platform: string;
}

export default function AnalyticsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetch("/api/clips").then(r => r.json()).then(data => {
      if (data.clips && data.clips.length > 0) {
        setClips(data.clips);
        setHasData(true);
      }
    }).catch(() => {});
  }, []);

  const totalViews = clips.reduce((a, c) => a + (c.views || 0), 0);
  const avgViralScore = clips.length > 0 ? Math.round(clips.reduce((a, c) => a + (c.viralScore || 0), 0) / clips.length) : 0;

  const overviewStats = [
    { label: "Total Views", value: totalViews, icon: Eye, color: "from-cyan-500 to-blue-600" },
    { label: "Engagement Rate", value: "0%", icon: Heart, color: "from-pink-500 to-rose-600" },
    { label: "New Followers", value: 0, icon: Users, color: "from-emerald-500 to-green-600" },
    { label: "Viral Clips", value: clips.length, icon: Sparkles, color: "from-purple-500 to-violet-600" },
    { label: "Avg. Retention", value: "0%", icon: Clock, color: "from-amber-500 to-orange-600" },
    { label: "Avg. Viral Score", value: avgViralScore, icon: TrendingUp, color: "from-teal-500 to-cyan-600" },
  ];

  if (!hasData) {
    return (
      <>
        <Topbar title="Analytics" subtitle="Track your content performance across all platforms" />
        <div className="p-6">
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-primary/10 p-5 mb-4">
                <BarChart3 className="h-10 w-10 text-primary-light" />
              </div>
              <h3 className="text-lg font-semibold">No analytics data yet</h3>
              <p className="mt-2 text-sm text-muted max-w-md">
                Upload videos and generate clips to start seeing analytics. Performance data will appear here once your clips are published.
              </p>
              <Link href="/dashboard/upload" className="mt-6">
                <Button size="sm">
                  <Upload className="h-4 w-4" />
                  Upload Your First Video
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Analytics" subtitle="Track your content performance across all platforms" />
      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {overviewStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-1.5`}>
                    <stat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-[11px] text-muted">{stat.label}</span>
                </div>
                <div className="text-xl font-bold">
                  {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart placeholder */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold">Views Over Time</h2>
                <div className="flex gap-1.5">
                  {["7D", "30D", "90D", "1Y"].map((p, i) => (
                    <button
                      key={p}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                        i === 0
                          ? "bg-primary/20 text-primary-light border border-primary/30"
                          : "bg-white/5 text-muted hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center h-48 text-sm text-muted">
                Analytics chart will populate as clips get views
              </div>
            </Card>
          </div>

          {/* Top Clips */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Top Performing</h2>
              <Badge variant="primary">
                <TrendingUp className="mr-1 h-3 w-3" />
                Hot
              </Badge>
            </div>
            {clips.length > 0 ? (
              <div className="space-y-3">
                {clips.slice(0, 5).map((clip, i) => (
                  <div key={clip.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold text-primary-light">
                      #{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{clip.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                        <span>{formatNumber(clip.views)} views</span>
                        <span>{clip.platform}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      {clip.viralScore}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-8">No clips to rank yet</p>
            )}
          </Card>
        </div>

        {/* Platform Breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary-light" />
              <h2 className="text-base font-semibold">Platform Breakdown</h2>
            </div>
          </div>
          <div className="flex items-center justify-center py-8 text-sm text-muted">
            Platform performance data will appear once you publish clips to social media
          </div>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Likes", value: 0, icon: Heart, color: "text-pink-400" },
            { label: "Comments", value: 0, icon: MessageSquare, color: "text-cyan-400" },
            { label: "Shares", value: 0, icon: Share2, color: "text-emerald-400" },
            { label: "Saves", value: 0, icon: BarChart3, color: "text-amber-400" },
          ].map((m) => (
            <Card key={m.label}>
              <div className="flex items-center gap-3">
                <m.icon className={`h-5 w-5 ${m.color}`} />
                <div>
                  <p className="text-lg font-bold">{formatNumber(m.value)}</p>
                  <p className="text-xs text-muted">{m.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
