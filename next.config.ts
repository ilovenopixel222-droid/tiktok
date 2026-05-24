import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/clip-extract": ["node_modules/ffmpeg-static/ffmpeg"],
  },
};

export default nextConfig;
