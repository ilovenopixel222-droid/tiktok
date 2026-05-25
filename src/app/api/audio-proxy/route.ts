import { NextRequest } from "next/server";
import https from "https";
import http from "http";

export const maxDuration = 120;

function downloadBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const isAssemblyAI = url.includes("assemblyai.com") || url.includes("cdn.assemblyai");
    const mod = url.startsWith("https") ? https : http;
    const options = isAssemblyAI ? { rejectUnauthorized: false } : {};

    mod.get(url, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadBuffer(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () =>
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: res.headers["content-type"] || "audio/mpeg",
        })
      );
      res.on("error", reject);
    }).on("error", reject);
  });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const isAssemblyAI = url.includes("assemblyai.com") || url.includes("cdn.assemblyai");

    if (isAssemblyAI) {
      const { buffer, contentType } = await downloadBuffer(url);
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString(),
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return new Response(`Upstream returned ${res.status}`, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    const contentLength = res.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    };
    if (contentLength) headers["Content-Length"] = contentLength;

    return new Response(res.body, { status: 200, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    return new Response(msg, { status: 500 });
  }
}
