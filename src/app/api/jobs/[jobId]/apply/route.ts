import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateMessageContent } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`job_apply:${userId}`, 10, 60);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many applications. Try again later." }, { status: 429 });
  }

  const { jobId } = await params;
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.userId === userId) {
    return NextResponse.json({ error: "You cannot apply to your own job" }, { status: 400 });
  }
  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "Job is not open" }, { status: 400 });
  }

  const body = await req.json();
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (message) {
    const messageValidation = validateMessageContent(message);
    if (!messageValidation.isValid) {
      return NextResponse.json({ error: messageValidation.errors[0] }, { status: 400 });
    }
  }

  try {
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: userId,
        message: message || null,
      },
      include: {
        job: { include: { user: true } },
        applicant: { include: { profile: true } },
      },
    });

    const response = NextResponse.json(application, { status: 201 });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });
  }
}
