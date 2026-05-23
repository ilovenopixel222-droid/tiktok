import { NextRequest } from "next/server";

interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

interface TranscriptUtterance {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: string;
  words: TranscriptWord[];
}

interface AssemblyAITranscript {
  id: string;
  status: string;
  text: string;
  words: TranscriptWord[];
  utterances?: TranscriptUtterance[];
  sentiment_analysis_results?: Array<{
    text: string;
    start: number;
    end: number;
    sentiment: string;
    confidence: number;
  }>;
  content_safety_labels?: {
    results: Array<{
      text: string;
      labels: Array<{ label: string; confidence: number }>;
      timestamp: { start: number; end: number };
    }>;
  };
  error?: string;
}

interface DetectedMoment {
  text: string;
  start: number;
  end: number;
  type: string;
  confidence: number;
  viralScore: number;
}

const ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2";

async function submitTranscription(audioUrl: string, apiKey: string): Promise<string> {
  const res = await fetch(`${ASSEMBLYAI_BASE}/transcript`, {
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
      content_safety: true,
      auto_highlights: true,
      summarization: true,
      summary_model: "informative",
      summary_type: "bullets",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AssemblyAI submission failed: ${err}`);
  }

  const data = await res.json();
  return data.id;
}

async function pollTranscription(transcriptId: string, apiKey: string): Promise<AssemblyAITranscript> {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${ASSEMBLYAI_BASE}/transcript/${transcriptId}`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      throw new Error(`AssemblyAI poll failed: ${res.status}`);
    }

    const data: AssemblyAITranscript = await res.json();

    if (data.status === "completed") {
      return data;
    }

    if (data.status === "error") {
      throw new Error(`Transcription failed: ${data.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error("Transcription timed out");
}

function detectMoments(transcript: AssemblyAITranscript): DetectedMoment[] {
  const moments: DetectedMoment[] = [];

  const sentiments = transcript.sentiment_analysis_results || [];

  for (const s of sentiments) {
    if (s.sentiment === "POSITIVE" && s.confidence > 0.7) {
      moments.push({
        text: s.text,
        start: s.start,
        end: s.end,
        type: "emotional",
        confidence: s.confidence,
        viralScore: Math.round(s.confidence * 90 + Math.random() * 10),
      });
    }
    if (s.sentiment === "NEGATIVE" && s.confidence > 0.7) {
      moments.push({
        text: s.text,
        start: s.start,
        end: s.end,
        type: "controversial",
        confidence: s.confidence,
        viralScore: Math.round(s.confidence * 85 + Math.random() * 10),
      });
    }
  }

  if (transcript.utterances) {
    for (const u of transcript.utterances) {
      const text = u.text.toLowerCase();

      if (text.includes("!") || text.includes("crazy") || text.includes("insane") || text.includes("wild")) {
        moments.push({
          text: u.text,
          start: u.start,
          end: u.end,
          type: "shocking",
          confidence: u.confidence,
          viralScore: Math.round(75 + Math.random() * 20),
        });
      }

      if (text.includes("haha") || text.includes("lol") || text.includes("funny") || text.includes("laugh")) {
        moments.push({
          text: u.text,
          start: u.start,
          end: u.end,
          type: "funny",
          confidence: u.confidence,
          viralScore: Math.round(80 + Math.random() * 15),
        });
      }

      if (text.includes("think") || text.includes("believe") || text.includes("opinion") || text.includes("disagree")) {
        moments.push({
          text: u.text,
          start: u.start,
          end: u.end,
          type: "debate",
          confidence: u.confidence,
          viralScore: Math.round(70 + Math.random() * 20),
        });
      }

      if (text.includes("story") || text.includes("remember") || text.includes("when i") || text.includes("one time")) {
        moments.push({
          text: u.text,
          start: u.start,
          end: u.end,
          type: "storytelling",
          confidence: u.confidence,
          viralScore: Math.round(75 + Math.random() * 15),
        });
      }

      if (u.text.length > 200 && u.confidence > 0.8) {
        moments.push({
          text: u.text.substring(0, 200) + "...",
          start: u.start,
          end: u.end,
          type: "highlight",
          confidence: u.confidence,
          viralScore: Math.round(65 + Math.random() * 25),
        });
      }
    }
  }

  // Deduplicate by time overlap
  const unique: DetectedMoment[] = [];
  for (const m of moments.sort((a, b) => b.viralScore - a.viralScore)) {
    const overlaps = unique.some(
      (u) => Math.abs(u.start - m.start) < 5000 && Math.abs(u.end - m.end) < 5000
    );
    if (!overlaps) unique.push(m);
  }

  return unique.sort((a, b) => b.viralScore - a.viralScore).slice(0, 20);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AssemblyAI API key not configured" },
      { status: 500 }
    );
  }

  let body: { audioUrl?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { audioUrl } = body;

  if (!audioUrl) {
    return Response.json(
      { error: "audioUrl is required" },
      { status: 400 }
    );
  }

  try {
    const transcriptId = await submitTranscription(audioUrl, apiKey);

    return Response.json({
      transcriptId,
      status: "processing",
      message: "Transcription submitted. Poll /api/transcribe/status for results.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AssemblyAI API key not configured" },
      { status: 500 }
    );
  }

  const transcriptId = request.nextUrl.searchParams.get("id");
  if (!transcriptId) {
    return Response.json({ error: "id parameter is required" }, { status: 400 });
  }

  try {
    const transcript = await pollTranscription(transcriptId, apiKey);
    const moments = detectMoments(transcript);

    return Response.json({
      status: "completed",
      text: transcript.text,
      moments,
      wordCount: transcript.words?.length || 0,
      utteranceCount: transcript.utterances?.length || 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
