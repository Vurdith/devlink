import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/server/rate-limit";

const CUSTOM_SKILL_MIN_LENGTH = 2;
const CUSTOM_SKILL_MAX_LENGTH = 50;
const CUSTOM_SKILL_PATTERN = /^[a-zA-Z0-9+#./&() -]+$/;

function normalizeCustomSkillName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function validateCustomSkillName(name: string) {
  if (name.length < CUSTOM_SKILL_MIN_LENGTH) {
    return "Skill name must be at least 2 characters";
  }

  if (name.length > CUSTOM_SKILL_MAX_LENGTH) {
    return "Skill name must be 50 characters or less";
  }

  if (!CUSTOM_SKILL_PATTERN.test(name)) {
    return "Skill names can only use letters, numbers, spaces, and common skill punctuation";
  }

  if (/https?:\/\//i.test(name) || /www\./i.test(name)) {
    return "Skill names cannot be links";
  }

  if (/(.)\1{7,}/i.test(name.replace(/\s/g, ""))) {
    return "Skill name has too many repeated characters";
  }

  return null;
}

// GET /api/skills - Get all available skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { name: "asc" },
      ],
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a custom skill
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`skill_create:${session.user.id}`, 10, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many custom skills created. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
    }

    const trimmedName = normalizeCustomSkillName(name);
    const validationError = validateCustomSkillName(trimmedName);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check if skill already exists (case insensitive)
    const existingSkill = await prisma.skill.findFirst({
      where: { 
        name: { 
          equals: trimmedName, 
          mode: "insensitive" 
        } 
      },
    });

    if (existingSkill) {
      // Return the existing skill instead of creating a duplicate
      return NextResponse.json(existingSkill);
    }

    // Create new skill with CUSTOM category
    const skill = await prisma.skill.create({
      data: {
        name: trimmedName,
        category: "CUSTOM",
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

