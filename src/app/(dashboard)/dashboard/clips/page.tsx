"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play, Eye, Clock, Sparkles, MoreVertical, Download, Share2,
  Trash2, Edit3, Filter, SortDesc, Grid3X3, List, Search,
  Upload, FileVideo
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import { formatNumber, getViralScoreColor } from "@/lib/utils";

interface Clip {
  id: string;
  title: string;
  viralScore: number;
  views: number;
  likes: number;
  comments: number;
  status: string;
  platform: string;
  duration: string;
  moment: string;
  date: string;
  thumbnail: string;
}

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
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    fetch("/api/clips").then(r => r.json()).then(data => {
      if (data.clips) setClips(data.clips);
    }).catch(() => {});
  }, []);

  const filtered = filterStatus === "all" ? clips : clips.filter((c) => c.status === filterStatus);
  const publishedCount = clips.filter(c => c.status === "published").length;

  return (
    <>
      <Topbar title="My Clips" subtitle={clips.length > 0 ? `${clips.length} clips total · ${publishedCount} published` : "No clips yet"} />
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

        {clips.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-primary/10 p-5 mb-4">
                <FileVideo className="h-10 w-10 text-primary-light" />
              </div>
              <h3 className="text-lg font-semibold">No clips yet</h3>
              <p className="mt-2 text-sm text-muted max-w-md">
                Upload a video or paste a link to start generating viral short-form clips with AI.
              </p>
              <Link href="/dashboard/upload" className="mt-6">
                <Button size="sm">
                  <Upload className="h-4 w-4" />
                  Create Your First Clip
                </Button>
              </Link>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
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
                      {clip.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(clip.views)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className={`flex items-center gap-1 text-sm font-bold ${getViralScoreColor(clip.viralScore)}`}>
                      <Sparkles className="h-3 w-3" />
                      {clip.viralScore}%
                    </div>
                    {getStatusBadge(clip.status)}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-muted"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-muted"><Share2 className="h-3.5 w-3.5" /></Button>
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
