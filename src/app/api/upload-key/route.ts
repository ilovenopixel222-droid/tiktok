export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AssemblyAI API key not configured" },
      { status: 500 }
    );
  }

  return Response.json({ key: apiKey });
}
