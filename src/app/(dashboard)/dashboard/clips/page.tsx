"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Eye, Clock, Sparkles, MoreVertical, Download, Share2,
  Trash2, Edit3, Filter, SortDesc, Grid3X3, List, Search,
  TrendingUp, ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import { formatNumber, getViralScoreColor } from "@/lib/utils";

const clips = [
  { id: "1", title: "When chat said I couldn't do it 😂", viralScore: 95, views: 458000, likes: 34200, comments: 1840, status: "published", platform: "TikTok", duration: "0:47", moment: "Funny", date: "2026-05-22", thumbnail: "gradient-1" },
  { id: "2", title: "This reaction was INSANE", viralScore: 91, views: 312000, likes: 28100, comments: 2100, status: "published", platform: "Reels", duration: "0:34", moment: "Shocking", date: "2026-05-21", thumbnail: "gradient-2" },
  { id: "3", title: "The most emotional moment on stream", viralScore: 88, views: 0, likes: 0, comments: 0, status: "ready", platform: "Shorts", duration: "0:52", moment: "Emotional", date: "2026-05-21", thumbnail: "gradient-3" },
  { id: "4", title: "Hot take: this game is overrated", viralScore: 82, views: 0, likes: 0, comments: 0, status: "processing", platform: "TikTok", duration: "0:41", moment: "Controversial", date: "2026-05-20", thumbnail: "gradient-4" },
  { id: "5", title: "The debate got heated real quick", viralScore: 79, views: 189000, likes: 15300, comments: 3200, status: "published", platform: "Reels", duration: "0:58", moment: "Argument", date: "2026-05-20", thumbnail: "gradient-5" },
  { id: "6", title: "Chat went CRAZY when this happened", viralScore: 93, views: 521000, likes: 42000, comments: 2800, status: "published", platform: "TikTok", duration: "0:39", moment: "Chat Reaction", date: "2026-05-19", thumbnail: "gradient-6" },
  { id: "7", title: "The motivational speech nobody expected", viralScore: 86, views: 0, likes: 0, comments: 0, status: "scheduled", platform: "Shorts", duration: "0:55", moment: "Motivational", date: "2026-05-19", thumbnail: "gradient-7" },
  { id: "8", title: "Stream fail compilation #12", viralScore: 77, views: 98000, likes: 8400, comments: 920, status: "published", platform: "TikTok", duration: "0:44", moment: "Stream Fail", date: "2026-05-18", thumbnail: "gradient-8" },
  { id: "9", title: "This story had everyone in tears", viralScore: 90, views: 0, likes: 0, comments: 0, status: "draft", platform: "Reels", duration: "0:48", moment: "Storytelling", date: "2026-05-18", thumbnail: "gradient-9" },
];

const gradients = [
  "from-purple-600 to-blue-600", "from-pink-600 to-red-600", "from-cyan-600 to-blue-600",
  "from-amber-600 to-orange-600", "from-emerald-600 to-green-600", "from-violet-600 to-purple-600",
  "from-rose-600 to-pink-600", "from-teal-600 to-cyan-600", "from-indigo-600 to-violet-600",
];

function getStatusBadge(status: string) {
  switch (status) {
    case "published": return <Badge variant="success">Published</Badge>;
    case "ready": return <Badge variant="primary">Ready</Badge>;
    case "processing": return <Badge variant="warning">Processing</Badge>;
    case "scheduled": return <Badge variant="outline">Scheduled</Badge>;
    case "draft": return <Badge>Draft</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export default function ClipsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = filterStatus === "all" ? clips : clips.filter((c) => c.status === filterStatus);

  return (
    <>
      <Topbar title="My Clips" subtitle={`${clips.length} clips total · ${clips.filter(c => c.status === "published").length} published`} />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex-1 max-w-xs">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search clips..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none"
            />
          </div>

          <div className="flex gap-1.5">
            {["all", "published", "ready", "processing", "scheduled", "draft"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all capitalize cursor-pointer ${
                  filterStatus === s
                    ? "bg-primary/20 text-primary-light border border-primary/30"
                    : "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-1.5">
            <Button variant="ghost" size="sm" className="text-muted">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted">
              <SortDesc className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-2 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 transition-colors cursor-pointer ${viewMode === "list" ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Clips Grid */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((clip, i) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="overflow-hidden p-0">
                  <div className={`relative aspect-[9/12] bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                    <Play className="h-12 w-12 text-white/80" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {getStatusBadge(clip.status)}
                      <Badge className="bg-black/50 backdrop-blur-sm">{clip.moment}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <Badge className="bg-black/50 backdrop-blur-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        {clip.duration}
                      </Badge>
                      <div className={`flex items-center gap-1 rounded-lg bg-black/50 backdrop-blur-sm px-2 py-1 text-xs font-bold ${getViralScoreColor(clip.viralScore)}`}>
                        <Sparkles className="h-3 w-3" />
                        {clip.viralScore}%
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold truncate">{clip.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                      <span>{clip.platform}</span>
                      <span>{clip.date}</span>
                      {clip.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(clip.views)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <Button variant="secondary" size="sm" className="flex-1 text-xs">
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" className="flex-1 text-xs">
                        <Share2 className="h-3 w-3" />
                        Publish
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="space-y-2">
              {filtered.map((clip) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className={`flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[parseInt(clip.id) % gradients.length]}`}>
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{clip.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span>{clip.platform}</span>
                      <span>{clip.date}</span>
                      <span>{clip.duration}</span>
                      <Badge className="text-[10px]">{clip.moment}</Badge>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    {clip.views > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(clip.views)}</div>
                        <div className="text-[10px] text-muted">views</div>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 text-sm font-bold ${getViralScoreColor(clip.viralScore)}`}>
                      <TrendingUp className="h-3 w-3" />
                      {clip.viralScore}%
                    </div>
                    {getStatusBadge(clip.status)}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-muted"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-muted"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-muted"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
