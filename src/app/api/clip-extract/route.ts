import { NextRequest } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export const maxDuration = 300;

const execFileAsync = promisify(execFile);

async function findFfmpeg(): Promise<string | null> {
  try {
    const ffmpegStatic = (await import("ffmpeg-static")).default;
    if (typeof ffmpegStatic === "string") {
      await access(ffmpegStatic);
      return ffmpegStatic;
    }
  } catch {}

  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return "ffmpeg";
  } catch {}

  return null;
}

async function hasVideoStream(ffmpegPath: string, inputFile: string): Promise<boolean> {
  try {
    const ffprobePath = ffmpegPath === "ffmpeg" ? "ffprobe" : ffmpegPath.replace("ffmpeg", "ffprobe");
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=codec_type",
      "-of", "csv=p=0",
      inputFile,
    ], { timeout: 10000 });
    return stdout.trim().includes("video");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sourceUrl, startMs, endMs, title, format } = body as {
    sourceUrl: string;
    startMs: number;
    endMs: number;
    title?: string;
    format?: "mp4" | "mp3";
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
  const ts = Date.now();
  const inputFile = join(tmpDir, `input_${ts}.tmp`);

  try {
    const audioRes = await fetch(sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!audioRes.ok) {
      return Response.json(
        { error: `Failed to download source: ${audioRes.status}` },
        { status: 502 }
      );
    }

    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    await writeFile(inputFile, audioBuffer);

    const outputFormat = format || "mp4";
    const hasVideo = await hasVideoStream(ffmpegPath, inputFile);

    let outputFile: string;
    let ffmpegArgs: string[];
    let contentType: string;
    let fileExt: string;

    if (hasVideo && outputFormat === "mp4") {
      outputFile = join(tmpDir, `clip_${ts}.mp4`);
      fileExt = "mp4";
      contentType = "video/mp4";
      ffmpegArgs = [
        "-y",
        "-i", inputFile,
        "-ss", startSec.toString(),
        "-t", durationSec.toString(),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-vf", "scale='min(1080,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease",
        outputFile,
      ];
    } else {
      outputFile = join(tmpDir, `clip_${ts}.mp3`);
      fileExt = "mp3";
      contentType = "audio/mpeg";
      ffmpegArgs = [
        "-y",
        "-i", inputFile,
        "-ss", startSec.toString(),
        "-t", durationSec.toString(),
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "192k",
        "-ar", "44100",
        outputFile,
      ];
    }

    await execFileAsync(ffmpegPath, ffmpegArgs, {
      timeout: 180000,
      maxBuffer: 50 * 1024 * 1024,
    });

    const clipBuffer = await readFile(outputFile);

    await unlink(inputFile).catch(() => {});
    await unlink(outputFile).catch(() => {});

    const safeName = (title || "clip").replace(/[^a-zA-Z0-9_-]/g, "_");

    return new Response(clipBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}.${fileExt}"`,
        "Content-Length": clipBuffer.length.toString(),
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    await unlink(inputFile).catch(() => {});

    const msg = err instanceof Error ? err.message : "Clip extraction failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
