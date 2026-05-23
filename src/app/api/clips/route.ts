import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const clips = [
    {
      id: "clip_1",
      title: "When chat said I couldn't do it",
      viral_score: 95,
      retention_score: 88,
      status: "published",
      duration: 47,
      moment_type: "funny",
      platform: "tiktok",
      views: 458000,
      likes: 34200,
      comments: 1840,
      created_at: "2026-05-22T10:00:00Z",
    },
  ];

  return Response.json({
    clips: status ? clips.filter((c) => c.status === status) : clips,
    pagination: { page, limit, total: clips.length },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { source_url, source_type, settings } = body;

  if (!source_url && !source_type) {
    return Response.json(
      { error: "source_url or file upload required" },
      { status: 400 }
    );
  }

  const job = {
    id: `job_${Date.now()}`,
    status: "queued",
    source_url,
    settings: {
      clip_length: settings?.clip_length || "30-60s",
      caption_style: settings?.caption_style || "tiktok_viral",
      ai_mode: settings?.ai_mode || "maximum_viral",
      moment_types: settings?.moment_types || [
        "funny",
        "emotional",
        "shocking",
        "viral",
      ],
      auto_captions: settings?.auto_captions ?? true,
      face_tracking: settings?.face_tracking ?? true,
      silence_removal: settings?.silence_removal ?? true,
      hook_generation: settings?.hook_generation ?? true,
      vertical_reframe: settings?.vertical_reframe ?? true,
      sound_effects: settings?.sound_effects ?? false,
      background_music: settings?.background_music ?? false,
    },
    progress: 0,
    clips_found: 0,
    estimated_time: 600,
    created_at: new Date().toISOString(),
  };

  return Response.json({ job }, { status: 201 });
}
