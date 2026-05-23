"use client";

import { motion } from "framer-motion";
import {
  Wand2, Captions, Scissors, Upload, Sparkles, Layers,
  MonitorSmartphone, MessageSquare, Music, Mic, Smile,
  Zap, BarChart3, Globe2, Brain, Video
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Moment Detection",
    description: "Detects funny moments, reactions, arguments, viral highlights, and engagement spikes automatically.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Captions,
    title: "Animated Captions",
    description: "Auto-generated subtitles with viral caption presets, emoji highlights, and keyword animations.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Wand2,
    title: "One-Click Viral Mode",
    description: "Auto zoom, face tracking, transitions, hooks, sound effects, and meme overlays — one click.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: MonitorSmartphone,
    title: "Auto Vertical Formatting",
    description: "Instant 9:16 reformatting for TikTok, Reels, and Shorts with smart cropping and speaker tracking.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Upload,
    title: "Auto Multi-Platform Upload",
    description: "Publish directly to TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels in one click.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Scissors,
    title: "AI Silence & Dead-Air Cutter",
    description: "Automatically removes silences, dead air, and filler words for fast-paced, engaging content.",
    color: "from-red-500 to-pink-600",
  },
  {
    icon: Sparkles,
    title: "AI Hook Generator",
    description: "Generates attention-grabbing hooks for the first 3 seconds that stop the scroll.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Layers,
    title: "Multi-Version Clips",
    description: "Generate multiple variations of each clip with different styles, hooks, and lengths.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Viral Score Prediction",
    description: "AI predicts virality potential with retention scores and engagement predictions before you post.",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: MessageSquare,
    title: "Chat Integration",
    description: "Twitch and Kick chat integration to detect chat-driven viral moments and reactions.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Mic,
    title: "Voice Enhancement",
    description: "AI noise cleanup, voice enhancement, and background music integration for professional audio.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: Music,
    title: "Sound Effects & Music",
    description: "Smart sound effects, background music, and meme audio that match the mood of each clip.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: Smile,
    title: "Emotion Detection",
    description: "AI detects emotions, dramatic pauses, and storytelling peaks to find the best clip moments.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Globe2,
    title: "Multi-Language Captions",
    description: "Generate captions and translations in 50+ languages to reach global audiences.",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Bulk Processing",
    description: "Process dozens of videos simultaneously with cloud rendering and real-time progress tracking.",
    color: "from-lime-500 to-emerald-600",
  },
  {
    icon: Video,
    title: "AI Thumbnail Generator",
    description: "Auto-generate eye-catching thumbnails with AI face detection and text overlay optimization.",
    color: "from-fuchsia-500 to-purple-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-light">
            Features
          </span>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Everything You Need to{" "}
            <span className="gradient-text">Go Viral</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            From AI moment detection to automated publishing — every tool a creator needs to
            turn long-form content into scroll-stopping clips.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card hover className="h-full">
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-2.5`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
