import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contractId } = await params;
  const contract = await prisma.escrowContract.findUnique({
    where: { id: contractId },
    include: { milestone: true },
  });

  if (!contract || !contract.milestone) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.clientId !== userId) {
    return NextResponse.json({ error: "Only the client can release funds" }, { status: 403 });
  }

  if (contract.milestone.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Milestone is not submitted" }, { status: 400 });
  }

  const milestone = await prisma.escrowMilestone.update({
    where: { contractId },
    data: { status: "RELEASED", releasedAt: new Date() },
  });

  const updatedContract = await prisma.escrowContract.update({
    where: { id: contractId },
    data: { status: "RELEASED" },
    include: {
      client: { include: { profile: true } },
      developer: { include: { profile: true } },
      milestone: true,
    },
  });

  const response = NextResponse.json({ contract: updatedContract, milestone });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
