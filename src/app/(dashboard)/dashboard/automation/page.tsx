"use client";

import { motion } from "framer-motion";
import {
  Bot, Zap, PlayCircle, Monitor, Radio, Link2,
  Settings2, Clock, TrendingUp, Sparkles, ArrowRight, Bell,
  Globe2, MessageSquare, Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

const connectedAccounts = [
  { platform: "TikTok", handle: "Not connected", connected: false, autoPost: false, followers: "—", icon: "TT" },
  { platform: "Instagram", handle: "Not connected", connected: false, autoPost: false, followers: "—", icon: "IG" },
  { platform: "YouTube", handle: "Not connected", connected: false, autoPost: false, followers: "—", icon: "YT" },
  { platform: "Facebook", handle: "Not connected", connected: false, autoPost: false, followers: "—", icon: "FB" },
  { platform: "X / Twitter", handle: "Not connected", connected: false, autoPost: false, followers: "—", icon: "X" },
];

const automationRules = [
  { name: "Auto-clip new Twitch VODs", description: "Automatically generate clips from new Twitch stream VODs", enabled: false, icon: Zap, triggers: "On new VOD" },
  { name: "Auto-publish high viral clips", description: "Publish clips with viral score > 85% to all connected platforms", enabled: false, icon: TrendingUp, triggers: "Viral score > 85%" },
  { name: "Smart scheduling", description: "AI picks optimal posting times based on audience analytics", enabled: false, icon: Clock, triggers: "Always active" },
  { name: "Auto-hashtag optimization", description: "AI generates and optimizes hashtags based on trending topics", enabled: false, icon: Sparkles, triggers: "On publish" },
  { name: "Discord notifications", description: "Send clip notifications to your Discord server", enabled: false, icon: MessageSquare, triggers: "On clip ready" },
  { name: "Auto-repost top clips", description: "Repost top-performing clips after 30 days on different platforms", enabled: false, icon: Globe2, triggers: "30 days after publish" },
];

const sourceIntegrations = [
  { name: "Twitch", description: "Auto-import VODs and detect live moments", connected: false, icon: Monitor, color: "from-purple-500 to-purple-600" },
  { name: "YouTube", description: "Auto-import uploads and livestreams", connected: false, icon: PlayCircle, color: "from-red-500 to-red-600" },
  { name: "Kick", description: "Auto-import stream VODs", connected: false, icon: Monitor, color: "from-green-500 to-green-600" },
  { name: "Rumble", description: "Auto-import videos and streams", connected: false, icon: Radio, color: "from-emerald-500 to-emerald-600" },
  { name: "Discord", description: "Chat integration and notifications", connected: false, icon: MessageSquare, color: "from-indigo-500 to-blue-600" },
];

export default function AutomationPage() {
  return (
    <>
      <Topbar title="Automation" subtitle="Manage auto-clipping, publishing, and integrations" />
      <div className="p-6 space-y-6">
        {/* Connected Social Accounts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary-light" />
              <h2 className="text-base font-semibold">Connected Social Accounts</h2>
            </div>
            <Button variant="secondary" size="sm">
              <Link2 className="h-3.5 w-3.5" />
              Connect New
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {connectedAccounts.map((account, i) => (
              <motion.div
                key={account.platform}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                    {account.icon}
                  </div>
                  <Badge variant="outline" className="text-[10px]">Not connected</Badge>
                </div>
                <p className="text-sm font-semibold">{account.platform}</p>
                <p className="text-xs text-muted mt-0.5">{account.handle}</p>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                  Connect
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
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
                  <Button variant="outline" size="sm" className="text-xs">
                    Connect
                    <ArrowRight className="h-3 w-3" />
                  </Button>
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
              Connect your social accounts and enable automation rules to get started.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
