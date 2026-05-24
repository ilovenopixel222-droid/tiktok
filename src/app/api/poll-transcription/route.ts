import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const transcriptId = request.nextUrl.searchParams.get("id");
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!transcriptId) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
    { headers: { Authorization: apiKey } }
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to poll AssemblyAI" }, { status: 502 });
  }

  const data = await res.json();

  if (data.status === "completed") {
    return Response.json({
      status: "completed",
      transcript: {
        text: data.text,
        words: data.words,
        utterances: data.utterances,
        sentiment_analysis_results: data.sentiment_analysis_results,
        audio_duration: data.audio_duration,
      },
    });
  }

  if (data.status === "error") {
    return Response.json({ status: "error", error: data.error });
  }

  return Response.json({ status: data.status });
}
