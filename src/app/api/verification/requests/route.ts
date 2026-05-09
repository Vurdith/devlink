import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/server/rate-limit";

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to view verification requests." }, { status: 401 });
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
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to request verification." }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`verification_request:${userId}`, 5, 300);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many verification requests. Wait a few minutes and try again." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Send verification details as valid JSON." }, { status: 400 });
  }

  const type = typeof body?.type === "string" ? body.type : undefined;
  const documentUrl = typeof body?.documentUrl === "string" ? body.documentUrl.trim() || null : null;
  const notes = typeof body?.notes === "string" ? body.notes.trim() || null : null;

  if (!type || !["EMAIL", "ID", "PORTFOLIO"].includes(type)) {
    return NextResponse.json({ error: "Choose email, ID check, or portfolio proof." }, { status: 400 });
  }

  if (documentUrl) {
    try {
      const url = new URL(documentUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return NextResponse.json({ error: "Evidence links must start with http:// or https://." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Enter a valid evidence link or leave it blank." }, { status: 400 });
    }
  }

  if (notes && notes.length > 1000) {
    return NextResponse.json({ error: "Notes must be 1000 characters or fewer." }, { status: 400 });
  }

  const existing = await prisma.verificationRequest.findFirst({
    where: { userId, type, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending request for this verification type." }, { status: 409 });
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
