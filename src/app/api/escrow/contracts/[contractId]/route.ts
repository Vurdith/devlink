import { NextResponse } from "next/server";
import { EscrowStatus } from "@prisma/client";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(
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
      include: {
        client: { include: { profile: true } },
        developer: { include: { profile: true } },
        milestone: true,
        job: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.clientId !== userId && contract.developerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const response = NextResponse.json(contract);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Escrow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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
    const contract = await prisma.escrowContract.findUnique({ where: { id: contractId } });
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.clientId !== userId && contract.developerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const status = typeof body?.status === "string" ? body.status : undefined;
    const nextStatus = status as EscrowStatus | undefined;

    if (nextStatus && !Object.values(EscrowStatus).includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // State-transition whitelist: only allow valid status transitions
    if (nextStatus) {
      const VALID_TRANSITIONS: Record<string, string[]> = {
        PENDING: ["FUNDED", "CANCELLED"],
        FUNDED: ["ACTIVE", "CANCELLED"],
        ACTIVE: ["SUBMITTED", "CANCELLED", "DISPUTED"],
        SUBMITTED: ["RELEASED", "REVISION_REQUESTED", "DISPUTED"],
        REVISION_REQUESTED: ["ACTIVE", "CANCELLED", "DISPUTED"],
        RELEASED: ["COMPLETED"],
        DISPUTED: ["RELEASED", "CANCELLED"],
      };

      const allowed = VALID_TRANSITIONS[contract.status];
      if (!allowed || !allowed.includes(nextStatus)) {
        return NextResponse.json(
          { error: `Cannot transition from ${contract.status} to ${nextStatus}` },
          { status: 400 }
        );
      }
    }

    // Only client can cancel pending contracts
    if (nextStatus === "CANCELLED" && contract.clientId !== userId) {
      return NextResponse.json({ error: "Only the client can cancel" }, { status: 403 });
    }

    const updated = await prisma.escrowContract.update({
      where: { id: contractId },
      data: nextStatus ? { status: nextStatus } : {},
      include: {
        client: { include: { profile: true } },
        developer: { include: { profile: true } },
        milestone: true,
        job: true,
      },
    });

    const response = NextResponse.json(updated);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Escrow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
