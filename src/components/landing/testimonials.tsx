"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "xQc",
    handle: "@xQc",
    role: "Twitch Streamer · 11M followers",
    content:
      "ClipViral literally changed my entire content strategy. My TikTok blew up from 2M to 8M followers in 3 months just from auto-clipped stream highlights.",
    avatar: "X",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Valkyrae",
    handle: "@Valkyrae",
    role: "YouTube Creator · 4M subscribers",
    content:
      "The AI moment detection is insane. It finds clips I would have never thought to post, and they always do numbers. This is a must-have for any creator.",
    avatar: "V",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Lex Fridman",
    handle: "@lexfridman",
    role: "Podcaster · 5M subscribers",
    content:
      "For a 3-hour podcast, ClipViral generates 15-20 perfectly edited clips with captions in under 10 minutes. It used to take my editor a full day.",
    avatar: "L",
    color: "from-emerald-500 to-green-500",
  },
  {
    name: "Pokimane",
    handle: "@pokimanelol",
    role: "Content Creator · 9M followers",
    content:
      "The auto-scheduling and viral score predictions are game-changing. I just review the clips it generates and hit publish. My engagement has tripled.",
    avatar: "P",
    color: "from-purple-500 to-violet-500",
  },
  {
    name: "MrBeast",
    handle: "@MrBeast",
    role: "YouTube Creator · 300M subscribers",
    content:
      "We use ClipViral for our podcast clips and behind-the-scenes content. The one-click viral mode is ridiculous — every clip it makes gets at least 1M views.",
    avatar: "M",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Kai Cenat",
    handle: "@KaiCenat",
    role: "Twitch Streamer · 15M followers",
    content:
      "Bro this app is crazy fr. It catches every funny moment from my streams and the captions with the emojis make everything hit different. 10/10.",
    avatar: "K",
    color: "from-red-500 to-pink-500",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-light">
            Testimonials
          </span>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            Loved by{" "}
            <span className="gradient-text">Top Creators</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            See why the world&apos;s biggest streamers, podcasters, and creators trust ClipViral.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover className="h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
