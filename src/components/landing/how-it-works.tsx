"use client";

import { motion } from "framer-motion";
import { Link2, Brain, Wand2, Share2 } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Paste a Link or Upload",
    description:
      "Drop a YouTube, Twitch, Kick, or Rumble link — or upload your video directly. We support any long-form content.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Brain,
    number: "02",
    title: "AI Analyzes Your Content",
    description:
      "Our AI watches your entire video, detecting funny moments, reactions, emotional peaks, arguments, and viral highlights.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Wand2,
    number: "03",
    title: "Clips Are Generated",
    description:
      "Multiple 30-60s clips are auto-generated with captions, zoom effects, hooks, transitions, and vertical formatting.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Share2,
    number: "04",
    title: "Publish Everywhere",
    description:
      "Review, customize, and auto-publish to TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels instantly.",
    color: "from-emerald-500 to-green-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-light">
            How It Works
          </span>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            From Stream to{" "}
            <span className="gradient-text">Viral Clip</span> in Minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Four simple steps to turn hours of content into scroll-stopping clips
            that grow your audience on every platform.
          </p>
        </motion.div>

        <div className="relative mt-20">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-secondary/30 to-transparent lg:block" />

          <div className="grid gap-12 lg:gap-24">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="glass-card p-8">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color}`}
                      >
                        <step.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted">
                          Step {step.number}
                        </span>
                        <h3 className="text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 text-base leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="relative hidden lg:flex">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-lg font-bold text-white shadow-lg`}
                  >
                    {step.number}
                  </div>
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
