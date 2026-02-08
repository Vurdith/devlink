import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateJobTitle, validateJobDescription, validateCurrency } from "@/lib/validation";

const DEFAULT_LIMIT = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const userId = searchParams.get("userId");
  const limit = Math.min(Number(searchParams.get("limit") || DEFAULT_LIMIT), 50);
  const cursor = searchParams.get("cursor");

  const status = statusParam === "closed" ? "CLOSED" : statusParam === "open" ? "OPEN" : undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const jobs = await prisma.job.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: { include: { profile: true } },
      _count: { select: { applications: true } },
    },
  });

  const hasMore = jobs.length > limit;
  const items = hasMore ? jobs.slice(0, limit) : jobs;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return NextResponse.json({ jobs: items, nextCursor });
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`job_create:${userId}`, 5, 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many job posts. Please wait and try again." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { title, description, budgetMin, budgetMax, currency, skills, location } = body;

  const titleValidation = validateJobTitle(title || "");
  if (!titleValidation.isValid) {
    return NextResponse.json({ error: titleValidation.errors[0] }, { status: 400 });
  }
  const descValidation = validateJobDescription(description || "");
  if (!descValidation.isValid) {
    return NextResponse.json({ error: descValidation.errors[0] }, { status: 400 });
  }

  if (budgetMin !== undefined && budgetMin !== null && typeof budgetMin !== "number") {
    return NextResponse.json({ error: "budgetMin must be a number" }, { status: 400 });
  }
  if (budgetMax !== undefined && budgetMax !== null && typeof budgetMax !== "number") {
    return NextResponse.json({ error: "budgetMax must be a number" }, { status: 400 });
  }
  if (typeof budgetMin === "number" && typeof budgetMax === "number" && budgetMin > budgetMax) {
    return NextResponse.json({ error: "budgetMin cannot exceed budgetMax" }, { status: 400 });
  }

  const currencyValidation = validateCurrency(currency || "USD");
  if (!currencyValidation.isValid) {
    return NextResponse.json({ error: currencyValidation.errors[0] }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      userId,
      title: title.trim(),
      description: description.trim(),
      budgetMin: typeof budgetMin === "number" ? Math.round(budgetMin) : null,
      budgetMax: typeof budgetMax === "number" ? Math.round(budgetMax) : null,
      currency: String(currency || "USD").trim().toUpperCase(),
      skills: typeof skills === "string" ? skills.trim() : null,
      location: typeof location === "string" ? location.trim() : null,
    },
    include: {
      user: { include: { profile: true } },
      _count: { select: { applications: true } },
    },
  });

  return NextResponse.json(job, { status: 201 });
}
