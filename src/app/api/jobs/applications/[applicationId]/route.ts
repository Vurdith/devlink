import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;
  const body = await req.json();
  const status = body?.status;

  if (!["PENDING", "ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.job.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status },
    include: {
      job: { include: { user: true } },
      applicant: { include: { profile: true } },
    },
  });

  const response = NextResponse.json(updated);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
