"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary glow-purple">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Ready to Go{" "}
            <span className="gradient-text">Viral?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Join 50,000+ creators who are growing their audience with AI-powered clips.
            Start free — no credit card required.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="xl" glow className="group">
                <Zap className="h-5 w-5" />
                Start Clipping Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              Talk to Sales
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted/60">
            Free forever plan available · No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
