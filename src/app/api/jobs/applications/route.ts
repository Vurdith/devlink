import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { jobApplicationWithJobSelect } from "@/server/jobs/selects";

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { applicantId: userId },
    select: jobApplicationWithJobSelect,
    orderBy: { createdAt: "desc" },
  });

  const response = NextResponse.json(applications);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
