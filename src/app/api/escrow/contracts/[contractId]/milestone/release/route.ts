import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { escrowContractSelect } from "@/server/escrow/selects";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId } = await params;
    const contract = await prisma.escrowContract.findUnique({
      where: { id: contractId },
      select: {
        clientId: true,
        milestone: { select: { status: true } },
      },
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

    const [, updatedContract] = await prisma.$transaction([
      prisma.escrowMilestone.update({
        where: { contractId },
        data: { status: "RELEASED", releasedAt: new Date() },
      }),
      prisma.escrowContract.update({
        where: { id: contractId },
        data: { status: "RELEASED" },
        select: escrowContractSelect,
      }),
    ]);

    const response = NextResponse.json({ contract: updatedContract });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Escrow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
