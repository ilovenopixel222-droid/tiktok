import { NextRequest } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  const allClips = store.getAllClips();
  const filtered = status ? allClips.filter((c) => c.status === status) : allClips;

  return Response.json({
    clips: filtered,
    total: allClips.length,
  });
}
