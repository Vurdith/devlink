import { NextResponse } from "next/server";
import { MessagePermission } from "@prisma/client";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

const allowedValues = Object.values(MessagePermission);

export async function GET() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userMessagingSettings.findUnique({
      where: { userId },
    });

    // Default matches canSendMessage() — FOLLOWING
    const response = NextResponse.json(settings || { userId, allowFrom: "FOLLOWING" });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Messaging settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { allowFrom?: string } | null = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const allowFrom = typeof body?.allowFrom === "string" ? body.allowFrom : undefined;
    const nextAllowFrom = allowFrom as MessagePermission | undefined;

    if (!nextAllowFrom || !allowedValues.includes(nextAllowFrom)) {
      return NextResponse.json({ error: "Invalid allowFrom value" }, { status: 400 });
    }

    const settings = await prisma.userMessagingSettings.upsert({
      where: { userId },
      create: { userId, allowFrom: nextAllowFrom },
      update: { allowFrom: nextAllowFrom },
    });

    const response = NextResponse.json(settings);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Messaging settings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
