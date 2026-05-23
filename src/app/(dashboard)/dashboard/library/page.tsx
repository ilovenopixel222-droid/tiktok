"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Play, Clock, Scissors, MoreVertical, Upload,
  Search, Eye, HardDrive, Calendar, FileVideo
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

interface Video {
  id: string;
  title: string;
  source: string;
  duration: string;
  size: string;
  clips: number;
  date: string;
  status: string;
}

export default function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetch("/api/videos").then(r => r.json()).then(data => {
      if (data.videos) setVideos(data.videos);
    }).catch(() => {});
  }, []);

  const totalClips = videos.reduce((a, v) => a + (v.clips || 0), 0);

  return (
    <>
      <Topbar title="Video Library" subtitle={videos.length > 0 ? `${videos.length} videos` : "Your video library"} />
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
                <p className="text-lg font-bold">0 GB <span className="text-sm font-normal text-muted">/ 100 GB</span></p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: "0%" }} />
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
                <p className="text-lg font-bold">{totalClips}</p>
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
        {videos.length > 0 ? (
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
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-primary/10 p-5 mb-4">
                <FileVideo className="h-10 w-10 text-primary-light" />
              </div>
              <h3 className="text-lg font-semibold">Your video library is empty</h3>
              <p className="mt-2 text-sm text-muted max-w-md">
                Upload a video or paste a link to get started. Your uploaded videos and generated clips will appear here.
              </p>
              <Link href="/dashboard/upload" className="mt-6">
                <Button size="sm">
                  <Upload className="h-4 w-4" />
                  Upload Your First Video
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
