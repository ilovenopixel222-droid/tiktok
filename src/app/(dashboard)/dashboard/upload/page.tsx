"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Upload, Sparkles, ArrowRight, PlayCircle, MonitorPlay,
  Monitor, Radio, FileVideo, CheckCircle2, Loader2, Settings2,
  Wand2, Brain, Clock, AlertCircle, X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

const platforms = [
  { name: "YouTube", icon: PlayCircle, color: "from-red-500 to-red-600", placeholder: "https://youtube.com/watch?v=..." },
  { name: "Twitch", icon: MonitorPlay, color: "from-purple-500 to-purple-600", placeholder: "https://twitch.tv/videos/..." },
  { name: "Kick", icon: Monitor, color: "from-green-500 to-green-600", placeholder: "https://kick.com/video/..." },
  { name: "Rumble", icon: Radio, color: "from-emerald-500 to-emerald-600", placeholder: "https://rumble.com/..." },
];

const clipSettings = [
  { label: "Clip Length", options: ["15-30s", "30-60s", "60-90s", "Custom"], default: 1 },
  { label: "Caption Style", options: ["Classic", "TikTok Viral", "Karaoke", "Minimal", "Bold"], default: 1 },
  { label: "Export Format", options: ["9:16 Vertical", "1:1 Square", "16:9 Horizontal"], default: 0 },
  { label: "AI Mode", options: ["Balanced", "Maximum Viral", "Quality Focus", "Speed"], default: 1 },
];

const momentTypes = [
  "Funny Moments", "Emotional Reactions", "Shocking Moments", "Debates & Arguments",
  "Storytelling", "Loud Reactions", "Dramatic Pauses", "Controversial Takes",
  "Motivational", "Chat Reactions", "Viral Hooks", "Engagement Spikes",
  "Stream Fails", "High-Energy", "Rage Reactions", "Podcast Highlights",
];

interface ProcessingStep {
  label: string;
  done: boolean;
}

export default function UploadPage() {
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [url, setUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [selectedMoments, setSelectedMoments] = useState<string[]>(momentTypes.slice(0, 8));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleMoment = (m: string) => {
    setSelectedMoments((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const pollJob = useCallback((jid: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        const job = data.jobs?.find((j: { id: string }) => j.id === jid);

        if (job) {
          setProgress(job.progress);

          const newSteps: ProcessingStep[] = [
            { label: "Submitting video for processing", done: job.progress >= 10 },
            { label: "Transcribing audio with AssemblyAI", done: job.progress >= 20 },
            { label: "AI analyzing for viral moments", done: job.progress >= 65 },
            { label: `Generating clips (${job.clipsFound} found)`, done: job.progress >= 80 },
            { label: "Finalizing clips", done: job.progress >= 100 },
          ];
          setSteps(newSteps);

          if (job.progress >= 100) {
            if (pollingRef.current) clearInterval(pollingRef.current);
          }

          if (job.status.startsWith("Error:")) {
            setError(job.status);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch {
        // Silently retry
      }
    }, 2000);
  }, []);

  const handleProcess = async () => {
    setError(null);
    setProcessing(true);
    setSteps([
      { label: "Submitting video for processing", done: false },
      { label: "Transcribing audio with AssemblyAI", done: false },
      { label: "AI analyzing for viral moments", done: false },
      { label: "Generating clips", done: false },
      { label: "Finalizing clips", done: false },
    ]);
    setProgress(0);

    try {
      if (mode === "link") {
        if (!url.trim()) {
          setError("Please enter a video URL");
          setProcessing(false);
          return;
        }

        const res = await fetch("/api/process-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: url,
            title: `${platforms[selectedPlatform].name} Video`,
            momentTypes: selectedMoments,
            clipLength: clipSettings[0].options[clipSettings[0].default],
            captionStyle: clipSettings[1].options[clipSettings[1].default],
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to start processing");
        }

        const data = await res.json();
        setJobId(data.jobId);
        pollJob(data.jobId);
      } else {
        if (!selectedFile) {
          setError("Please select a file");
          setProcessing(false);
          return;
        }

        // Upload file first
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Upload failed");
        }

        const uploadData = await uploadRes.json();

        // Then process it
        const appUrl = window.location.origin;
        const res = await fetch("/api/process-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: `${appUrl}${uploadData.filePath}`,
            videoId: uploadData.videoId,
            title: selectedFile.name.replace(/\.[^/.]+$/, ""),
            momentTypes: selectedMoments,
            clipLength: clipSettings[0].options[clipSettings[0].default],
            captionStyle: clipSettings[1].options[clipSettings[1].default],
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to start processing");
        }

        const data = await res.json();
        setJobId(data.jobId);
        pollJob(data.jobId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setProcessing(false);
    setSteps([]);
    setError(null);
    setJobId(null);
    setProgress(0);
    setUrl("");
    setSelectedFile(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  return (
    <>
      <Topbar title="Create Viral Clips" subtitle="Paste a link or upload a video to get started" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "link" ? "primary" : "secondary"}
            onClick={() => { setMode("link"); setError(null); }}
            className="flex-1"
          >
            <Link2 className="h-4 w-4" />
            Paste Link
          </Button>
          <Button
            variant={mode === "upload" ? "primary" : "secondary"}
            onClick={() => { setMode("upload"); setError(null); }}
            className="flex-1"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "link" ? (
            <motion.div
              key="link"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <h2 className="text-base font-semibold mb-4">Select Platform</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {platforms.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => setSelectedPlatform(i)}
                      className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all cursor-pointer ${
                        selectedPlatform === i
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className={`rounded-lg bg-gradient-to-br ${p.color} p-2`}>
                        <p.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium">{p.name}</span>
                    </button>
                  ))}
                </div>

                <Input
                  label="Video URL"
                  placeholder={platforms[selectedPlatform].placeholder}
                  icon={<Link2 className="h-4 w-4" />}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Supports VODs, livestream replays, podcasts, and uploaded videos
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-12 text-center hover:border-primary/30 transition-colors cursor-pointer"
                >
                  {selectedFile ? (
                    <>
                      <div className="rounded-2xl bg-success/10 p-4 mb-4">
                        <CheckCircle2 className="h-10 w-10 text-success" />
                      </div>
                      <h3 className="text-base font-semibold">{selectedFile.name}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-primary/10 p-4 mb-4">
                        <FileVideo className="h-10 w-10 text-primary-light" />
                      </div>
                      <h3 className="text-base font-semibold">Drop your video here</h3>
                      <p className="mt-2 text-sm text-muted">
                        or click to browse. Supports MP4, MOV, AVI, MKV, WEBM, MP3, WAV
                      </p>
                      <p className="mt-1 text-xs text-muted/60">Max file size: 10GB</p>
                      <Button variant="secondary" size="sm" className="mt-4">
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Moment Detection Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary-light" />
              <h2 className="text-base font-semibold">AI Moment Detection</h2>
            </div>
            <Badge variant="primary">AI Powered</Badge>
          </div>
          <p className="text-sm text-muted mb-4">Select the types of moments the AI should detect:</p>
          <div className="flex flex-wrap gap-2">
            {momentTypes.map((m) => (
              <button
                key={m}
                onClick={() => toggleMoment(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedMoments.includes(m)
                    ? "bg-primary/20 text-primary-light border border-primary/30"
                    : "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMoments(momentTypes)}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMoments([])}>
              Clear
            </Button>
          </div>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary-light" />
              <h2 className="text-base font-semibold">Advanced Settings</h2>
            </div>
            <ArrowRight className={`h-4 w-4 text-muted transition-transform ${showAdvanced ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-4 border-t border-white/5">
                  {clipSettings.map((setting) => (
                    <div key={setting.label}>
                      <label className="text-xs font-medium text-muted mb-2 block">
                        {setting.label}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {setting.options.map((opt, j) => (
                          <button
                            key={opt}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                              j === setting.default
                                ? "bg-primary/20 text-primary-light border border-primary/30"
                                : "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">Auto captions</span>
                    <div className="h-5 w-9 rounded-full bg-primary/40 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">Face tracking & zoom</span>
                    <div className="h-5 w-9 rounded-full bg-primary/40 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">Silence removal</span>
                    <div className="h-5 w-9 rounded-full bg-primary/40 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">AI hook generation</span>
                    <div className="h-5 w-9 rounded-full bg-primary/40 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">Sound effects</span>
                    <div className="h-5 w-9 rounded-full bg-white/20 relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/40" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">Background music</span>
                    <div className="h-5 w-9 rounded-full bg-white/20 relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/40" />
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Process Button */}
        {!processing ? (
          <Button
            onClick={handleProcess}
            size="xl"
            glow
            className="w-full"
          >
            <Wand2 className="h-5 w-5" />
            Create Viral Clips
            <Sparkles className="h-4 w-4" />
          </Button>
        ) : (
          <Card glow>
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-light">
                {progress >= 100 ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {progress >= 100 ? "Processing Complete!" : "AI Processing Your Content"}
              </div>

              <div className="space-y-3">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {s.done ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-white/20 shrink-0" />
                    )}
                    <span className={s.done ? "text-foreground" : "text-muted"}>
                      {s.label}
                    </span>
                    {s.done && <Badge variant="success" className="ml-auto">Done</Badge>}
                  </div>
                ))}
              </div>

              <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>

              {progress >= 100 ? (
                <div className="mt-4 flex gap-3 justify-center">
                  <a href="/dashboard/clips">
                    <Button size="sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      View Generated Clips
                    </Button>
                  </a>
                  <Button variant="secondary" size="sm" onClick={resetForm}>
                    Process Another Video
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted">
                  <Clock className="h-3 w-3" />
                  Processing... This may take a few minutes depending on video length.
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
