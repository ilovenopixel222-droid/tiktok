import { NextRequest } from "next/server";
import { store } from "@/lib/store";
import { execFile } from "child_process";
import { promisify } from "util";

export const maxDuration = 300;

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

  const { videoUrl, title, momentTypes } = body;

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
    // Step 1: Extract direct audio URL from platform links
    store.updateJob(jobId, { progress: 5, status: "Extracting audio from video..." });

    let audioUrl: string;
    try {
      audioUrl = await getDirectAudioUrl(videoUrl);
    } catch (extractErr) {
      const msg = extractErr instanceof Error ? extractErr.message : "Failed to extract audio";
      store.updateJob(jobId, { progress: 0, status: `Error: ${msg}` });
      store.updateVideo(videoId, { status: "failed" });
      return Response.json({ error: msg }, { status: 400 });
    }

    // Step 2: Submit to AssemblyAI
    store.updateJob(jobId, { progress: 10, status: "Submitting audio to AssemblyAI..." });

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
      store.updateJob(jobId, { progress: 0, status: `Error: AssemblyAI rejected the request — ${errText}` });
      store.updateVideo(videoId, { status: "failed" });
      return Response.json({ error: `AssemblyAI submission failed: ${errText}` }, { status: 500 });
    }

    const { id: transcriptId } = await submitRes.json();
    store.updateJob(jobId, { progress: 20, status: "Transcribing audio..." });

    // Step 2: Poll for completion
    let transcript;
    for (let i = 0; i < 180; i++) {
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { Authorization: apiKey },
      });

      if (!pollRes.ok) {
        store.updateJob(jobId, { progress: 0, status: "Error: Failed to poll AssemblyAI" });
        store.updateVideo(videoId, { status: "failed" });
        return Response.json({ error: "Polling failed" }, { status: 500 });
      }

      transcript = await pollRes.json();

      if (transcript.status === "completed") break;
      if (transcript.status === "error") {
        store.updateJob(jobId, { progress: 0, status: `Error: ${transcript.error}` });
        store.updateVideo(videoId, { status: "failed" });
        return Response.json({ error: transcript.error }, { status: 500 });
      }

      const progress = Math.min(20 + i * 0.3, 60);
      store.updateJob(jobId, { progress: Math.round(progress), status: "Transcribing audio..." });

      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!transcript || transcript.status !== "completed") {
      store.updateJob(jobId, { progress: 0, status: "Error: Transcription timed out" });
      store.updateVideo(videoId, { status: "failed" });
      return Response.json({ error: "Transcription timed out" }, { status: 500 });
    }

    store.updateJob(jobId, { progress: 65, status: "Analyzing for viral moments..." });

    // Step 3: Detect moments
    const moments = detectMomentsFromTranscript(transcript, momentTypes);
    store.updateJob(jobId, {
      progress: 80,
      clipsFound: moments.length,
      status: `Found ${moments.length} viral moments. Generating clips...`,
    });

    // Step 4: Create clip records
    for (let i = 0; i < moments.length; i++) {
      const moment = moments[i];
      const clipId = `clip_${Date.now()}_${i}`;
      const actualDuration = Math.round((moment.end - moment.start) / 1000);

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
        duration: formatDuration(actualDuration),
        moment: moment.type,
        date: new Date().toISOString().split("T")[0],
        thumbnail: `gradient-${(i % 9) + 1}`,
        transcriptSegment: moment.text,
        startTime: moment.start,
        endTime: moment.end,
        sourceUrl: audioUrl,
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
      duration: formatDuration(Math.round(transcript.audio_duration || 0)),
    });

    store.updateJob(jobId, {
      progress: 100,
      clipsFound: moments.length,
      status: `Complete! ${moments.length} clips generated.`,
    });

    const generatedClips = store.getClipsByVideo(videoId);

    return Response.json({
      videoId,
      jobId,
      status: "complete",
      clipsGenerated: moments.length,
      clips: generatedClips,
      message: `Processing complete. ${moments.length} clips generated.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Video processing error:", message);
    store.updateJob(jobId, { status: `Error: ${message}`, progress: 0 });
    store.updateVideo(videoId, { status: "failed" });
    return Response.json({ error: message }, { status: 500 });
  }
}

interface TranscriptMoment {
  text: string;
  start: number;
  end: number;
  type: string;
  confidence: number;
  viralScore: number;
}

const MIN_CLIP_MS = 15000;
const MAX_CLIP_MS = 60000;
const IDEAL_CLIP_MS = 35000;
const OVERLAP_THRESHOLD_MS = 8000;

interface ScoredSegment {
  text: string;
  start: number;
  end: number;
  type: string;
  confidence: number;
  keywordHits: number;
  sentimentIntensity: number;
  lengthScore: number;
}

const PATTERNS: Array<{ keywords: string[]; type: string; weight: number }> = [
  { keywords: ["crazy", "insane", "wild", "omg", "what the", "no way", "oh my god", "holy", "unreal", "are you serious", "you're kidding", "i can't believe"], type: "Shocking", weight: 1.2 },
  { keywords: ["haha", "lol", "funny", "laugh", "hilarious", "joke", "comedy", "bro what", "i'm dead", "that's so", "bruh"], type: "Funny", weight: 1.15 },
  { keywords: ["disagree", "wrong", "debate", "argue", "but actually", "that's not", "i don't think", "you're wrong", "hold on", "wait what", "no no no"], type: "Debate", weight: 1.1 },
  { keywords: ["story", "remember", "one time", "back when", "let me tell", "so basically", "what happened was", "true story", "i'll never forget", "picture this"], type: "Storytelling", weight: 1.05 },
  { keywords: ["angry", "rage", "frustrated", "pissed", "mad", "furious", "so annoying", "sick of", "i hate", "this is bs"], type: "Rage", weight: 1.1 },
  { keywords: ["motivat", "inspire", "never give up", "you can", "believe in", "keep going", "don't quit", "push through", "you got this", "trust the process"], type: "Motivational", weight: 1.0 },
  { keywords: ["fail", "messed up", "disaster", "went wrong", "oops", "broken", "scuffed", "glitched", "crashed", "ruined"], type: "Stream Fail", weight: 1.15 },
  { keywords: ["emotional", "crying", "tears", "so sad", "heartbreak", "i miss", "it hurts", "i love you", "thank you so much", "that means"], type: "Emotional", weight: 1.05 },
  { keywords: ["controversial", "hot take", "unpopular opinion", "people don't realize", "nobody talks about", "here's the thing"], type: "Controversial", weight: 1.1 },
];

function computeViralScore(seg: ScoredSegment): number {
  const keywordFactor = Math.min(seg.keywordHits * 8, 30);
  const sentimentFactor = seg.sentimentIntensity * 25;
  const confidenceFactor = seg.confidence * 15;
  const lengthFactor = seg.lengthScore * 15;
  const baseFactor = 15;

  const pattern = PATTERNS.find((p) => p.type === seg.type);
  const weight = pattern?.weight || 1.0;

  const raw = (baseFactor + keywordFactor + sentimentFactor + confidenceFactor + lengthFactor) * weight;
  return Math.min(99, Math.max(40, Math.round(raw)));
}

function scoreLength(durationMs: number): number {
  if (durationMs < MIN_CLIP_MS) return 0.3;
  if (durationMs > MAX_CLIP_MS) return 0.5;
  const dist = Math.abs(durationMs - IDEAL_CLIP_MS) / IDEAL_CLIP_MS;
  return Math.max(0.4, 1.0 - dist);
}

function buildClipWindow(
  words: Array<{ text: string; start: number; end: number }>,
  anchorIdx: number,
): { start: number; end: number; text: string } | null {
  if (words.length === 0) return null;

  const anchor = words[anchorIdx];
  const targetStart = anchor.start - IDEAL_CLIP_MS / 2;
  const targetEnd = anchor.start + IDEAL_CLIP_MS / 2;

  let startIdx = anchorIdx;
  while (startIdx > 0 && words[startIdx - 1].start >= targetStart) startIdx--;

  let endIdx = anchorIdx;
  while (endIdx < words.length - 1 && words[endIdx + 1].end <= targetEnd) endIdx++;

  const clipStart = words[startIdx].start;
  const clipEnd = words[endIdx].end;
  const duration = clipEnd - clipStart;

  if (duration < MIN_CLIP_MS && endIdx < words.length - 1) {
    const needed = MIN_CLIP_MS - duration;
    while (endIdx < words.length - 1 && words[endIdx + 1].end - clipStart <= MAX_CLIP_MS) {
      endIdx++;
      if (words[endIdx].end - clipStart >= duration + needed) break;
    }
  }

  const finalStart = words[startIdx].start;
  const finalEnd = words[endIdx].end;
  if (finalEnd - finalStart < MIN_CLIP_MS * 0.7) return null;

  const text = words.slice(startIdx, endIdx + 1).map((w) => w.text).join(" ");
  return { start: finalStart, end: finalEnd, text: text.substring(0, 300) };
}

function detectMomentsFromTranscript(
  transcript: {
    utterances?: Array<{ text: string; start: number; end: number; confidence: number }>;
    sentiment_analysis_results?: Array<{ text: string; start: number; end: number; sentiment: string; confidence: number }>;
    text?: string;
    words?: Array<{ text: string; start: number; end: number }>;
  },
  momentTypes?: string[],
): TranscriptMoment[] {
  const types = momentTypes || [];
  const candidates: ScoredSegment[] = [];
  const words = transcript.words || [];

  const sentimentMap = new Map<number, { sentiment: string; confidence: number }>();
  for (const s of (transcript.sentiment_analysis_results || [])) {
    const bucket = Math.floor(s.start / 5000);
    const existing = sentimentMap.get(bucket);
    if (!existing || s.confidence > existing.confidence) {
      sentimentMap.set(bucket, { sentiment: s.sentiment, confidence: s.confidence });
    }
  }

  function getSentimentAt(timeMs: number): number {
    const bucket = Math.floor(timeMs / 5000);
    const s = sentimentMap.get(bucket);
    if (!s) return 0.5;
    if (s.sentiment === "POSITIVE") return 0.5 + s.confidence * 0.5;
    if (s.sentiment === "NEGATIVE") return 0.5 + s.confidence * 0.4;
    return 0.4;
  }

  // Scan utterances for keyword patterns
  const utterances = transcript.utterances || [];
  for (const u of utterances) {
    const textLower = u.text.toLowerCase();
    for (const pattern of PATTERNS) {
      const hits = pattern.keywords.filter((k) => textLower.includes(k)).length;
      if (hits === 0) continue;
      if (types.length > 0 && !types.some((t) => t.toLowerCase().includes(pattern.type.toLowerCase()))) continue;

      // Expand to a proper clip window using word-level timestamps
      let clipWindow: { start: number; end: number; text: string } | null = null;
      if (words.length > 0) {
        const anchorTime = (u.start + u.end) / 2;
        let closestIdx = 0;
        let closestDist = Infinity;
        for (let i = 0; i < words.length; i++) {
          const dist = Math.abs(words[i].start - anchorTime);
          if (dist < closestDist) { closestDist = dist; closestIdx = i; }
        }
        clipWindow = buildClipWindow(words, closestIdx);
      }

      const start = clipWindow?.start ?? u.start;
      const end = clipWindow?.end ?? u.end;
      const text = clipWindow?.text ?? u.text;
      const duration = end - start;

      candidates.push({
        text,
        start,
        end,
        type: pattern.type,
        confidence: u.confidence,
        keywordHits: hits,
        sentimentIntensity: getSentimentAt(u.start),
        lengthScore: scoreLength(duration),
      });
    }
  }

  // Scan high-sentiment regions not already covered
  for (const s of (transcript.sentiment_analysis_results || [])) {
    if (s.confidence < 0.7) continue;
    const alreadyCovered = candidates.some(
      (c) => Math.abs(c.start - s.start) < OVERLAP_THRESHOLD_MS
    );
    if (alreadyCovered) continue;

    if (words.length > 0) {
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < words.length; i++) {
        const dist = Math.abs(words[i].start - s.start);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
      }
      const clipWindow = buildClipWindow(words, closestIdx);
      if (clipWindow) {
        const momentType = s.sentiment === "POSITIVE" ? "Emotional"
          : s.sentiment === "NEGATIVE" ? "Controversial" : "Highlight";
        if (types.length === 0 || types.some((t) => t.toLowerCase().includes(momentType.toLowerCase()))) {
          candidates.push({
            text: clipWindow.text,
            start: clipWindow.start,
            end: clipWindow.end,
            type: momentType,
            confidence: s.confidence,
            keywordHits: 0,
            sentimentIntensity: s.confidence,
            lengthScore: scoreLength(clipWindow.end - clipWindow.start),
          });
        }
      }
    }
  }

  // Fallback: evenly spaced segments if very few candidates
  if (candidates.length < 2 && words.length > 0) {
    const totalDuration = words[words.length - 1].end - words[0].start;
    const numSegments = Math.min(5, Math.max(2, Math.floor(totalDuration / IDEAL_CLIP_MS)));
    const step = Math.floor(words.length / numSegments);

    for (let i = 0; i < numSegments; i++) {
      const anchorIdx = Math.min(i * step + Math.floor(step / 2), words.length - 1);
      const clipWindow = buildClipWindow(words, anchorIdx);
      if (clipWindow) {
        candidates.push({
          text: clipWindow.text,
          start: clipWindow.start,
          end: clipWindow.end,
          type: "Highlight",
          confidence: 0.6,
          keywordHits: 0,
          sentimentIntensity: getSentimentAt(words[anchorIdx].start),
          lengthScore: scoreLength(clipWindow.end - clipWindow.start),
        });
      }
    }
  }

  // Score, deduplicate, and sort
  const scored = candidates.map((c) => ({
    text: c.text,
    start: c.start,
    end: c.end,
    type: c.type,
    confidence: c.confidence,
    viralScore: computeViralScore(c),
  }));

  scored.sort((a, b) => b.viralScore - a.viralScore);

  const unique: TranscriptMoment[] = [];
  for (const m of scored) {
    const overlaps = unique.some(
      (u) => !(m.end <= u.start + OVERLAP_THRESHOLD_MS || m.start >= u.end - OVERLAP_THRESHOLD_MS)
    );
    if (!overlaps) unique.push(m);
    if (unique.length >= 10) break;
  }

  return unique;
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
    Highlight: ["⭐ ", "Best moment: ", ""],
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
