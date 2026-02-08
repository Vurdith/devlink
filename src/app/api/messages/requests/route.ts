import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(prisma as any).messageRequest) {
    return NextResponse.json(
      { error: "Messaging tables are not initialized. Run prisma generate/migrate." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "incoming";

  const where =
    type === "outgoing"
      ? { senderId: userId }
      : { recipientId: userId };

  const requests = await prisma.messageRequest.findMany({
    where,
    include: {
      sender: { include: { profile: true } },
      recipient: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const response = NextResponse.json(requests);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
