import { NextRequest } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export const maxDuration = 300;

const execFileAsync = promisify(execFile);

async function findFfmpeg(): Promise<string | null> {
  // Try ffmpeg-static first
  try {
    const ffmpegStatic = (await import("ffmpeg-static")).default;
    if (typeof ffmpegStatic === "string") {
      await access(ffmpegStatic);
      return ffmpegStatic;
    }
  } catch {}

  // Try system ffmpeg
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return "ffmpeg";
  } catch {}

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sourceUrl, startMs, endMs, title } = body as {
    sourceUrl: string;
    startMs: number;
    endMs: number;
    title?: string;
  };

  if (!sourceUrl || startMs === undefined || endMs === undefined) {
    return Response.json(
      { error: "sourceUrl, startMs, and endMs are required" },
      { status: 400 }
    );
  }

  const ffmpegPath = await findFfmpeg();
  if (!ffmpegPath) {
    return Response.json(
      { error: "FFmpeg is not available on this server" },
      { status: 500 }
    );
  }

  const startSec = startMs / 1000;
  const durationSec = (endMs - startMs) / 1000;
  const tmpDir = tmpdir();
  const inputFile = join(tmpDir, `input_${Date.now()}.tmp`);
  const outputFile = join(tmpDir, `clip_${Date.now()}.mp3`);

  try {
    // Download source audio
    const audioRes = await fetch(sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!audioRes.ok) {
      return Response.json(
        { error: `Failed to download source audio: ${audioRes.status}` },
        { status: 502 }
      );
    }

    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    await writeFile(inputFile, audioBuffer);

    // Extract clip with FFmpeg
    await execFileAsync(ffmpegPath, [
      "-y",
      "-i", inputFile,
      "-ss", startSec.toString(),
      "-t", durationSec.toString(),
      "-vn",
      "-acodec", "libmp3lame",
      "-ab", "192k",
      "-ar", "44100",
      outputFile,
    ], { timeout: 120000 });

    const clipBuffer = await readFile(outputFile);

    // Clean up temp files
    await unlink(inputFile).catch(() => {});
    await unlink(outputFile).catch(() => {});

    const safeName = (title || "clip").replace(/[^a-zA-Z0-9_-]/g, "_");

    return new Response(clipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${safeName}.mp3"`,
        "Content-Length": clipBuffer.length.toString(),
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    // Clean up on error
    await unlink(inputFile).catch(() => {});
    await unlink(outputFile).catch(() => {});

    const msg = err instanceof Error ? err.message : "Clip extraction failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
