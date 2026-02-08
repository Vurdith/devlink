import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateEscrowAmount, validateCurrency } from "@/lib/validation";

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contracts = await prisma.escrowContract.findMany({
    where: { OR: [{ clientId: userId }, { developerId: userId }] },
    include: {
      client: { include: { profile: true } },
      developer: { include: { profile: true } },
      milestone: true,
      job: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const response = NextResponse.json(contracts);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function POST(req: Request) {
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

  const developer = await prisma.user.findUnique({ where: { id: developerId } });
  if (!developer) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
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
    include: {
      client: { include: { profile: true } },
      developer: { include: { profile: true } },
      milestone: true,
      job: true,
    },
  });

  const response = NextResponse.json(contract, { status: 201 });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
