import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    return Response.json({
      error: "TikTok API credentials not configured. Add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET to your environment variables.",
      setup: {
        steps: [
          "Go to https://developers.tiktok.com/ and create an app",
          "Get your Client Key and Client Secret",
          "Add them as environment variables: TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET",
        ],
      },
    }, { status: 400 });
  }

  const redirectUri = `${request.nextUrl.origin}/api/tiktok/callback`;
  const scope = "user.info.basic,video.publish,video.upload";
  const state = `tiktok_${Date.now()}`;

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return Response.json({ authUrl });
}
