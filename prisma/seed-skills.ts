import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Massive library of skills - categories kept for internal organization only
const SKILLS_DATA: Record<string, string[]> = {
  DEVELOPMENT: [
    // Roblox Specific
    "Lua", "Luau", "Roblox Studio", "Roblox API", "RemoteEvents", "DataStore", "ProfileService",
    "Knit Framework", "Flamework", "Fusion UI", "Roact", "Rodux", "TestEZ", "Rojo", "Wally",
    
    // Game Development
    "Game Systems", "Combat Systems", "Inventory Systems", "Quest Systems", "Dialogue Systems",
    "Save Systems", "Leaderboards", "Matchmaking", "Anti-Cheat", "Game Optimization",
    "Physics Programming", "AI Programming", "Pathfinding", "Procedural Generation",
    "Multiplayer Networking", "Client-Server Architecture",
    
    // Web & Software
    "TypeScript", "JavaScript", "Python", "C#", "C++", "Java", "Rust", "Go", "PHP", "Ruby",
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "Node.js", "Express.js", "Django", "Flask",
    "HTML", "CSS", "Tailwind CSS", "SCSS", "REST APIs", "GraphQL", "WebSockets",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase", "Prisma",
    "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD", "GitHub Actions",
    "Git", "Code Review", "Technical Writing", "Documentation", "Testing", "TDD",
    
    // Mobile & Desktop
    "React Native", "Flutter", "Swift", "Kotlin", "Electron", "Tauri",
  ],
  
  DESIGN: [
    // UI/UX
    "UI Design", "UX Design", "User Research", "Wireframing", "Prototyping", "Interaction Design",
    "Responsive Design", "Mobile UI Design", "Game UI Design", "HUD Design", "Menu Design",
    
    // Graphic Design
    "Graphic Design", "Logo Design", "Branding", "Brand Identity", "Icon Design", "Typography",
    "Thumbnail Design", "Banner Design", "Poster Design", "Flyer Design", "Social Media Graphics",
    "Print Design", "Packaging Design", "Merchandise Design",
    
    // Tools
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign", "Canva",
    "After Effects", "Premiere Pro", "DaVinci Resolve",
    
    // Specialized
    "Color Theory", "Visual Design", "Layout Design", "Infographics", "Presentation Design",
    "Email Design", "Landing Page Design", "Dashboard Design",
  ],
  
  AUDIO: [
    // Music
    "Music Composition", "Music Production", "Beat Making", "Orchestral Composition",
    "Electronic Music", "Ambient Music", "Chiptune", "Soundtrack Composition", "Jingles",
    
    // Sound
    "Sound Design", "Sound Effects", "Foley", "Ambient Sound", "Environmental Audio",
    "Audio Mixing", "Audio Mastering", "Audio Editing", "Dialogue Editing",
    
    // Voice
    "Voice Acting", "Voice Over", "Character Voices", "Narration", "Commercial VO",
    "Podcast Editing", "Audiobook Production",
    
    // Tools
    "FL Studio", "Ableton Live", "Logic Pro", "Pro Tools", "Audacity", "Reaper",
    "GarageBand", "Cubase", "FMOD", "Wwise",
  ],
  
  ANIMATION: [
    // Character
    "Character Animation", "Character Rigging", "Facial Animation", "Lip Syncing",
    "Walk Cycles", "Run Cycles", "Combat Animation", "Idle Animation",
    
    // Motion
    "Motion Graphics", "Motion Design", "Kinetic Typography", "Logo Animation",
    "Explainer Videos", "Animated Ads", "Animated Intros",
    
    // Techniques
    "2D Animation", "3D Animation", "Stop Motion", "Keyframe Animation",
    "Procedural Animation", "IK/FK Animation", "Motion Capture",
    
    // Game Specific
    "Cutscene Animation", "Cinematic Animation", "Game Animation", "NPC Animation",
    
    // Tools
    "Blender Animation", "Maya", "Cinema 4D", "Moon Animator", "After Effects Animation",
    "Spine 2D", "DragonBones", "Live2D", "Cascadeur",
  ],
  
  BUILDING: [
    // 3D Modeling
    "3D Modeling", "Character Modeling", "Hard Surface Modeling", "Organic Modeling",
    "Low Poly Modeling", "High Poly Modeling", "Game-Ready Assets", "Prop Modeling",
    "Vehicle Modeling", "Weapon Modeling", "Architectural Modeling",
    
    // Environment
    "Environment Design", "Level Design", "World Building", "Terrain Design",
    "Landscape Design", "Interior Design", "Exterior Design", "City Building",
    
    // Texturing & Materials
    "Texturing", "UV Mapping", "PBR Materials", "Substance Painter", "Material Design",
    "Hand-Painted Textures", "Stylized Textures", "Realistic Textures",
    
    // Lighting
    "Lighting Design", "Game Lighting", "Cinematic Lighting", "HDRI Lighting",
    "Baked Lighting", "Dynamic Lighting",
    
    // Tools
    "Blender", "Maya", "3ds Max", "Cinema 4D", "ZBrush", "Substance Painter",
    "Substance Designer", "Marmoset Toolbag", "Quixel Mixer",
  ],
  
  MANAGEMENT: [
    // Project
    "Project Management", "Team Leadership", "Product Management", "Scrum Master",
    "Agile Methodology", "Sprint Planning", "Roadmap Planning", "Resource Management",
    
    // Community
    "Community Management", "Discord Management", "Content Moderation", "Event Planning",
    "Community Building", "Player Support", "Customer Service",
    
    // Quality
    "Quality Assurance", "Game Testing", "Bug Tracking", "Test Planning",
    "Playtesting", "User Acceptance Testing", "Performance Testing",
    
    // Business
    "Business Development", "Partnership Management", "Contract Negotiation",
    "Budgeting", "Financial Planning", "Investor Relations",
    
    // HR
    "Hiring", "Recruiting", "Team Building", "Mentoring", "Training",
    "Performance Reviews", "Onboarding",
  ],
  
  MARKETING: [
    // Digital Marketing
    "Digital Marketing", "Social Media Marketing", "Content Marketing", "SEO",
    "PPC Advertising", "Email Marketing", "Influencer Marketing", "Affiliate Marketing",
    
    // Content
    "Content Creation", "Video Production", "Thumbnail Creation", "Trailer Production",
    "Streaming", "YouTube Content", "TikTok Content", "Twitter/X Strategy",
    
    // Analytics
    "Analytics", "Data Analysis", "A/B Testing", "Conversion Optimization",
    "Market Research", "Competitor Analysis",
    
    // PR
    "Public Relations", "Press Releases", "Media Outreach", "Crisis Management",
    "Brand Ambassador", "Sponsorship Management",
  ],
  
  WRITING: [
    // Narrative
    "Narrative Design", "Story Writing", "Dialogue Writing", "Worldbuilding",
    "Character Development", "Quest Writing", "Lore Writing",
    
    // Technical
    "Technical Writing", "Documentation", "API Documentation", "Tutorial Writing",
    "Knowledge Base Articles", "Help Center Content",
    
    // Creative
    "Creative Writing", "Scriptwriting", "Copywriting", "Blog Writing",
    "Press Kit Writing", "Game Descriptions", "Marketing Copy",
    
    // Localization
    "Localization", "Translation", "Game Localization", "Cultural Adaptation",
    "Proofreading", "Editing",
  ],
  
  OTHER: [
    // Video
    "Video Editing", "Color Grading", "VFX", "Compositing", "Screen Recording",
    "Livestream Production", "Podcast Production",
    
    // Business
    "Consulting", "Coaching", "Speaking", "Workshop Facilitation",
    "Legal Consulting", "Tax Consulting",
    
    // Miscellaneous
    "Data Entry", "Virtual Assistant", "Research", "Transcription",
    "Customer Support", "Tech Support", "Discord Bots",
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
