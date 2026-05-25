"use client";

import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const features = [
  "Unlimited clips per month",
  "4K export quality",
  "All AI editing features",
  "Advanced moment detection",
  "Unlimited social accounts",
  "Auto publishing to all platforms",
  "Viral score predictions",
  "Priority rendering",
  "Full analytics dashboard",
  "Team collaboration",
  "Custom branding & watermarks",
  "API access",
  "Bulk processing",
  "AI captions & face tracking",
  "Silence & dead-air removal",
  "AI hook & title generation",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-light">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Completely{" "}
            <span className="gradient-text">Free</span>
            {" "}for Everyone
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Every feature. Every tool. No limits. No credit card. No catch.
          </p>
        </motion.div>

        <div className="mt-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary via-secondary to-primary opacity-30 blur-sm" />
            <div className="relative glass-card p-8 border-primary/40 glow-purple">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2 bg-gradient-to-br from-primary to-secondary">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">ClipViral</h3>
                </div>
                <Badge variant="primary" className="px-3 py-1 text-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  100% Free
                </Badge>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-extrabold">$0</span>
                  <span className="text-muted text-lg">/ forever</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-primary-light">
                  <Infinity className="h-4 w-4" />
                  Unlimited everything — no paywalls, no limits
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/signup">
                  <Button variant="primary" className="w-full" size="lg" glow>
                    <Zap className="h-5 w-5" />
                    Get Started — It&apos;s Free
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-muted/60">
                  No credit card required · No hidden fees · All features included
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
