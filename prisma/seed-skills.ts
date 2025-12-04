import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Predefined skills organized by category
const SKILLS_DATA: Record<string, string[]> = {
  DEVELOPMENT: [
    "Lua",
    "Luau",
    "TypeScript",
    "JavaScript",
    "Python",
    "Roblox Studio",
    "Game Systems",
    "Backend Development",
    "Frontend Development",
    "Database Design",
    "API Development",
    "DevOps",
    "Version Control (Git)",
    "Code Review",
    "Technical Writing",
  ],
  DESIGN: [
    "UI Design",
    "UX Design",
    "Graphic Design",
    "Logo Design",
    "Branding",
    "Icon Design",
    "Thumbnail Design",
    "Web Design",
    "Wireframing",
    "Prototyping",
    "Figma",
    "Photoshop",
    "Illustrator",
    "Canva",
  ],
  AUDIO: [
    "Sound Design",
    "Music Composition",
    "Voice Acting",
    "Audio Mixing",
    "Audio Mastering",
    "Foley",
    "Ambient Sound",
    "Sound Effects",
    "FL Studio",
    "Ableton",
    "Logic Pro",
    "Audacity",
  ],
  ANIMATION: [
    "Character Animation",
    "Rigging",
    "Motion Graphics",
    "2D Animation",
    "3D Animation",
    "Keyframe Animation",
    "Procedural Animation",
    "Cutscene Animation",
    "Blender Animation",
    "Maya",
    "Moon Animator",
  ],
  BUILDING: [
    "3D Modeling",
    "Environment Design",
    "Level Design",
    "Terrain Design",
    "Architecture",
    "Props & Assets",
    "Texturing",
    "Materials",
    "Lighting",
    "Blender",
    "Cinema 4D",
    "ZBrush",
  ],
  MANAGEMENT: [
    "Project Management",
    "Team Leadership",
    "Product Management",
    "Scrum/Agile",
    "Community Management",
    "Content Moderation",
    "Quality Assurance",
    "Documentation",
    "Mentoring",
    "Hiring",
  ],
  OTHER: [
    "Game Testing",
    "Localization",
    "Marketing",
    "Social Media",
    "Content Creation",
    "Streaming",
    "Video Editing",
    "Writing",
    "Consulting",
  ],
};

async function main() {
  console.log("🌱 Seeding skills...");

  let created = 0;
  let skipped = 0;

  for (const [category, skills] of Object.entries(SKILLS_DATA)) {
    for (const skillName of skills) {
      try {
        await prisma.skill.upsert({
          where: { name: skillName },
          update: { category },
          create: {
            name: skillName,
            category,
          },
        });
        created++;
      } catch {
        skipped++;
      }
    }
  }

  console.log(`✅ Created/updated ${created} skills, skipped ${skipped}`);
}

main()
  .catch((e) => {
    console.error("Error seeding skills:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

