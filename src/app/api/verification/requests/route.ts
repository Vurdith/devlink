import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.verificationRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const response = NextResponse.json(requests);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`verification_request:${userId}`, 5, 300);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const type = typeof body?.type === "string" ? body.type : undefined;
  const documentUrl = typeof body?.documentUrl === "string" ? body.documentUrl : null;
  const notes = typeof body?.notes === "string" ? body.notes : null;

  if (!type || !["EMAIL", "ID", "PORTFOLIO"].includes(type)) {
    return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
  }

  const existing = await prisma.verificationRequest.findFirst({
    where: { userId, type, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "A pending request already exists" }, { status: 409 });
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId,
      type,
      documentUrl,
      notes,
    },
  });

  const response = NextResponse.json(request, { status: 201 });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
