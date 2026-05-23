import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, email, password, name } = body;

  if (action === "signup") {
    if (!email || !password || !name) {
      return Response.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    return Response.json(
      {
        user: {
          id: `user_${Date.now()}`,
          email,
          name,
          plan: "free",
          created_at: new Date().toISOString(),
        },
        message: "Account created. Please verify your email.",
      },
      { status: 201 }
    );
  }

  if (action === "login") {
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    return Response.json({
      user: {
        id: "user_demo",
        email,
        name: "Demo User",
        plan: "pro",
        created_at: "2026-01-01T00:00:00Z",
      },
      token: "demo_token_" + Date.now(),
    });
  }

  if (action === "forgot_password") {
    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    return Response.json({
      message: "Password reset link sent to " + email,
    });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
