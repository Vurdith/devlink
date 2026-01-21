import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { validateJobTitle, validateJobDescription, validateCurrency } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      user: { include: { profile: true } },
      _count: { select: { applications: true } },
      applications: userId
        ? {
            where: { applicantId: userId },
            select: { id: true, status: true, createdAt: true },
          }
        : false,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, status, budgetMin, budgetMax, currency, skills, location } = body;

  if (title !== undefined) {
    const titleValidation = validateJobTitle(title || "");
    if (!titleValidation.isValid) {
      return NextResponse.json({ error: titleValidation.errors[0] }, { status: 400 });
    }
  }
  if (description !== undefined) {
    const descValidation = validateJobDescription(description || "");
    if (!descValidation.isValid) {
      return NextResponse.json({ error: descValidation.errors[0] }, { status: 400 });
    }
  }
  if (currency !== undefined) {
    const currencyValidation = validateCurrency(currency || "");
    if (!currencyValidation.isValid) {
      return NextResponse.json({ error: currencyValidation.errors[0] }, { status: 400 });
    }
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

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      title: typeof title === "string" ? title.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
      status: status === "OPEN" || status === "CLOSED" ? status : undefined,
      budgetMin: typeof budgetMin === "number" ? Math.round(budgetMin) : undefined,
      budgetMax: typeof budgetMax === "number" ? Math.round(budgetMax) : undefined,
      currency: typeof currency === "string" ? currency.trim().toUpperCase() : undefined,
      skills: typeof skills === "string" ? skills.trim() : undefined,
      location: typeof location === "string" ? location.trim() : undefined,
    },
    include: {
      user: { include: { profile: true } },
      _count: { select: { applications: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.job.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true });
}
