import { NextRequest } from "next/server";
import { store } from "@/lib/store";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AssemblyAI API key not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm",
    "video/x-matroska", "audio/mpeg", "audio/wav", "audio/mp4",
    "audio/ogg", "audio/flac", "audio/x-m4a",
  ];

  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { error: "Unsupported file type. Supported: MP4, MOV, AVI, WEBM, MKV, MP3, WAV, OGG, FLAC, M4A" },
      { status: 400 }
    );
  }

  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB (AssemblyAI limit)
  if (file.size > maxSize) {
    return Response.json(
      { error: "File too large. Maximum size is 2GB" },
      { status: 400 }
    );
  }

  try {
    // Upload directly to AssemblyAI's upload endpoint
    const bytes = await file.arrayBuffer();

    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/octet-stream",
      },
      body: Buffer.from(bytes),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return Response.json(
        { error: `Upload to processing server failed: ${errText}` },
        { status: 500 }
      );
    }

    const uploadData = await uploadRes.json();
    const uploadUrl = uploadData.upload_url;

    const videoId = `vid_${Date.now()}`;

    store.addVideo({
      id: videoId,
      title: file.name.replace(/\.[^/.]+$/, ""),
      source: "Upload",
      duration: "Processing...",
      size: formatFileSize(file.size),
      clips: 0,
      date: new Date().toISOString().split("T")[0],
      status: "queued",
      url: uploadUrl,
    });

    return Response.json({
      videoId,
      filename: file.name,
      size: file.size,
      uploadUrl,
      status: "uploaded",
    }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
