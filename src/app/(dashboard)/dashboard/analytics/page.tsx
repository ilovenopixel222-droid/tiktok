"use client";

import { motion } from "framer-motion";
import {
  Eye, TrendingUp, Heart, MessageSquare, Share2, BarChart3,
  ArrowUpRight, ArrowDownRight, Sparkles, Users, Globe2, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import { formatNumber } from "@/lib/utils";

const overviewStats = [
  { label: "Total Views", value: 2_430_000, change: 24, up: true, icon: Eye, color: "from-cyan-500 to-blue-600" },
  { label: "Engagement Rate", value: "8.4%", change: 12, up: true, icon: Heart, color: "from-pink-500 to-rose-600" },
  { label: "New Followers", value: 12_400, change: 32, up: true, icon: Users, color: "from-emerald-500 to-green-600" },
  { label: "Viral Clips", value: 23, change: 5, up: true, icon: Sparkles, color: "from-purple-500 to-violet-600" },
  { label: "Avg. Retention", value: "72%", change: 3, up: true, icon: Clock, color: "from-amber-500 to-orange-600" },
  { label: "Avg. Viral Score", value: 87, change: 2, up: true, icon: TrendingUp, color: "from-teal-500 to-cyan-600" },
];

const platformData = [
  { platform: "TikTok", views: 1_240_000, clips: 42, engagement: "9.2%", followers: "+4,200", color: "from-pink-500 to-red-500" },
  { platform: "Instagram Reels", views: 680_000, clips: 35, engagement: "7.8%", followers: "+3,100", color: "from-purple-500 to-pink-500" },
  { platform: "YouTube Shorts", views: 390_000, clips: 28, engagement: "6.4%", followers: "+2,800", color: "from-red-500 to-orange-500" },
  { platform: "Facebook Reels", views: 120_000, clips: 15, engagement: "5.1%", followers: "+1,300", color: "from-blue-500 to-indigo-500" },
];

const topClips = [
  { title: "Chat went CRAZY 🤯", views: 521000, score: 95, platform: "TikTok" },
  { title: "When chat said I couldn't do it 😂", views: 458000, score: 93, platform: "TikTok" },
  { title: "This reaction was INSANE", views: 312000, score: 91, platform: "Reels" },
  { title: "The debate got heated", views: 189000, score: 88, platform: "Reels" },
  { title: "Stream fail compilation", views: 98000, score: 82, platform: "Shorts" },
];

const weeklyData = [
  { day: "Mon", views: 42000 },
  { day: "Tue", views: 58000 },
  { day: "Wed", views: 34000 },
  { day: "Thu", views: 89000 },
  { day: "Fri", views: 120000 },
  { day: "Sat", views: 95000 },
  { day: "Sun", views: 78000 },
];

const maxViews = Math.max(...weeklyData.map((d) => d.views));

export default function AnalyticsPage() {
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
                <div className={`mt-1 flex items-center gap-1 text-xs ${stat.up ? "text-success" : "text-accent"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  +{stat.change}%
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold">Views This Week</h2>
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
              <div className="flex items-end gap-3 h-48">
                {weeklyData.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-muted">{formatNumber(d.views)}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.views / maxViews) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary min-h-[4px]"
                    />
                    <span className="text-xs text-muted">{d.day}</span>
                  </div>
                ))}
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
            <div className="space-y-3">
              {topClips.map((clip, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-2.5">
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
                    {clip.score}
                  </div>
                </div>
              ))}
            </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformData.map((p, i) => (
              <motion.div
                key={p.platform}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-white/[0.02] border border-white/5 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${p.color}`} />
                  <span className="text-sm font-semibold">{p.platform}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Views</span>
                    <span className="font-medium">{formatNumber(p.views)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Clips</span>
                    <span className="font-medium">{p.clips}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Engagement</span>
                    <span className="font-medium text-success">{p.engagement}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Followers</span>
                    <span className="font-medium text-primary-light">{p.followers}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Likes", value: 284000, icon: Heart, color: "text-pink-400" },
            { label: "Comments", value: 18400, icon: MessageSquare, color: "text-cyan-400" },
            { label: "Shares", value: 42000, icon: Share2, color: "text-emerald-400" },
            { label: "Saves", value: 31000, icon: BarChart3, color: "text-amber-400" },
          ].map((m) => (
            <Card key={m.label}>
              <div className="flex items-center gap-3">
                <m.icon className={`h-5 w-5 ${m.color}`} />
                <div>
                  <p className="text-xs text-muted">{m.label}</p>
                  <p className="text-lg font-bold">{formatNumber(m.value)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
