import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { applicantId: userId },
    include: {
      job: { include: { user: { include: { profile: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const response = NextResponse.json(applications);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
