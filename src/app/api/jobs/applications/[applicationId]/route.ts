import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { parseApplicationStatus, validateApplicationStatusTransition } from "@/server/jobs/application-status";
import { jobApplicationSelect } from "@/server/jobs/selects";
import { createNotification } from "@/server/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;
  const body = await req.json();
  const status = parseApplicationStatus(body?.status);

  if (!status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: {
      applicantId: true,
      jobId: true,
      status: true,
      job: { select: { userId: true, title: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.job.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const transition = validateApplicationStatusTransition(application.status, status);
  if (!transition.ok) {
    return NextResponse.json({ error: transition.error }, { status: transition.statusCode });
  }

  const updated = transition.changed
    ? await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status },
        select: jobApplicationSelect,
      })
    : await prisma.jobApplication.findUniqueOrThrow({
        where: { id: applicationId },
        select: jobApplicationSelect,
      });

  if (transition.changed && (status === "ACCEPTED" || status === "DECLINED")) {
    void createNotification({
      recipientId: application.applicantId,
      actorId: userId,
      type: "JOB_APPLICATION",
      dedupeKey: `n:${application.applicantId}:job_application:${applicationId}`,
      metadata: {
        jobId: application.jobId,
        jobTitle: application.job.title,
        status,
      },
    });
  }

  const response = NextResponse.json(updated);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
