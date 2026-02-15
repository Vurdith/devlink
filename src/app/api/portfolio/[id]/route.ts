
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getAuthSession();
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if portfolio item exists and belongs to user
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!portfolioItem || portfolioItem.userId !== user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, mediaUrls, links, category, tags, isPublic, skillIds } =
      body;

    // Validate skillIds if provided
    let validatedSkillIds: string[] | undefined = undefined;
    if (typeof skillIds !== "undefined") {
      if (!Array.isArray(skillIds) || !skillIds.every((sid: unknown) => typeof sid === "string")) {
        return NextResponse.json({ error: "skillIds must be an array of strings" }, { status: 400 });
      }
      const unique = Array.from(new Set(skillIds.map((s: string) => s.trim()).filter(Boolean)));
      if (unique.length > 15) {
        return NextResponse.json({ error: "Maximum 15 skills can be linked" }, { status: 400 });
      }
      validatedSkillIds = unique;
    }

    // Ensure user can only link skills they actually have
    if (validatedSkillIds && validatedSkillIds.length > 0) {
      const owned = await prisma.userSkill.findMany({
        where: { userId: user.id, skillId: { in: validatedSkillIds } },
        select: { skillId: true },
      });
      if (owned.length !== validatedSkillIds.length) {
        return NextResponse.json({ error: "You can only link portfolio items to skills in your skillset." }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If skillIds is provided, replace existing links
      if (typeof validatedSkillIds !== "undefined") {
        await tx.portfolioItemSkill.deleteMany({
          where: { portfolioItemId: id },
        });
        if (validatedSkillIds.length > 0) {
          await tx.portfolioItemSkill.createMany({
            data: validatedSkillIds.map((skillId: string) => ({
              portfolioItemId: id,
              skillId,
            })),
            skipDuplicates: true,
          });
        }
      }

      await tx.portfolioItem.update({
        where: { id },
        data: {
          title: title ?? portfolioItem.title,
          description,
          mediaUrls,
          links,
          category,
          tags,
          isPublic: isPublic ?? portfolioItem.isPublic,
        },
      });

      return tx.portfolioItem.findUnique({
        where: { id },
        include: {
          skills: {
            include: {
              skill: { select: { id: true, name: true, category: true, icon: true } },
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  avatarUrl: true,
                  profileType: true,
                  verified: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ portfolioItem: updated });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getAuthSession();
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if portfolio item exists and belongs to user
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!portfolioItem || portfolioItem.userId !== user.id) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.portfolioItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
