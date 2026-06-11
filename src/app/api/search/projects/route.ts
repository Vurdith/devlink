import { NextRequest, NextResponse } from "next/server";
import { prismaRead } from "@/server/db-read";
import { responseCache } from "@/server/cache";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  searchCacheKeyPart,
} from "@/server/search/query-utils";
import { rankProjectSearchCandidates } from "@/server/search/project-ranking";

const PROJECT_CACHE_TTL = 120;
const DEFAULT_PROJECT_LIMIT = 8;
const MAX_PROJECT_LIMIT = 25;
const PROJECT_CANDIDATE_POOL_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ projects: [] });
    }

    const query = normalizeSearchQuery(q);
    if (!query) {
      return NextResponse.json({ projects: [] });
    }
    const limit = normalizeSearchLimit(
      searchParams.get("limit"),
      DEFAULT_PROJECT_LIMIT,
      MAX_PROJECT_LIMIT
    );

    const cacheKey = `search:projects:v3:${searchCacheKeyPart(query)}:${limit}`;
    const cached = await responseCache.get<unknown[]>(cacheKey);
    if (cached) {
      const response = NextResponse.json({ projects: cached });
      response.headers.set("X-Cache", "HIT");
      response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      return response;
    }

    const portfolioItems = await prismaRead.portfolioItem.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
          { tags: { contains: query } },
          {
            skills: {
              some: {
                skill: {
                  name: { contains: query },
                },
              },
            },
          },
          { user: { username: { contains: query } } },
          { user: { name: { contains: query } } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        mediaUrls: true,
        links: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            name: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
              },
            },
          },
          take: 4,
        },
      },
      orderBy: { createdAt: "desc" },
      take: PROJECT_CANDIDATE_POOL_SIZE,
    });

    const projects = rankProjectSearchCandidates(portfolioItems, query)
      .slice(0, limit)
      .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      mediaUrls: item.mediaUrls,
      skills: item.skills.map(({ skill }) => skill.name),
      author: {
        username: item.user.username,
        name: item.user.name,
        avatarUrl: item.user.profile?.avatarUrl ?? null,
      },
    }));

    await responseCache.set(cacheKey, projects, PROJECT_CACHE_TTL);

    const response = NextResponse.json({ projects });
    response.headers.set("X-Cache", "MISS");
    response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("Error searching projects:", error);
    return NextResponse.json({ error: "Failed to search projects" }, { status: 500 });
  }
}


