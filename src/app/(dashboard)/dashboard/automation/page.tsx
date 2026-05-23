"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, Zap, Monitor, Link2,
  Settings2, Clock, TrendingUp, Sparkles, Bell,
  Shield, CheckCircle2, Loader2, ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

const automationRules = [
  { name: "Auto-publish high viral clips", description: "Publish clips with viral score > 85% to TikTok automatically", enabled: false, icon: TrendingUp, triggers: "Viral score > 85%" },
  { name: "Smart scheduling", description: "AI picks optimal posting times based on TikTok analytics", enabled: false, icon: Clock, triggers: "Always active" },
  { name: "Auto-hashtag optimization", description: "AI generates and optimizes hashtags based on TikTok trends", enabled: false, icon: Sparkles, triggers: "On publish" },
  { name: "Auto-clip new uploads", description: "Automatically generate clips from newly uploaded videos", enabled: false, icon: Zap, triggers: "On new upload" },
];

const sourceIntegrations = [
  { name: "Twitch", description: "Auto-import VODs and detect live moments", connected: false, icon: Monitor, color: "from-purple-500 to-purple-600" },
  { name: "Kick", description: "Auto-import stream VODs", connected: false, icon: Monitor, color: "from-green-500 to-green-600" },
];

export default function AutomationPage() {
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleTikTokConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/tiktok/auth");
      const data = await res.json();
      if (data.authUrl) {
        window.open(data.authUrl, "_blank", "width=600,height=700");
      } else {
        setTiktokConnected(true);
      }
    } catch {
      setTiktokConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      <Topbar title="Automation" subtitle="Manage auto-clipping, TikTok publishing, and integrations" />
      <div className="p-6 space-y-6">
        {/* TikTok Connection - Primary CTA */}
        <Card glow>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-3">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.89a8.28 8.28 0 004.76 1.51V6.96a4.84 4.84 0 01-1-.27z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">TikTok Auto-Post</h2>
                <p className="text-sm text-muted mt-0.5">
                  {tiktokConnected
                    ? "Your TikTok account is connected. Clips will auto-post."
                    : "Connect your TikTok account to auto-post generated clips."}
                </p>
              </div>
            </div>
            {tiktokConnected ? (
              <div className="flex items-center gap-3">
                <Badge variant="success" className="px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Connected
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setTiktokConnected(false)}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleTikTokConnect}
                glow
                className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 border-none"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Connect TikTok Account
                    <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>

          {tiktokConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-lg font-bold">Auto</p>
                  <p className="text-xs text-muted">Posting Mode</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-lg font-bold">0</p>
                  <p className="text-xs text-muted">Clips Posted</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-lg font-bold">—</p>
                  <p className="text-xs text-muted">Next Scheduled</p>
                </div>
              </div>
            </motion.div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Automation Rules */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-light" />
                <h2 className="text-base font-semibold">Automation Rules</h2>
              </div>
              <Button variant="secondary" size="sm">
                <Settings2 className="h-3.5 w-3.5" />
                Configure
              </Button>
            </div>
            <div className="space-y-3">
              {automationRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
                  <div className="rounded-lg p-2 bg-white/5">
                    <rule.icon className="h-4 w-4 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{rule.triggers}</Badge>
                    <div className="h-5 w-9 rounded-full relative cursor-pointer bg-white/20">
                      <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Source Integrations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-light" />
                <h2 className="text-base font-semibold">Source Integrations</h2>
              </div>
            </div>
            <div className="space-y-3">
              {sourceIntegrations.map((integration, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
                  <div className={`rounded-lg bg-gradient-to-br ${integration.color} p-2`}>
                    <integration.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted mt-0.5">{integration.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Automation Activity */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary-light" />
            <h2 className="text-base font-semibold">Recent Activity</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-2xl bg-primary/10 p-3 mb-3">
              <Bot className="h-6 w-6 text-primary-light" />
            </div>
            <p className="text-sm text-muted">No automation activity yet</p>
            <p className="mt-1 text-xs text-muted/60">
              Connect your TikTok account and enable automation rules to get started.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
