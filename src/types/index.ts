export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface Clip {
  id: string;
  user_id: string;
  title: string;
  description: string;
  source_url: string;
  source_platform: Platform;
  thumbnail_url?: string;
  video_url?: string;
  duration: number;
  viral_score: number;
  retention_score: number;
  status: ClipStatus;
  tags: string[];
  hashtags: string[];
  created_at: string;
  published_at?: string;
  platforms: PlatformPost[];
  ai_hook?: string;
  ai_description?: string;
  moment_type: MomentType;
}

export type ClipStatus =
  | "processing"
  | "ready"
  | "published"
  | "scheduled"
  | "draft"
  | "failed";

export type Platform =
  | "youtube"
  | "twitch"
  | "kick"
  | "rumble"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "upload";

export type MomentType =
  | "funny"
  | "emotional"
  | "shocking"
  | "argument"
  | "storytelling"
  | "loud_reaction"
  | "dramatic_pause"
  | "controversial"
  | "motivational"
  | "drama"
  | "podcast_highlight"
  | "chat_reaction"
  | "viral"
  | "engagement_spike";

export interface PlatformPost {
  platform: Platform;
  status: "pending" | "posted" | "scheduled" | "failed";
  url?: string;
  scheduled_at?: string;
  posted_at?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface AnalyticsData {
  total_clips: number;
  total_views: number;
  total_engagement: number;
  viral_clips: number;
  avg_viral_score: number;
  growth_rate: number;
  top_platform: Platform;
  weekly_views: { date: string; views: number }[];
  platform_breakdown: { platform: string; clips: number; views: number }[];
}

export interface ProcessingJob {
  id: string;
  user_id: string;
  source_url: string;
  status: "queued" | "downloading" | "analyzing" | "generating" | "rendering" | "complete" | "failed";
  progress: number;
  clips_found: number;
  clips_generated: number;
  estimated_time?: number;
  created_at: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  features: string[];
  clips_per_month: number;
  highlighted?: boolean;
  badge?: string;
}
