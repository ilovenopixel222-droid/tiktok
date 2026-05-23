"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Clips Generated", value: "2.4M+" },
  { label: "Active Creators", value: "50K+" },
  { label: "Views Generated", value: "8.7B+" },
  { label: "Avg. Viral Score", value: "87%" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden hero-gradient grid-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20 lg:pt-44">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="primary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Clip Engine
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-5xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Turn Long Content Into{" "}
            <span className="gradient-text">Viral Clips</span>{" "}
            Automatically
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted sm:text-xl"
          >
            Paste any YouTube, Twitch, Kick, or Rumble link. Our AI finds the best moments,
            edits them into scroll-stopping clips, and posts them everywhere — fully automated.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/signup">
              <Button size="xl" glow className="group">
                <Zap className="h-5 w-5" />
                Start Clipping Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="glass" size="xl" className="group">
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex items-center gap-2 text-sm text-muted"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-secondary/40"
                />
              ))}
            </div>
            <span>Trusted by 50,000+ creators worldwide</span>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mt-16 w-full max-w-5xl"
          >
            <div className="gradient-border overflow-hidden rounded-2xl">
              <div className="relative aspect-video bg-gradient-to-br from-[#0f0a28] to-[#1a0f3a] p-8 flex items-center justify-center">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative flex flex-col items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                    <span className="text-sm font-medium text-muted">AI Processing Live</span>
                  </div>
                  <div className="flex gap-4 flex-wrap justify-center">
                    {["Detecting Moments", "Generating Clips", "Adding Captions", "Optimizing"].map(
                      (step, i) => (
                        <div
                          key={step}
                          className="glass-card px-4 py-2 text-xs font-medium text-primary-light shine"
                          style={{ animationDelay: `${i * 0.5}s` }}
                        >
                          {step}
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    {[92, 87, 78, 95, 81].map((score, i) => (
                      <div key={i} className="glass-card p-3 text-center min-w-[80px]">
                        <div className="text-xl font-bold gradient-text">{score}%</div>
                        <div className="text-[10px] text-muted mt-1">Clip {i + 1}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    5 viral clips detected from 2hr stream
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-3/4 bg-primary/20 blur-3xl" />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-24 grid w-full max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center shine">
                <div className="text-2xl font-bold gradient-text sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
