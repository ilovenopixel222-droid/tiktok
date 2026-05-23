import { store } from "@/lib/store";

export async function GET() {
  const jobs = store.getAllJobs();

  return Response.json({
    jobs,
    total: jobs.length,
  });
}
