import { store } from "@/lib/store";

export async function GET() {
  const videos = store.getAllVideos();

  return Response.json({
    videos,
    total: videos.length,
  });
}
