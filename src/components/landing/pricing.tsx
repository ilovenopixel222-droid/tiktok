"use client";

import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PricingPlan } from "@/types";

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    clips_per_month: 10,
    features: [
      "10 clips per month",
      "720p export quality",
      "Auto captions",
      "Basic moment detection",
      "1 social account",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: 29,
    period: "month",
    clips_per_month: 100,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "100 clips per month",
      "1080p export quality",
      "All AI editing features",
      "Advanced moment detection",
      "5 social accounts",
      "Auto publishing",
      "Viral score predictions",
      "Priority rendering",
      "Analytics dashboard",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    clips_per_month: -1,
    badge: "Unlimited",
    features: [
      "Unlimited clips",
      "4K export quality",
      "All Pro features",
      "Team collaboration",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Bulk processing",
      "White-label option",
      "SLA guarantee",
      "Priority support 24/7",
    ],
  },
];

const icons = [Zap, Crown, Building2];

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
            Plans That{" "}
            <span className="gradient-text">Scale With You</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative ${plan.highlighted ? "lg:-mt-4 lg:mb-[-16px]" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary via-secondary to-primary opacity-30 blur-sm" />
                )}
                <div
                  className={`relative h-full glass-card p-8 flex flex-col ${
                    plan.highlighted ? "border-primary/40 glow-purple" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-2 ${
                          plan.highlighted
                            ? "bg-gradient-to-br from-primary to-secondary"
                            : "bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                    {plan.badge && (
                      <Badge variant={plan.highlighted ? "primary" : "outline"}>
                        {plan.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted">/{plan.period}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {plan.clips_per_month === -1
                        ? "Unlimited clips per month"
                        : `${plan.clips_per_month} clips per month`}
                    </p>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button
                      variant={plan.highlighted ? "primary" : "secondary"}
                      className="w-full"
                      size="lg"
                      glow={plan.highlighted}
                    >
                      {plan.price === 0 ? "Get Started Free" : "Start Free Trial"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
