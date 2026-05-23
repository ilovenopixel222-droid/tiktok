import { NextRequest } from "next/server";

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

  const upload = {
    id: `upload_${Date.now()}`,
    filename: file.name,
    size: file.size,
    type: file.type,
    status: "uploaded",
    url: `/uploads/${file.name}`,
    created_at: new Date().toISOString(),
  };

  return Response.json({ upload }, { status: 201 });
}
