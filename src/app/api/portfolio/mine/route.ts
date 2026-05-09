
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prismaRead } from "@/server/db-read";

const DEFAULT_PORTFOLIO_LIMIT = 50;
const MAX_PORTFOLIO_LIMIT = 100;

const ownedPortfolioItemSelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  mediaUrls: true,
  links: true,
  category: true,
  tags: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  skills: {
    select: {
      skill: {
        select: { id: true, name: true, category: true, icon: true },
      },
    },
  },
  user: {
    select: {
      id: true,
      username: true,
      name: true,
      profile: {
        select: {
          avatarUrl: true,
          profileType: true,
          verified: true,
        },
      },
    },
  },
} as const;

function parseOwnedPortfolioPagination(searchParams: URLSearchParams) {
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_PORTFOLIO_LIMIT), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_PORTFOLIO_LIMIT)
      : DEFAULT_PORTFOLIO_LIMIT;

  return { limit, skip: (page - 1) * limit };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { limit, skip } = parseOwnedPortfolioPagination(searchParams);

    const portfolioItems = await prismaRead.portfolioItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: ownedPortfolioItemSelect,
    });

    return NextResponse.json({ portfolioItems });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio items" },
      { status: 500 }
    );
  }
}

















