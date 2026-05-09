import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { escrowContractSelect } from "@/server/escrow/selects";
import { checkRateLimit } from "@/server/rate-limit";
import { validateEscrowAmount, validateCurrency } from "@/lib/validation";

const DEFAULT_LIMIT = 20;

function parseLimit(value: string | null) {
  const parsed = Number(value || DEFAULT_LIMIT);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), 50);
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams.get("limit"));
    const cursor = searchParams.get("cursor");

    const contracts = await prisma.escrowContract.findMany({
      where: { OR: [{ clientId: userId }, { developerId: userId }] },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: escrowContractSelect,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = contracts.length > limit;
    const items = hasMore ? contracts.slice(0, limit) : contracts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json(
      { contracts: items, nextCursor, hasMore },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Escrow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`escrow_create:${userId}`, 5, 60);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const developerId = body?.developerId as string | undefined;
    const jobId = body?.jobId as string | undefined;
    const amount = typeof body?.amount === "number" ? Math.round(body.amount) : NaN;
    const currency = typeof body?.currency === "string" ? body.currency : "USD";
    const title = typeof body?.title === "string" ? body.title.trim() : "Milestone 1";

    if (!developerId) {
      return NextResponse.json({ error: "developerId is required" }, { status: 400 });
    }

    if (developerId === userId) {
      return NextResponse.json({ error: "Cannot create escrow with yourself" }, { status: 400 });
    }

    const amountValidation = validateEscrowAmount(amount);
    if (!amountValidation.isValid) {
      return NextResponse.json({ error: amountValidation.errors[0] }, { status: 400 });
    }

    const currencyValidation = validateCurrency(currency);
    if (!currencyValidation.isValid) {
      return NextResponse.json({ error: currencyValidation.errors[0] }, { status: 400 });
    }

    const developer = await prisma.user.findUnique({ where: { id: developerId }, select: { id: true } });
    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 });
    }

    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { userId: true, status: true },
      });

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      if (job.userId !== developerId) {
        return NextResponse.json(
          { error: "Escrow developer must match the job owner" },
          { status: 400 }
        );
      }
    }

    const contract = await prisma.escrowContract.create({
      data: {
        clientId: userId,
        developerId,
        jobId,
        amount,
        currency: currency.trim().toUpperCase(),
        status: "PENDING",
        milestone: {
          create: {
            title: title || "Milestone 1",
            amount,
            status: "PENDING",
          },
        },
      },
      select: escrowContractSelect,
    });

    const response = NextResponse.json(contract, { status: 201 });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Escrow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
