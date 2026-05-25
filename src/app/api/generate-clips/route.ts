import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body too large or invalid JSON. Use client-side clip generation instead." }, { status: 413 });
  }
  const { transcript, momentTypes, videoId: inputVideoId, audioUrl } = body as {
    transcript: {
      text?: string;
      words?: Array<{ text: string; start: number; end: number }>;
      utterances?: Array<{ text: string; start: number; end: number; confidence: number }>;
      sentiment_analysis_results?: Array<{ text: string; start: number; end: number; sentiment: string; confidence: number }>;
      audio_duration?: number;
    };
    momentTypes?: string[];
    title?: string;
    videoId?: string;
    audioUrl?: string;
  };

  if (!transcript) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }

  const moments = detectMomentsFromTranscript(transcript, momentTypes);
  const videoId = inputVideoId || `vid_${Date.now()}`;

  const clips = moments.map((moment, i) => {
    const actualDuration = Math.round((moment.end - moment.start) / 1000);
    return {
      id: `clip_${Date.now()}_${i}`,
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
      sourceUrl: audioUrl || "",
    };
  });

  return Response.json({
    videoId,
    status: "complete",
    clipsGenerated: clips.length,
    clips,
    audioDuration: transcript.audio_duration,
    message: `${clips.length} clips generated.`,
  });
}

// --- Moment detection logic (same as process-video) ---

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

  const utterances = transcript.utterances || [];
  for (const u of utterances) {
    const textLower = u.text.toLowerCase();
    for (const pattern of PATTERNS) {
      const hits = pattern.keywords.filter((k) => textLower.includes(k)).length;
      if (hits === 0) continue;
      if (types.length > 0 && !types.some((t) => t.toLowerCase().includes(pattern.type.toLowerCase()))) continue;
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
      candidates.push({
        text, start, end, type: pattern.type,
        confidence: u.confidence,
        keywordHits: hits,
        sentimentIntensity: getSentimentAt(u.start),
        lengthScore: scoreLength(end - start),
      });
    }
  }

  for (const s of (transcript.sentiment_analysis_results || [])) {
    if (s.confidence < 0.7) continue;
    const alreadyCovered = candidates.some((c) => Math.abs(c.start - s.start) < OVERLAP_THRESHOLD_MS);
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
            text: clipWindow.text, start: clipWindow.start, end: clipWindow.end,
            type: momentType, confidence: s.confidence, keywordHits: 0,
            sentimentIntensity: s.confidence, lengthScore: scoreLength(clipWindow.end - clipWindow.start),
          });
        }
      }
    }
  }

  if (candidates.length < 2 && words.length > 0) {
    const totalDuration = words[words.length - 1].end - words[0].start;
    const numSegments = Math.min(5, Math.max(2, Math.floor(totalDuration / IDEAL_CLIP_MS)));
    const step = Math.floor(words.length / numSegments);
    for (let i = 0; i < numSegments; i++) {
      const anchorIdx = Math.min(i * step + Math.floor(step / 2), words.length - 1);
      const clipWindow = buildClipWindow(words, anchorIdx);
      if (clipWindow) {
        candidates.push({
          text: clipWindow.text, start: clipWindow.start, end: clipWindow.end,
          type: "Highlight", confidence: 0.6, keywordHits: 0,
          sentimentIntensity: getSentimentAt(words[anchorIdx].start),
          lengthScore: scoreLength(clipWindow.end - clipWindow.start),
        });
      }
    }
  }

  const scored = candidates.map((c) => ({
    text: c.text, start: c.start, end: c.end, type: c.type,
    confidence: c.confidence, viralScore: computeViralScore(c),
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
    Funny: ["\u{1F602} ", "When ", "The moment "],
    Shocking: ["\u{1F92F} ", "INSANE: ", "You won't believe "],
    Emotional: ["\u{1F622} ", "This hit different: ", "The most emotional "],
    Controversial: ["\u{1F525} ", "Hot take: ", "Controversial: "],
    Debate: ["\u{2694}\u{FE0F} ", "The debate: ", ""],
    Storytelling: ["\u{1F4D6} ", "Story time: ", ""],
    Rage: ["\u{1F621} ", "RAGE: ", "Got so mad: "],
    Motivational: ["\u{1F4AA} ", "Motivation: ", ""],
    "Stream Fail": ["\u{1F480} ", "FAIL: ", "Stream fail: "],
    Highlight: ["\u{2B50} ", "Best moment: ", ""],
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
