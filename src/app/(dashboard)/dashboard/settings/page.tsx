"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Lock, CreditCard, Bell, Palette, Globe2,
  Shield, Key, Users, Crown, Check, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "team", label: "Team", icon: Users },
  { id: "api", label: "API Keys", icon: Key },
];

const defaultCaptionPresets = [
  { name: "TikTok Viral", preview: "Bold white, word-by-word animation" },
  { name: "Karaoke Style", preview: "Highlighted current word, smooth flow" },
  { name: "Classic Subtitles", preview: "Standard bottom subtitles" },
  { name: "Minimal", preview: "Small, clean text overlay" },
  { name: "Bold Impact", preview: "Large impact font, center screen" },
];

const defaultNotifications = [
  { label: "Clip processing complete", email: true, push: true },
  { label: "Auto-publish success", email: true, push: true },
  { label: "Viral score alerts (>90%)", email: true, push: true },
  { label: "Weekly analytics digest", email: true, push: false },
  { label: "New feature announcements", email: false, push: false },
  { label: "Billing & subscription alerts", email: true, push: true },
  { label: "Team activity notifications", email: false, push: true },
  { label: "Trending topic alerts", email: false, push: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [activePreset, setActivePreset] = useState("TikTok Viral");
  const [activeFormat, setActiveFormat] = useState("9:16 Vertical");
  const [activeQuality, setActiveQuality] = useState("1080p");
  const [activeTheme, setActiveTheme] = useState("Dark");
  const [toast, setToast] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileNiche, setProfileNiche] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const toggleNotification = (index: number, field: "email" | "push") => {
    setNotifications(prev => prev.map((n, i) =>
      i === index ? { ...n, [field]: !n[field] } : n
    ));
  };

  const handleSaveProfile = () => {
    const profile = { name: profileName, email: profileEmail, username: profileUsername, niche: profileNiche };
    localStorage.setItem("clipviral_profile", JSON.stringify(profile));
    showToast("Profile saved!");
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("clipviral_notifications", JSON.stringify(notifications));
    showToast("Notification preferences saved!");
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account, billing, and preferences" />
      <div className="p-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <Check className="inline h-4 w-4 mr-1" />
            {toast}
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Tabs */}
          <div className="w-full lg:w-56 shrink-0">
            <Card className="p-2">
              <nav className="space-y-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-primary/15 text-primary-light"
                        : "text-muted hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card>
                  <h2 className="text-base font-semibold mb-4">Profile Information</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white">
                      {profileName ? profileName[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{profileName || "Set up your profile"}</p>
                      <p className="text-xs text-muted">{profileEmail || "Add your email"}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full Name" placeholder="Your name" icon={<User className="h-4 w-4" />} value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    <Input label="Email" placeholder="your@email.com" icon={<Mail className="h-4 w-4" />} value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                    <Input label="Username" placeholder="@username" icon={<Globe2 className="h-4 w-4" />} value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} />
                    <Input label="Creator Niche" placeholder="e.g. Gaming, Lifestyle" value={profileNiche} onChange={(e) => setProfileNiche(e.target.value)} />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-base font-semibold mb-4">Caption Presets</h2>
                  <div className="space-y-2">
                    {defaultCaptionPresets.map((preset) => (
                      <div
                        key={preset.name}
                        className={`flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all ${
                          activePreset === preset.name
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                        }`}
                        onClick={() => { setActivePreset(preset.name); showToast(`${preset.name} preset selected`); }}
                      >
                        <div>
                          <p className="text-sm font-medium">{preset.name}</p>
                          <p className="text-xs text-muted">{preset.preview}</p>
                        </div>
                        {activePreset === preset.name ? (
                          <Badge variant="primary">Active</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); setActivePreset(preset.name); showToast(`${preset.name} preset selected`); }}>Select</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h2 className="text-base font-semibold mb-4">Export Defaults</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-muted block mb-2">Default Format</label>
                      <div className="flex gap-1.5">
                        {["9:16 Vertical", "1:1 Square", "16:9 Wide"].map((f) => (
                          <button
                            key={f}
                            onClick={() => { setActiveFormat(f); showToast(`Format: ${f}`); }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                              activeFormat === f
                                ? "bg-primary/20 text-primary-light border border-primary/30"
                                : "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted block mb-2">Default Quality</label>
                      <div className="flex gap-1.5">
                        {["720p", "1080p", "4K"].map((q) => (
                          <button
                            key={q}
                            onClick={() => { setActiveQuality(q); showToast(`Quality: ${q}`); }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                              activeQuality === q
                                ? "bg-primary/20 text-primary-light border border-primary/30"
                                : "bg-white/5 text-muted border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "billing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-gradient-to-br from-primary to-secondary p-2.5">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">Unlimited Access</h2>
                      <p className="text-xs text-muted">All features included — 100% free</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-white/[0.02] p-3 text-center">
                      <p className="text-2xl font-bold">Unlimited</p>
                      <p className="text-xs text-muted">Clips per month</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] p-3 text-center">
                      <p className="text-2xl font-bold">Unlimited</p>
                      <p className="text-xs text-muted">Social accounts</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] p-3 text-center">
                      <p className="text-2xl font-bold">4K</p>
                      <p className="text-xs text-muted">Max quality</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-base font-semibold mb-4">Your Plan</h2>
                  <div className="flex items-center justify-center py-6 text-center">
                    <div>
                      <p className="text-sm text-muted">ClipViral is free for everyone — no billing required.</p>
                      <p className="mt-1 text-xs text-muted/60">All features are unlocked with no usage limits.</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <h2 className="text-base font-semibold mb-4">Notification Preferences</h2>
                  <div className="space-y-1">
                    <div className="flex items-center gap-4 px-3 py-2 text-xs font-medium text-muted">
                      <span className="flex-1">Notification</span>
                      <span className="w-16 text-center">Email</span>
                      <span className="w-16 text-center">Push</span>
                    </div>
                    {notifications.map((setting, idx) => (
                      <div key={setting.label} className="flex items-center gap-4 rounded-lg bg-white/[0.02] px-3 py-3">
                        <span className="flex-1 text-sm">{setting.label}</span>
                        <div className="w-16 flex justify-center">
                          <button
                            onClick={() => toggleNotification(idx, "email")}
                            className={`h-5 w-9 rounded-full relative cursor-pointer transition-colors ${setting.email ? "bg-primary/40" : "bg-white/20"}`}
                          >
                            <div className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${setting.email ? "right-0.5 bg-primary" : "left-0.5 bg-white/40"}`} />
                          </button>
                        </div>
                        <div className="w-16 flex justify-center">
                          <button
                            onClick={() => toggleNotification(idx, "push")}
                            className={`h-5 w-9 rounded-full relative cursor-pointer transition-colors ${setting.push ? "bg-primary/40" : "bg-white/20"}`}
                          >
                            <div className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${setting.push ? "right-0.5 bg-primary" : "left-0.5 bg-white/40"}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleSaveNotifications}>Save Preferences</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <h2 className="text-base font-semibold mb-4">Theme</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Dark", bg: "bg-[#030014]", fg: "bg-white/80" },
                      { name: "Light", bg: "bg-white", fg: "bg-gray-800" },
                      { name: "System", bg: "bg-gradient-to-r from-[#030014] to-white", fg: "bg-transparent" },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => { setActiveTheme(theme.name); showToast(`Theme set to ${theme.name}`); }}
                        className={`rounded-xl border p-4 text-center transition-all cursor-pointer ${
                          activeTheme === theme.name ? "border-primary/40 bg-primary/5" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className={`mx-auto mb-3 h-16 w-full rounded-lg ${theme.bg} border border-white/10`} />
                        <span className="text-sm font-medium">{theme.name}</span>
                        {activeTheme === theme.name && <Check className="mx-auto mt-1 h-4 w-4 text-primary-light" />}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card>
                  <h2 className="text-base font-semibold mb-4">Change Password</h2>
                  <div className="space-y-4 max-w-md">
                    <Input label="Current Password" type="password" placeholder="Enter current password" icon={<Lock className="h-4 w-4" />} />
                    <Input label="New Password" type="password" placeholder="Enter new password" icon={<Lock className="h-4 w-4" />} />
                    <Input label="Confirm Password" type="password" placeholder="Confirm new password" icon={<Lock className="h-4 w-4" />} />
                    <Button size="sm" onClick={() => showToast("Password updated!")}>Update Password</Button>
                  </div>
                </Card>
                <Card>
                  <h2 className="text-base font-semibold mb-4">Two-Factor Authentication</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Protect your account with 2FA</p>
                      <p className="text-xs text-muted mt-1">Add an extra layer of security using an authenticator app</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => showToast("2FA setup coming soon")}>
                      <Shield className="h-3.5 w-3.5" />
                      Enable 2FA
                    </Button>
                  </div>
                </Card>
                <Card>
                  <h2 className="text-base font-semibold mb-4">Active Sessions</h2>
                  <div className="rounded-xl bg-white/[0.02] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted mt-0.5">This browser · Active now</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "team" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold">Team Members</h2>
                    <Button size="sm" onClick={() => showToast("Team invites coming soon")}>
                      <Users className="h-3.5 w-3.5" />
                      Invite Member
                    </Button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-8 w-8 text-muted mb-2" />
                    <p className="text-sm text-muted">No team members yet</p>
                    <p className="mt-1 text-xs text-muted/60">Invite editors and managers to collaborate on your content.</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "api" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card>
                  <h2 className="text-base font-semibold mb-4">API Keys</h2>
                  <p className="text-sm text-muted mb-4">
                    Use API keys to integrate ClipViral with your own applications, webhooks, and automation workflows.
                  </p>
                  <div className="flex items-center justify-center py-6 text-sm text-muted">
                    No API keys generated yet
                  </div>
                  <Button variant="secondary" size="sm" className="mt-2" onClick={() => showToast("API key generation coming soon")}>
                    <Key className="h-3.5 w-3.5" />
                    Generate New Key
                  </Button>
                </Card>
                <Card>
                  <h2 className="text-base font-semibold mb-4">Webhooks</h2>
                  <p className="text-sm text-muted mb-4">
                    Receive real-time notifications when events happen in your ClipViral account.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => showToast("Webhook configuration coming soon")}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    Add Webhook Endpoint
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
