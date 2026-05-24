"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Eye, Clock, Sparkles, Download, Share2,
  Trash2, Grid3X3, List, Search, Upload, FileVideo,
  X, Copy, CheckCircle2, Hash, Type,
  BarChart3, MessageSquare, Heart, Volume2, Loader2
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import { formatNumber, getViralScoreColor } from "@/lib/utils";
import { getAudioFile } from "@/lib/audio-store";
import { extractClipFromBlob } from "@/lib/clip-generator";

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
  transcriptSegment?: string;
  startTime?: number;
  endTime?: number;
  videoId?: string;
  sourceUrl?: string;
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

function formatTime(ms?: number): string {
  if (!ms && ms !== 0) return "--:--";
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
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

export default function ClipsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clips, setClips] = useState<Clip[]>(loadStoredClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (clips.length > 0) return;
    fetch("/api/clips").then(r => r.json()).then(data => {
      if (data.clips) setClips(data.clips);
    }).catch(() => {});
  }, [clips.length]);

  const filtered = useMemo(() => {
    let result = clips;
    if (filterStatus !== "all") result = result.filter((c) => c.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.moment.toLowerCase().includes(q) ||
        (c.transcriptSegment && c.transcriptSegment.toLowerCase().includes(q))
      );
    }
    return result;
  }, [clips, filterStatus, searchQuery]);

  const publishedCount = clips.filter(c => c.status === "published").length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyTranscript = (clip: Clip) => {
    const text = clip.transcriptSegment || clip.title;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTitle = (clip: Clip) => {
    navigator.clipboard.writeText(clip.title);
    showToast("Title copied!");
  };

  const handleDeleteClip = (clipId: string) => {
    const updated = clips.filter(c => c.id !== clipId);
    setClips(updated);
    localStorage.setItem("clipviral_clips", JSON.stringify(updated));
    if (selectedClip?.id === clipId) setSelectedClip(null);
    showToast("Clip deleted");
  };

  const handleExportClip = (clip: Clip) => {
    const exportData = {
      title: clip.title,
      transcript: clip.transcriptSegment || "",
      viralScore: clip.viralScore,
      moment: clip.moment,
      duration: clip.duration,
      startTime: formatTime(clip.startTime),
      endTime: formatTime(clip.endTime),
      hashtags: generateHashtags(clip),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clip.title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Clip data exported!");
  };

  const handleShareClip = (clip: Clip) => {
    const text = `${clip.title}\n\nViral Score: ${clip.viralScore}%\nMoment: ${clip.moment}\n\n${clip.transcriptSegment || ""}`;
    navigator.clipboard.writeText(text);
    showToast("Clip info copied for sharing!");
  };

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, []);

  const handlePreviewClip = useCallback(async (clip: Clip) => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (clip.startTime === undefined || clip.endTime === undefined) {
      showToast("No timestamp data for this clip");
      return;
    }

    try {
      // Try client-side: read from IndexedDB (try current-source first, then sourceUrl key)
      let sourceBlob = await getAudioFile("current-source").catch(() => null);
      if (!sourceBlob && clip.sourceUrl) {
        sourceBlob = await getAudioFile(clip.sourceUrl).catch(() => null);
      }

      if (sourceBlob) {
        const clipBlob = await extractClipFromBlob(sourceBlob, clip.startTime, clip.endTime);
        const clipUrl = URL.createObjectURL(clipBlob);
        const audio = new Audio(clipUrl);
        audioRef.current = audio;
        const duration = (clip.endTime - clip.startTime) / 1000;

        audio.addEventListener("canplay", () => {
          audio.play();
          setIsPlaying(true);
          playbackTimerRef.current = setInterval(() => {
            if (audio.ended || audio.currentTime >= duration) {
              stopPlayback();
              URL.revokeObjectURL(clipUrl);
            } else {
              setPlaybackProgress((audio.currentTime / duration) * 100);
            }
          }, 100);
        }, { once: true });

        audio.addEventListener("error", () => {
          showToast("Failed to play audio");
          stopPlayback();
          URL.revokeObjectURL(clipUrl);
        }, { once: true });

        audio.load();
        return;
      }

      showToast("Source file not found. Please re-upload to enable preview.");
    } catch {
      showToast("Failed to preview clip");
      stopPlayback();
    }
  }, [isPlaying, stopPlayback]);

  const handleDownloadClip = useCallback(async (clip: Clip) => {
    if (clip.startTime === undefined || clip.endTime === undefined) {
      showToast("No timestamp data for download");
      return;
    }

    setDownloading(clip.id);
    showToast("Generating clip...");

    try {
      // Try client-side extraction from IndexedDB (current-source first, then sourceUrl key)
      let sourceBlob = await getAudioFile("current-source").catch(() => null);
      if (!sourceBlob && clip.sourceUrl) {
        sourceBlob = await getAudioFile(clip.sourceUrl).catch(() => null);
      }

      if (sourceBlob) {
        const clipBlob = await extractClipFromBlob(sourceBlob, clip.startTime, clip.endTime);
        const url = URL.createObjectURL(clipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${clip.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Clip downloaded!");
        return;
      }

      showToast("Source file not found. Please re-upload the file to enable downloads.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed";
      showToast(`Error: ${msg}`);
    } finally {
      setDownloading(null);
    }
  }, []);

  // Cleanup audio on unmount or clip change
  useEffect(() => {
    return () => stopPlayback();
  }, [selectedClip, stopPlayback]);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
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
                <div onClick={() => setSelectedClip(clip)} className="cursor-pointer">
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
                    {clip.transcriptSegment && (
                      <p className="mt-1 text-xs text-muted line-clamp-2">{clip.transcriptSegment}</p>
                    )}
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
                    <div className="mt-3 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {clip.sourceUrl && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handlePreviewClip(clip)}
                        >
                          {isPlaying && selectedClip?.id === clip.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {isPlaying && selectedClip?.id === clip.id ? "Stop" : "Preview"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleDownloadClip(clip)}
                        disabled={downloading === clip.id || !clip.sourceUrl}
                      >
                        {downloading === clip.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                        {downloading === clip.id ? "..." : "Download"}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted hover:text-red-400" onClick={() => handleDeleteClip(clip.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="space-y-2">
              {filtered.map((clip, i) => (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <div className={`flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[i % gradients.length]}`}>
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{clip.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span>{clip.moment}</span>
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
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="text-muted" onClick={() => handleCopyTranscript(clip)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted" onClick={() => handleExportClip(clip)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted" onClick={() => handleShareClip(clip)}>
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted hover:text-red-400" onClick={() => handleDeleteClip(clip.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Clip Detail Modal */}
      <AnimatePresence>
        {selectedClip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setSelectedClip(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0f14] p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-xl font-bold truncate">{selectedClip.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {getStatusBadge(selectedClip.status)}
                    <Badge className="bg-white/10">{selectedClip.moment}</Badge>
                    <Badge className="bg-white/10">{selectedClip.platform}</Badge>
                  </div>
                </div>
                <button onClick={() => setSelectedClip(null)} className="rounded-lg p-2 hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5 text-muted" />
                </button>
              </div>

              {/* Viral Score */}
              <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium">Viral Score</span>
                  </div>
                  <span className={`text-3xl font-bold ${getViralScoreColor(selectedClip.viralScore)}`}>
                    {selectedClip.viralScore}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedClip.viralScore >= 80 ? "bg-gradient-to-r from-emerald-500 to-green-400" :
                      selectedClip.viralScore >= 60 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                      "bg-gradient-to-r from-red-500 to-orange-400"
                    }`}
                    style={{ width: `${selectedClip.viralScore}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {selectedClip.viralScore >= 80 ? "High viral potential — this clip is likely to perform well!" :
                   selectedClip.viralScore >= 60 ? "Moderate viral potential — consider optimizing the hook." :
                   "Lower viral potential — try adjusting the clip boundaries or content."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted" />
                  <p className="text-sm font-bold">{selectedClip.duration}</p>
                  <p className="text-xs text-muted">Duration</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <Eye className="h-4 w-4 mx-auto mb-1 text-muted" />
                  <p className="text-sm font-bold">{formatNumber(selectedClip.views)}</p>
                  <p className="text-xs text-muted">Views</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <Heart className="h-4 w-4 mx-auto mb-1 text-muted" />
                  <p className="text-sm font-bold">{formatNumber(selectedClip.likes)}</p>
                  <p className="text-xs text-muted">Likes</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <MessageSquare className="h-4 w-4 mx-auto mb-1 text-muted" />
                  <p className="text-sm font-bold">{formatNumber(selectedClip.comments)}</p>
                  <p className="text-xs text-muted">Comments</p>
                </div>
              </div>

              {/* Clip Timeline */}
              {(selectedClip.startTime !== undefined || selectedClip.endTime !== undefined) && (
                <div className="mb-6 rounded-xl bg-white/[0.04] border border-white/10 p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Clip Timeline
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted">Start:</span>
                    <span className="font-mono font-medium">{formatTime(selectedClip.startTime)}</span>
                    <span className="text-muted mx-1">→</span>
                    <span className="text-muted">End:</span>
                    <span className="font-mono font-medium">{formatTime(selectedClip.endTime)}</span>
                  </div>
                </div>
              )}

              {/* Audio Preview & Download */}
              {(selectedClip.sourceUrl || selectedClip.startTime !== undefined) && (
                <div className="mb-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-cyan-400" />
                    Audio Preview
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => handlePreviewClip(selectedClip)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 text-primary-light" /> : <Play className="h-4 w-4 text-primary-light ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
                          style={{ width: `${playbackProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted">
                        <span>{formatTime(selectedClip.startTime)}</span>
                        <span>{formatTime(selectedClip.endTime)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownloadClip(selectedClip)}
                    disabled={downloading === selectedClip.id}
                  >
                    {downloading === selectedClip.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating clip with FFmpeg...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download Clip
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Transcript */}
              {selectedClip.transcriptSegment && (
                <div className="mb-6 rounded-xl bg-white/[0.04] border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Type className="h-4 w-4 text-purple-400" />
                      Transcript
                    </h3>
                    <button
                      onClick={() => handleCopyTranscript(selectedClip)}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                    >
                      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{selectedClip.transcriptSegment}</p>
                </div>
              )}

              {/* Suggested Hashtags */}
              <div className="mb-6 rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Hash className="h-4 w-4 text-cyan-400" />
                    Suggested Hashtags
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateHashtags(selectedClip).join(" "));
                      showToast("Hashtags copied!");
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generateHashtags(selectedClip).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { navigator.clipboard.writeText(tag); showToast(`${tag} copied!`); }}
                      className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs text-primary-light hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedClip.sourceUrl && (
                  <Button
                    size="sm"
                    onClick={() => handleDownloadClip(selectedClip)}
                    disabled={downloading === selectedClip.id}
                  >
                    {downloading === selectedClip.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {downloading === selectedClip.id ? "Generating..." : "Download"}
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => handleCopyTranscript(selectedClip)}>
                  <Copy className="h-4 w-4" />
                  Copy Text
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleShareClip(selectedClip)}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleExportClip(selectedClip)}>
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                  onClick={() => handleDeleteClip(selectedClip.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 text-sm font-medium shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function generateHashtags(clip: Clip): string[] {
  const base = ["#viral", "#fyp", "#foryou", "#trending"];
  const momentTags: Record<string, string[]> = {
    "Funny": ["#funny", "#comedy", "#lol", "#humor"],
    "Emotional": ["#emotional", "#feels", "#wholesome", "#heartwarming"],
    "Shocking": ["#shocking", "#omg", "#unbelievable", "#wow"],
    "Controversial": ["#controversial", "#debate", "#opinion", "#hottake"],
    "Debate": ["#debate", "#discussion", "#opinion"],
    "Storytelling": ["#storytime", "#story", "#narrative"],
    "Rage": ["#rage", "#angry", "#reaction"],
    "Motivational": ["#motivation", "#inspire", "#grindset", "#mindset"],
    "Stream Fail": ["#fail", "#streamfail", "#gaming"],
    "Highlight": ["#highlight", "#bestof", "#clips"],
  };

  const tags = [...base];
  if (clip.moment && momentTags[clip.moment]) {
    tags.push(...momentTags[clip.moment]);
  }
  if (clip.platform) tags.push(`#${clip.platform.toLowerCase()}`);

  return [...new Set(tags)].slice(0, 12);
}
