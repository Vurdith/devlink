import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { prismaRead } from "@/server/db-read";
import { rankJobCandidates } from "@/server/jobs/job-ranking";
import { jobSummarySelect } from "@/server/jobs/selects";
import { checkRateLimit } from "@/server/rate-limit";
import { validateJobTitle, validateJobDescription, validateCurrency } from "@/lib/validation";

const DEFAULT_LIMIT = 20;
const RANKED_JOB_POOL_SIZE = 100;

function parseLimit(value: string | null) {
  const parsed = Number(value || DEFAULT_LIMIT);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), 50);
}

function buildViewerSkillTerms(
  skills: Array<{
    skill: {
      name: string;
      category: string;
    };
  }>
) {
  return [
    ...new Set(
      skills
        .flatMap(({ skill }) => [skill.name, skill.category])
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length >= 2)
    ),
  ].slice(0, 10);
}

async function fetchViewerSkillTerms(userId?: string) {
  if (!userId) return [];

  const user = await prismaRead.user.findUnique({
    where: { id: userId },
    select: {
      skills: {
        select: {
          skill: {
            select: {
              name: true,
              category: true,
            },
          },
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 10,
      },
    },
  });

  return buildViewerSkillTerms(user?.skills ?? []);
}

export async function GET(req: Request) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const userId = searchParams.get("userId");
  const limit = parseLimit(searchParams.get("limit"));
  const cursor = searchParams.get("cursor");

  const status = statusParam === "closed" ? "CLOSED" : statusParam === "open" ? "OPEN" : undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const shouldRankForViewer = Boolean(currentUserId && status === "OPEN" && !userId && !cursor);
  const take = shouldRankForViewer ? Math.max(RANKED_JOB_POOL_SIZE, limit + 1) : limit + 1;

  const jobs = await prismaRead.job.findMany({
    where,
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: jobSummarySelect,
  });

  const rankedJobs = shouldRankForViewer
    ? rankJobCandidates(jobs, await fetchViewerSkillTerms(currentUserId))
    : jobs;
  const hasMore = rankedJobs.length > limit;
  const items = hasMore ? rankedJobs.slice(0, limit) : rankedJobs;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  const cacheControl = shouldRankForViewer
    ? "private, no-store"
    : "public, max-age=30, stale-while-revalidate=60";

  return NextResponse.json(
    { jobs: items, nextCursor },
    { headers: { "Cache-Control": cacheControl, Vary: "Cookie" } }
  );
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
    select: jobSummarySelect,
  });

  return NextResponse.json(job, { status: 201 });
}
