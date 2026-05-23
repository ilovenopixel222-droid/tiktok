-- ClipViral Database Schema (PostgreSQL / Supabase)
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTH
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  clips_used_this_month INTEGER DEFAULT 0,
  clips_limit INTEGER DEFAULT 10,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 10737418240, -- 10GB
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  plan TEXT NOT NULL DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'manager', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

-- ============================================
-- SOURCE VIDEOS
-- ============================================

CREATE TABLE source_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_url TEXT,
  source_platform TEXT CHECK (source_platform IN ('youtube', 'twitch', 'kick', 'rumble', 'tiktok', 'upload')),
  file_path TEXT,
  file_size BIGINT,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  transcript TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'downloading', 'transcribing', 'analyzing', 'complete', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIPS
-- ============================================

CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_video_id UUID REFERENCES source_videos(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  start_time FLOAT,
  end_time FLOAT,

  -- AI Scores
  viral_score INTEGER DEFAULT 0 CHECK (viral_score >= 0 AND viral_score <= 100),
  retention_score INTEGER DEFAULT 0 CHECK (retention_score >= 0 AND retention_score <= 100),
  engagement_prediction FLOAT DEFAULT 0,

  -- Moment detection
  moment_type TEXT CHECK (moment_type IN (
    'funny', 'emotional', 'shocking', 'argument', 'storytelling',
    'loud_reaction', 'dramatic_pause', 'controversial', 'motivational',
    'drama', 'podcast_highlight', 'chat_reaction', 'viral',
    'engagement_spike', 'stream_fail', 'high_energy', 'rage_reaction'
  )),

  -- AI Generated content
  ai_hook TEXT,
  ai_title TEXT,
  ai_description TEXT,
  ai_hashtags TEXT[],
  ai_cta TEXT,
  ai_pinned_comment TEXT,
  ai_social_caption TEXT,

  -- Editing settings
  caption_style TEXT DEFAULT 'tiktok_viral',
  caption_language TEXT DEFAULT 'en',
  has_face_tracking BOOLEAN DEFAULT TRUE,
  has_zoom_effects BOOLEAN DEFAULT TRUE,
  has_sound_effects BOOLEAN DEFAULT FALSE,
  has_background_music BOOLEAN DEFAULT FALSE,
  has_silence_removal BOOLEAN DEFAULT TRUE,
  export_format TEXT DEFAULT '9:16',
  export_quality TEXT DEFAULT '1080p',

  -- Status
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN (
    'processing', 'ready', 'published', 'scheduled', 'draft', 'failed', 'archived'
  )),

  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL MEDIA PUBLISHING
-- ============================================

CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook', 'twitter')),
  platform_user_id TEXT,
  username TEXT,
  display_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  auto_post_enabled BOOLEAN DEFAULT FALSE,
  follower_count INTEGER DEFAULT 0,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);

CREATE TABLE published_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  post_url TEXT,
  title TEXT,
  description TEXT,
  hashtags TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'posted', 'scheduled', 'failed')),
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROCESSING JOBS
-- ============================================

CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_video_id UUID REFERENCES source_videos(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'downloading', 'transcribing', 'analyzing',
    'detecting_moments', 'generating_clips', 'rendering',
    'adding_effects', 'complete', 'failed'
  )),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  clips_found INTEGER DEFAULT 0,
  clips_generated INTEGER DEFAULT 0,
  estimated_seconds INTEGER,
  error_message TEXT,
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

CREATE TABLE clip_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  avg_retention_pct FLOAT DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clip_id, platform, date)
);

CREATE TABLE creator_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  clips_created INTEGER DEFAULT 0,
  clips_published INTEGER DEFAULT 0,
  avg_viral_score FLOAT DEFAULT 0,
  top_platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- AUTOMATION
-- ============================================

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'new_vod', 'clip_ready', 'viral_score_threshold',
    'schedule', 'manual', 'live_stream_end'
  )),
  trigger_config JSONB DEFAULT '{}',
  action_type TEXT NOT NULL CHECK (action_type IN (
    'generate_clips', 'publish_clip', 'schedule_clip',
    'notify_discord', 'notify_email', 'repost'
  )),
  action_config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  details JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS & BILLING
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'subscription', 'referral', 'promo', 'usage')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referee_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paid')),
  reward_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'clip_ready', 'publish_success', 'publish_failed',
    'viral_alert', 'billing', 'team_invite', 'system',
    'trending', 'weekly_digest'
  )),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- API KEYS & WEBHOOKS
-- ============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BRANDING & PRESETS
-- ============================================

CREATE TABLE branding_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  watermark_url TEXT,
  intro_url TEXT,
  outro_url TEXT,
  caption_font TEXT,
  caption_color TEXT,
  caption_style TEXT,
  brand_colors JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_clips_user_id ON clips(user_id);
CREATE INDEX idx_clips_status ON clips(status);
CREATE INDEX idx_clips_viral_score ON clips(viral_score DESC);
CREATE INDEX idx_clips_created_at ON clips(created_at DESC);
CREATE INDEX idx_source_videos_user_id ON source_videos(user_id);
CREATE INDEX idx_published_clips_clip_id ON published_clips(clip_id);
CREATE INDEX idx_published_clips_status ON published_clips(status);
CREATE INDEX idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_clip_analytics_clip_date ON clip_analytics(clip_id, date);
CREATE INDEX idx_creator_analytics_user_date ON creator_analytics(user_id, date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users FOR ALL USING (id = auth.uid());
CREATE POLICY clips_own_data ON clips FOR ALL USING (user_id = auth.uid());
CREATE POLICY source_videos_own_data ON source_videos FOR ALL USING (user_id = auth.uid());
CREATE POLICY social_accounts_own_data ON social_accounts FOR ALL USING (user_id = auth.uid());
CREATE POLICY processing_jobs_own_data ON processing_jobs FOR ALL USING (user_id = auth.uid());
CREATE POLICY notifications_own_data ON notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY automation_rules_own_data ON automation_rules FOR ALL USING (user_id = auth.uid());
CREATE POLICY api_keys_own_data ON api_keys FOR ALL USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON clips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_source_videos_updated_at BEFORE UPDATE ON source_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_published_clips_updated_at BEFORE UPDATE ON published_clips FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Reset monthly clip usage
CREATE OR REPLACE FUNCTION reset_monthly_clips()
RETURNS VOID AS $$
BEGIN
  UPDATE users SET clips_used_this_month = 0;
END;
$$ LANGUAGE plpgsql;
