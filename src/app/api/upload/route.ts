import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
  ];

  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { error: "Unsupported file type. Supported: MP4, MOV, AVI, WEBM, MKV, MP3, WAV" },
      { status: 400 }
    );
  }

  const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
  if (file.size > maxSize) {
    return Response.json(
      { error: "File too large. Maximum size is 10GB" },
      { status: 400 }
    );
  }

  // Save file to uploads directory
  const uploadsDir = join(process.cwd(), "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const videoId = `vid_${Date.now()}`;

  // Store video record
  store.addVideo({
    id: videoId,
    title: file.name.replace(/\.[^/.]+$/, ""),
    source: "Upload",
    duration: "Processing...",
    size: formatFileSize(file.size),
    clips: 0,
    date: new Date().toISOString().split("T")[0],
    status: "queued",
    filePath,
  });

  return Response.json({
    videoId,
    filename: file.name,
    size: file.size,
    filePath: `/uploads/${filename}`,
    status: "uploaded",
  }, { status: 201 });
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
