import { NextRequest } from "next/server";
import { store } from "@/lib/store";

export const maxDuration = 60;

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function isPlatformUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|twitch\.tv|kick\.com|rumble\.com|tiktok\.com)/i.test(url);
}

async function getYouTubeAudioUrl(videoUrl: string): Promise<string> {
  // Dynamic import to avoid bundling issues
  const ytdl = await import("@distube/ytdl-core");
  const info = await ytdl.getInfo(videoUrl);
  // Prefer audio-only format for faster processing
  const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
  if (audioFormats.length > 0) {
    // Sort by audio bitrate descending, pick best
    audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
    return audioFormats[0].url;
  }
  // Fallback to any format with audio
  const anyAudio = info.formats.filter((f) => f.hasAudio);
  if (anyAudio.length > 0) {
    return anyAudio[0].url;
  }
  throw new Error("No audio stream found in this video");
}

async function getDirectAudioUrl(videoUrl: string): Promise<string> {
  if (isYouTubeUrl(videoUrl)) {
    return getYouTubeAudioUrl(videoUrl);
  }

  if (isPlatformUrl(videoUrl)) {
    // For non-YouTube platforms, try yt-dlp as fallback (won't work on Vercel)
    try {
      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const execFileAsync = promisify(execFile);
      const { stdout } = await execFileAsync("yt-dlp", [
        "--get-url",
        "--format", "bestaudio/best",
        "--no-warnings",
        "--no-check-certificates",
        videoUrl,
      ], { timeout: 30000 });
      const directUrl = stdout.trim().split("\n")[0];
      if (directUrl && directUrl.startsWith("http")) {
        return directUrl;
      }
    } catch {
      // yt-dlp not available
    }

    throw new Error(
      "This platform is not yet supported for direct URL processing. Please download the video and upload the file directly using the Upload tab."
    );
  }

  // Direct URL — verify it's not HTML
  const headRes = await fetch(videoUrl, { method: "HEAD" }).catch(() => null);
  if (headRes) {
    const contentType = headRes.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error(
        "This URL returns a web page, not a media file. Please provide a direct link to the audio/video file, or use the Upload tab."
      );
    }
  }

  return videoUrl;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AssemblyAI API key not configured" },
      { status: 500 }
    );
  }

  let body: {
    videoUrl?: string;
    videoId?: string;
    title?: string;
    momentTypes?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { videoUrl, title } = body;

  if (!videoUrl) {
    return Response.json({ error: "videoUrl is required" }, { status: 400 });
  }

  const videoId = `vid_${Date.now()}`;
  const jobId = `job_${Date.now()}`;

  store.addVideo({
    id: videoId,
    title: title || `Video ${new Date().toLocaleDateString()}`,
    source: videoUrl.includes("youtube") || videoUrl.includes("youtu.be") ? "YouTube"
      : videoUrl.includes("twitch") ? "Twitch"
      : videoUrl.includes("kick") ? "Kick"
      : videoUrl.includes("rumble") ? "Rumble"
      : videoUrl.includes("tiktok") ? "TikTok"
      : "Upload",
    duration: "Processing...",
    size: "Calculating...",
    clips: 0,
    date: new Date().toISOString().split("T")[0],
    status: "processing",
    url: videoUrl,
  });

  store.addJob({
    id: jobId,
    videoId,
    title: title || `Processing: ${videoUrl.substring(0, 50)}...`,
    progress: 5,
    clipsFound: 0,
    status: "Extracting audio...",
    createdAt: new Date().toISOString(),
  });

  try {
    let audioUrl: string;
    try {
      audioUrl = await getDirectAudioUrl(videoUrl);
    } catch (extractErr) {
      const msg = extractErr instanceof Error ? extractErr.message : "Failed to extract audio";
      return Response.json({ error: msg }, { status: 400 });
    }

    const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speech_models: ["universal-2"],
        speaker_labels: true,
        sentiment_analysis: true,
        auto_highlights: true,
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return Response.json({ error: `AssemblyAI submission failed: ${errText}` }, { status: 500 });
    }

    const { id: transcriptId } = await submitRes.json();

    return Response.json({
      videoId,
      jobId,
      transcriptId,
      audioUrl,
      status: "submitted",
      message: "Transcription submitted. Poll /api/poll-transcription?id=" + transcriptId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Video processing error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
