import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { jobApplicationSelect } from "@/server/jobs/selects";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { userId: true } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { jobId },
    select: jobApplicationSelect,
    orderBy: { createdAt: "desc" },
  });

  const response = NextResponse.json(applications);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
