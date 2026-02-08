import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

// GET /api/users/me/skills - Get current user's skills
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: {
        skill: true,
      },
      orderBy: [
        { isPrimary: "desc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json(userSkills);
  } catch (error) {
    console.error("Error fetching user skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST /api/users/me/skills - Add a skill to current user
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { skillId, experienceLevel = "INTERMEDIATE", yearsOfExp, isPrimary = false } = body;

    if (!skillId) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
    }

    // Verify skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Check if user already has this skill
    const existing = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have this skill" },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary skills
    if (isPrimary) {
      await prisma.userSkill.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const userSkill = await prisma.userSkill.create({
      data: {
        userId: user.id,
        skillId,
        experienceLevel,
        yearsOfExp,
        isPrimary,
      },
      include: {
        skill: true,
      },
    });

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    return NextResponse.json(userSkill, { status: 201 });
  } catch (error) {
    console.error("Error adding skill:", error);
    return NextResponse.json(
      { error: "Failed to add skill" },
      { status: 500 }
    );
  }
}

// PUT /api/users/me/skills - Update a single user skill
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { 
      id, 
      experienceLevel, 
      yearsOfExp, 
      isPrimary,
      headline,
      rate,
      rateUnit,
      skillAvailability,
      description,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
    }

    // Verify the skill belongs to the user
    const existingSkill = await prisma.userSkill.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // If setting as primary, unset other primary skills
    if (isPrimary) {
      await prisma.userSkill.updateMany({
        where: { userId: user.id, isPrimary: true, NOT: { id } },
        data: { isPrimary: false },
      });
    }

    const updatedSkill = await prisma.userSkill.update({
      where: { id },
      data: {
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(yearsOfExp !== undefined && { yearsOfExp }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(headline !== undefined && { headline }),
        ...(rate !== undefined && { rate }),
        ...(rateUnit !== undefined && { rateUnit }),
        ...(skillAvailability !== undefined && { skillAvailability }),
        ...(description !== undefined && { description }),
      },
      include: { skill: true },
    });

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/me/skills - Remove a skill
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const skillId = searchParams.get("skillId"); // Legacy support

    if (!id && !skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    // Delete by userSkill id or by skillId
    if (id) {
      await prisma.userSkill.deleteMany({
        where: { id, userId: user.id },
      });
    } else if (skillId) {
      await prisma.userSkill.deleteMany({
        where: { userId: user.id, skillId },
      });
    }

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing skill:", error);
    return NextResponse.json(
      { error: "Failed to remove skill" },
      { status: 500 }
    );
  }
}

