"use client";

import { motion } from "framer-motion";
import {
  FolderOpen, Play, Clock, Scissors, MoreVertical, Upload,
  Search, Eye, HardDrive, Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import Link from "next/link";

const videos = [
  { id: "1", title: "Stream VOD - May 22, 2026", source: "Twitch", duration: "4:23:12", size: "8.2 GB", clips: 18, date: "2026-05-22", status: "processed" },
  { id: "2", title: "Podcast Episode #47 - Tech & Gaming", source: "YouTube", duration: "2:15:34", size: "4.1 GB", clips: 12, date: "2026-05-21", status: "processed" },
  { id: "3", title: "IRL Stream - Tokyo Day 3", source: "Kick", duration: "5:45:22", size: "11.4 GB", clips: 24, date: "2026-05-20", status: "processed" },
  { id: "4", title: "Collab Stream with @Creator2", source: "Twitch", duration: "3:10:45", size: "6.3 GB", clips: 15, date: "2026-05-19", status: "processed" },
  { id: "5", title: "Reaction Video - Top 10 Fails", source: "Upload", duration: "1:22:30", size: "2.8 GB", clips: 8, date: "2026-05-18", status: "processing" },
  { id: "6", title: "Interview with Industry Expert", source: "YouTube", duration: "1:45:10", size: "3.2 GB", clips: 0, date: "2026-05-17", status: "queued" },
];

const storageUsed = 42.7;
const storageTotal = 100;

export default function LibraryPage() {
  return (
    <>
      <Topbar title="Video Library" subtitle={`${videos.length} videos · ${storageUsed} GB used`} />
      <div className="p-6 space-y-6">
        {/* Storage Overview */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-2.5">
                <HardDrive className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted">Storage Used</p>
                <p className="text-lg font-bold">{storageUsed} GB <span className="text-sm font-normal text-muted">/ {storageTotal} GB</span></p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${(storageUsed / storageTotal) * 100}%` }} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted">Total Videos</p>
                <p className="text-lg font-bold">{videos.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-2.5">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted">Total Clips Generated</p>
                <p className="text-lg font-bold">{videos.reduce((a, v) => a + v.clips, 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex-1 max-w-xs">
            <Search className="h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none"
            />
          </div>
          <Link href="/dashboard/upload">
            <Button size="sm">
              <Upload className="h-4 w-4" />
              Add Video
            </Button>
          </Link>
        </div>

        {/* Videos List */}
        <Card>
          <div className="space-y-2">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5">
                  <Play className="h-5 w-5 text-primary-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{video.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </span>
                    <span>{video.size}</span>
                    <Badge variant="outline" className="text-[10px]">{video.source}</Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {video.date}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Scissors className="h-3 w-3 text-primary-light" />
                      {video.clips}
                    </div>
                    <div className="text-[10px] text-muted">clips</div>
                  </div>
                  <Badge variant={video.status === "processed" ? "success" : video.status === "processing" ? "warning" : "outline"}>
                    {video.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="secondary" size="sm" className="text-xs">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
