import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return new Response(
      `<html><body><script>window.opener?.postMessage({type:'tiktok_error',error:'${error || "No authorization code"}'},'*');window.close();</script><p>Authorization failed. You can close this window.</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return new Response(
      `<html><body><script>window.opener?.postMessage({type:'tiktok_error',error:'TikTok credentials not configured'},'*');window.close();</script><p>Server configuration error. You can close this window.</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${request.nextUrl.origin}/api/tiktok/callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return new Response(
        `<html><body><script>window.opener?.postMessage({type:'tiktok_error',error:'${tokenData.error.message || tokenData.error}'},'*');window.close();</script><p>Token exchange failed. You can close this window.</p></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return new Response(
      `<html><body><script>window.opener?.postMessage({type:'tiktok_success',accessToken:'${tokenData.access_token}',openId:'${tokenData.open_id}'},'*');window.close();</script><p>TikTok connected! You can close this window.</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new Response(
      `<html><body><script>window.opener?.postMessage({type:'tiktok_error',error:'Token exchange failed'},'*');window.close();</script><p>Connection failed. You can close this window.</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
