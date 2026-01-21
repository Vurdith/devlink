import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;
  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.json(request);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;
  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending requests can be removed" }, { status: 400 });
  }

  await prisma.verificationRequest.delete({ where: { id: requestId } });
  const response = NextResponse.json({ success: true });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
