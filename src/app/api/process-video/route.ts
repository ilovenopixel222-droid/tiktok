import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { execFile } from "child_process";
import { promisify } from "util";

export const maxDuration = 60;

const execFileAsync = promisify(execFile);

function isPlatformUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|twitch\.tv|kick\.com|rumble\.com)/i.test(url);
}

async function getDirectAudioUrl(videoUrl: string): Promise<string> {
  if (isPlatformUrl(videoUrl)) {
    try {
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
      // yt-dlp not available or failed
    }

    throw new Error(
      "Could not extract audio from this URL. YouTube and other platforms may block server-side downloads. Please download the video and upload the file directly using the Upload tab."
    );
  }

  const headRes = await fetch(videoUrl, { method: "HEAD" }).catch(() => null);
  if (headRes) {
    const contentType = headRes.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error(
        "This URL returns a web page, not a media file. Please upload the video file directly or provide a direct link to the audio/video file."
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
    source: videoUrl.includes("youtube") ? "YouTube"
      : videoUrl.includes("twitch") ? "Twitch"
      : videoUrl.includes("kick") ? "Kick"
      : videoUrl.includes("rumble") ? "Rumble"
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
