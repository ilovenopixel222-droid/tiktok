import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ffmpeg-static", "@distube/ytdl-core"],
  outputFileTracingIncludes: {
    "/api/clip-extract": ["node_modules/ffmpeg-static/ffmpeg"],
  },
};

export default nextConfig;
