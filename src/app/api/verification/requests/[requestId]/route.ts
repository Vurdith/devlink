import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to view this verification request." }, { status: 401 });
  }

  const { requestId } = await params;
  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    return NextResponse.json({ error: "This verification request no longer exists." }, { status: 404 });
  }

  if (request.userId !== userId) {
    return NextResponse.json({ error: "You can only view your own verification requests." }, { status: 403 });
  }

  const response = NextResponse.json(request);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to remove this verification request." }, { status: 401 });
  }

  const { requestId } = await params;
  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });

  if (!request) {
    return NextResponse.json({ error: "This verification request no longer exists." }, { status: 404 });
  }

  if (request.userId !== userId) {
    return NextResponse.json({ error: "You can only remove your own verification requests." }, { status: 403 });
  }

  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending verification requests can be removed." }, { status: 400 });
  }

  await prisma.verificationRequest.delete({ where: { id: requestId } });
  const response = NextResponse.json({ success: true });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
