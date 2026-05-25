"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What platforms does ClipViral support?",
    a: "ClipViral supports YouTube, Twitch, Kick, Rumble, and direct video uploads. Generated clips are auto-published directly to your TikTok account.",
  },
  {
    q: "How does the AI detect viral moments?",
    a: "Our AI analyzes audio peaks, emotion detection, speech patterns, chat activity, audience engagement spikes, and content context to identify the most clip-worthy moments from your content. It detects funny moments, reactions, arguments, storytelling peaks, and more.",
  },
  {
    q: "How long does it take to generate clips?",
    a: "For a typical 1-2 hour stream or podcast, ClipViral generates 10-20 clips in under 10 minutes. Processing is fast with priority rendering for all users.",
  },
  {
    q: "Can I customize the generated clips?",
    a: "Absolutely! You can customize caption styles, zoom effects, transitions, hooks, thumbnails, music, and more. You can also manually trim and adjust any AI-generated clip before publishing.",
  },
  {
    q: "Is ClipViral really free?",
    a: "Yes! ClipViral is 100% free with no limits. You get unlimited clips, 4K exports, all AI features, unlimited social accounts, team collaboration, and everything else — no credit card required, no hidden fees.",
  },
  {
    q: "Does ClipViral auto-post to my social accounts?",
    a: "Yes! Connect your TikTok account for one-click or scheduled auto-publishing. All users get full access to auto-posting.",
  },
  {
    q: "What video quality are the exported clips?",
    a: "All clips export at up to 4K quality, optimized for each platform's requirements. You always get the best quality possible.",
  },
  {
    q: "Can my team collaborate on ClipViral?",
    a: "Yes! ClipViral includes team collaboration features with roles for editors, managers, and creators. Everyone can review, edit, and approve clips before publishing.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-light">
            FAQ
          </span>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Got{" "}
            <span className="gradient-text">Questions?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Everything you need to know about ClipViral.
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="glass-card w-full px-6 py-4 text-left transition-all hover:border-primary/30 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm leading-relaxed text-muted border-t border-white/5 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
