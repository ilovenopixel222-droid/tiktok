import { NextRequest } from "next/server";
import { store } from "@/lib/store";

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
    clipLength?: string;
    captionStyle?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { videoUrl, title, momentTypes, clipLength } = body;

  if (!videoUrl) {
    return Response.json({ error: "videoUrl is required" }, { status: 400 });
  }

  const videoId = `vid_${Date.now()}`;
  const jobId = `job_${Date.now()}`;

  // Store video record
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

  // Create processing job
  store.addJob({
    id: jobId,
    videoId,
    title: title || `Processing: ${videoUrl.substring(0, 50)}...`,
    progress: 0,
    clipsFound: 0,
    status: "Submitting to AssemblyAI...",
    createdAt: new Date().toISOString(),
  });

  // Start async processing
  processVideoAsync(videoId, jobId, videoUrl, apiKey, momentTypes, clipLength).catch(
    (error) => {
      console.error("Video processing error:", error);
      store.updateJob(jobId, {
        status: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        progress: 0,
      });
      store.updateVideo(videoId, { status: "failed" });
    }
  );

  return Response.json({
    videoId,
    jobId,
    status: "processing",
    message: "Video processing started. Check /api/jobs for progress.",
  }, { status: 201 });
}

async function processVideoAsync(
  videoId: string,
  jobId: string,
  videoUrl: string,
  apiKey: string,
  momentTypes?: string[],
  clipLength?: string,
) {
  // Step 1: Submit to AssemblyAI
  store.updateJob(jobId, { progress: 10, status: "Submitting audio to AssemblyAI..." });

  const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: videoUrl,
      speaker_labels: true,
      sentiment_analysis: true,
      auto_highlights: true,
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`AssemblyAI submission failed: ${await submitRes.text()}`);
  }

  const { id: transcriptId } = await submitRes.json();
  store.updateJob(jobId, { progress: 20, status: "Transcribing audio..." });

  // Step 2: Poll for completion
  let transcript;
  for (let i = 0; i < 120; i++) {
    const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { Authorization: apiKey },
    });

    if (!pollRes.ok) throw new Error("Polling failed");

    transcript = await pollRes.json();

    if (transcript.status === "completed") break;
    if (transcript.status === "error") throw new Error(transcript.error);

    const progress = Math.min(20 + i * 0.5, 60);
    store.updateJob(jobId, { progress: Math.round(progress), status: "Transcribing audio..." });

    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!transcript || transcript.status !== "completed") {
    throw new Error("Transcription timed out");
  }

  store.updateJob(jobId, { progress: 65, status: "Analyzing for viral moments..." });

  // Step 3: Detect moments from transcript
  const moments = detectMomentsFromTranscript(transcript, momentTypes);
  store.updateJob(jobId, {
    progress: 80,
    clipsFound: moments.length,
    status: `Found ${moments.length} viral moments. Generating clips...`,
  });

  // Step 4: Create clip records for each moment
  const clipDuration = clipLength === "15-30s" ? 25 : clipLength === "60-90s" ? 75 : 45;

  for (let i = 0; i < moments.length; i++) {
    const moment = moments[i];
    const clipId = `clip_${Date.now()}_${i}`;

    store.addClip({
      id: clipId,
      videoId,
      title: generateClipTitle(moment),
      viralScore: moment.viralScore,
      views: 0,
      likes: 0,
      comments: 0,
      status: "ready",
      platform: "TikTok",
      duration: formatDuration(clipDuration),
      moment: moment.type,
      date: new Date().toISOString().split("T")[0],
      thumbnail: `gradient-${(i % 9) + 1}`,
      transcriptSegment: moment.text,
      startTime: moment.start,
      endTime: moment.end,
    });

    store.updateJob(jobId, {
      progress: Math.round(80 + (i / moments.length) * 18),
      status: `Generated clip ${i + 1}/${moments.length}...`,
    });
  }

  // Step 5: Finalize
  store.updateVideo(videoId, {
    status: "processed",
    clips: moments.length,
    duration: formatDuration(Math.round((transcript.audio_duration || 0))),
  });

  store.updateJob(jobId, {
    progress: 100,
    clipsFound: moments.length,
    status: `Complete! ${moments.length} clips generated.`,
  });
}

interface TranscriptMoment {
  text: string;
  start: number;
  end: number;
  type: string;
  confidence: number;
  viralScore: number;
}

function detectMomentsFromTranscript(
  transcript: { utterances?: Array<{ text: string; start: number; end: number; confidence: number }>; sentiment_analysis_results?: Array<{ text: string; start: number; end: number; sentiment: string; confidence: number }> },
  momentTypes?: string[],
): TranscriptMoment[] {
  const moments: TranscriptMoment[] = [];
  const types = momentTypes || [];

  const sentiments = transcript.sentiment_analysis_results || [];

  for (const s of sentiments) {
    if (s.sentiment === "POSITIVE" && s.confidence > 0.6) {
      moments.push({
        text: s.text,
        start: s.start,
        end: s.end,
        type: "Emotional",
        confidence: s.confidence,
        viralScore: Math.round(s.confidence * 85 + Math.random() * 15),
      });
    }
    if (s.sentiment === "NEGATIVE" && s.confidence > 0.6) {
      moments.push({
        text: s.text,
        start: s.start,
        end: s.end,
        type: "Controversial",
        confidence: s.confidence,
        viralScore: Math.round(s.confidence * 80 + Math.random() * 15),
      });
    }
  }

  if (transcript.utterances) {
    for (const u of transcript.utterances) {
      const text = u.text.toLowerCase();

      const patterns: Array<{ keywords: string[]; type: string; baseScore: number }> = [
        { keywords: ["crazy", "insane", "wild", "omg", "what the"], type: "Shocking", baseScore: 82 },
        { keywords: ["haha", "lol", "funny", "laugh", "😂"], type: "Funny", baseScore: 85 },
        { keywords: ["think", "believe", "opinion", "disagree", "wrong"], type: "Debate", baseScore: 75 },
        { keywords: ["story", "remember", "one time", "back when", "let me tell"], type: "Storytelling", baseScore: 78 },
        { keywords: ["angry", "rage", "frustrated", "pissed", "mad"], type: "Rage", baseScore: 80 },
        { keywords: ["motivat", "inspire", "never give up", "you can", "believe in"], type: "Motivational", baseScore: 77 },
        { keywords: ["fail", "messed up", "disaster", "went wrong"], type: "Stream Fail", baseScore: 83 },
      ];

      for (const pattern of patterns) {
        if (pattern.keywords.some((k) => text.includes(k))) {
          if (types.length === 0 || types.some((t) => t.toLowerCase().includes(pattern.type.toLowerCase()))) {
            moments.push({
              text: u.text,
              start: u.start,
              end: u.end,
              type: pattern.type,
              confidence: u.confidence,
              viralScore: Math.round(pattern.baseScore + Math.random() * 15),
            });
          }
        }
      }
    }
  }

  // Deduplicate by time overlap
  const unique: TranscriptMoment[] = [];
  for (const m of moments.sort((a, b) => b.viralScore - a.viralScore)) {
    const overlaps = unique.some(
      (u) => Math.abs(u.start - m.start) < 10000 && Math.abs(u.end - m.end) < 10000
    );
    if (!overlaps) unique.push(m);
  }

  return unique.slice(0, 15);
}

function generateClipTitle(moment: TranscriptMoment): string {
  const text = moment.text.substring(0, 60);
  const prefixes: Record<string, string[]> = {
    Funny: ["😂 ", "When ", "The moment "],
    Shocking: ["🤯 ", "INSANE: ", "You won't believe "],
    Emotional: ["😢 ", "This hit different: ", "The most emotional "],
    Controversial: ["🔥 ", "Hot take: ", "Controversial: "],
    Debate: ["⚔️ ", "The debate: ", ""],
    Storytelling: ["📖 ", "Story time: ", ""],
    Rage: ["😡 ", "RAGE: ", "Got so mad: "],
    Motivational: ["💪 ", "Motivation: ", ""],
    "Stream Fail": ["💀 ", "FAIL: ", "Stream fail: "],
  };

  const typePrefix = prefixes[moment.type] || [""];
  const prefix = typePrefix[Math.floor(Math.random() * typePrefix.length)];

  return `${prefix}${text}${text.length >= 60 ? "..." : ""}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
