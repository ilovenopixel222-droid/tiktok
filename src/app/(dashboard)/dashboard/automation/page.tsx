"use client";

import { motion } from "framer-motion";
import {
  Bot, Zap, PlayCircle, Monitor, Radio, Link2, CheckCircle2,
  Settings2, Clock, TrendingUp, Sparkles, ArrowRight, Bell,
  Globe2, MessageSquare, Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

const connectedAccounts = [
  { platform: "TikTok", handle: "@isaaccreator", connected: true, autoPost: true, followers: "124K", icon: "TT" },
  { platform: "Instagram", handle: "@isaac.clips", connected: true, autoPost: true, followers: "89K", icon: "IG" },
  { platform: "YouTube", handle: "@IsaacClips", connected: true, autoPost: false, followers: "45K", icon: "YT" },
  { platform: "Facebook", handle: "Isaac Creator", connected: false, autoPost: false, followers: "—", icon: "FB" },
  { platform: "X / Twitter", handle: "Not connected", connected: false, autoPost: false, followers: "—", icon: "X" },
];

const automationRules = [
  { name: "Auto-clip new Twitch VODs", description: "Automatically generate clips from new Twitch stream VODs", enabled: true, icon: Zap, triggers: "On new VOD" },
  { name: "Auto-publish high viral clips", description: "Publish clips with viral score > 85% to all connected platforms", enabled: true, icon: TrendingUp, triggers: "Viral score > 85%" },
  { name: "Smart scheduling", description: "AI picks optimal posting times based on audience analytics", enabled: true, icon: Clock, triggers: "Always active" },
  { name: "Auto-hashtag optimization", description: "AI generates and optimizes hashtags based on trending topics", enabled: true, icon: Sparkles, triggers: "On publish" },
  { name: "Discord notifications", description: "Send clip notifications to your Discord server", enabled: false, icon: MessageSquare, triggers: "On clip ready" },
  { name: "Auto-repost top clips", description: "Repost top-performing clips after 30 days on different platforms", enabled: false, icon: Globe2, triggers: "30 days after publish" },
];

const sourceIntegrations = [
  { name: "Twitch", description: "Auto-import VODs and detect live moments", connected: true, icon: Monitor, color: "from-purple-500 to-purple-600" },
  { name: "YouTube", description: "Auto-import uploads and livestreams", connected: true, icon: PlayCircle, color: "from-red-500 to-red-600" },
  { name: "Kick", description: "Auto-import stream VODs", connected: false, icon: Monitor, color: "from-green-500 to-green-600" },
  { name: "Rumble", description: "Auto-import videos and streams", connected: false, icon: Radio, color: "from-emerald-500 to-emerald-600" },
  { name: "Discord", description: "Chat integration and notifications", connected: true, icon: MessageSquare, color: "from-indigo-500 to-blue-600" },
];

const recentActivity = [
  { action: "Auto-clipped Twitch VOD", detail: "12 clips generated from 4hr stream", time: "2 hours ago", icon: Zap },
  { action: "Published to TikTok", detail: '"When chat said I couldn\'t do it" — 95% viral', time: "4 hours ago", icon: CheckCircle2 },
  { action: "Published to Instagram", detail: '"This reaction was INSANE" — 91% viral', time: "5 hours ago", icon: CheckCircle2 },
  { action: "Smart schedule adjusted", detail: "Moved 3 posts to optimal time slots", time: "6 hours ago", icon: Clock },
  { action: "New VOD detected", detail: "Twitch stream started processing", time: "8 hours ago", icon: Bell },
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
                className={`rounded-xl border p-4 ${
                  account.connected ? "border-primary/20 bg-primary/5" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                    {account.icon}
                  </div>
                  {account.connected ? (
                    <Badge variant="success" className="text-[10px]">Connected</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Not connected</Badge>
                  )}
                </div>
                <p className="text-sm font-semibold">{account.platform}</p>
                <p className="text-xs text-muted mt-0.5">{account.handle}</p>
                {account.connected && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted">{account.followers} followers</span>
                    {account.autoPost && (
                      <Badge variant="primary" className="text-[10px]">Auto-post</Badge>
                    )}
                  </div>
                )}
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
                  <div className={`rounded-lg p-2 ${rule.enabled ? "bg-primary/15" : "bg-white/5"}`}>
                    <rule.icon className={`h-4 w-4 ${rule.enabled ? "text-primary-light" : "text-muted"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{rule.triggers}</Badge>
                    <div className={`h-5 w-9 rounded-full relative cursor-pointer ${rule.enabled ? "bg-primary/40" : "bg-white/20"}`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${rule.enabled ? "right-0.5 bg-primary" : "left-0.5 bg-white/40"}`} />
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
                  {integration.connected ? (
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs">
                      Connect
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
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
          <div className="space-y-2">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <activity.icon className="h-4 w-4 text-primary-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted mt-0.5">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted shrink-0">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
