import { NextResponse } from "next/server";
import { EscrowStatus } from "@prisma/client";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

const ESCROW_TRANSITION_POLICY: Record<
  EscrowStatus,
  Partial<Record<EscrowStatus, "client" | "developer" | "either">>
> = {
  PENDING: {
    FUNDED: "client",
    CANCELLED: "client",
  },
  FUNDED: {
    CANCELLED: "client",
  },
  SUBMITTED: {},
  RELEASED: {},
  CANCELLED: {},
};

function canApplyEscrowTransition({
  actorId,
  clientId,
  developerId,
  currentStatus,
  nextStatus,
}: {
  actorId: string;
  clientId: string;
  developerId: string;
  currentStatus: EscrowStatus;
  nextStatus: EscrowStatus;
}) {
  const actor = clientId === actorId ? "client" : developerId === actorId ? "developer" : null;
  const allowedActor = ESCROW_TRANSITION_POLICY[currentStatus]?.[nextStatus];

  if (!actor || !allowedActor) return false;
  return allowedActor === "either" || allowedActor === actor;
}

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

    if (nextStatus) {
      const allowed = canApplyEscrowTransition({
        actorId: userId,
        clientId: contract.clientId,
        developerId: contract.developerId,
        currentStatus: contract.status,
        nextStatus,
      });

      if (!allowed) {
        return NextResponse.json(
          { error: "You cannot apply that escrow status transition" },
          { status: 403 }
        );
      }
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
