// ============================================
// DevLink Skills & Roles System
// ============================================

export type SkillCategory = 
  | "DEVELOPMENT"
  | "DESIGN"
  | "AUDIO"
  | "ANIMATION"
  | "BUILDING"
  | "MANAGEMENT"
  | "OTHER";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "NOT_AVAILABLE" | "OPEN_TO_OFFERS";

export type ResponseTime = "WITHIN_HOURS" | "WITHIN_DAY" | "WITHIN_WEEK";

// Experience level configurations
export const EXPERIENCE_LEVELS: Record<ExperienceLevel, { 
  label: string; 
  description: string; 
  color: string;
  bgColor: string;
}> = {
  BEGINNER: {
    label: "Beginner",
    description: "Less than 1 year",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    description: "1-3 years",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/30",
  },
  ADVANCED: {
    label: "Advanced",
    description: "3-5 years",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15 border-purple-500/30",
  },
  EXPERT: {
    label: "Expert",
    description: "5+ years",
    color: "text-amber-400",
    bgColor: "bg-amber-500/15 border-amber-500/30",
  },
};

// Availability status configurations
export const AVAILABILITY_STATUS: Record<AvailabilityStatus, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  AVAILABLE: {
    label: "Available",
    description: "Open for new projects",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
    icon: "check-circle",
  },
  OPEN_TO_OFFERS: {
    label: "Open to Offers",
    description: "Considering interesting opportunities",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/30",
    icon: "sparkles",
  },
  BUSY: {
    label: "Busy",
    description: "Currently working on projects",
    color: "text-amber-400",
    bgColor: "bg-amber-500/15 border-amber-500/30",
    icon: "clock",
  },
  NOT_AVAILABLE: {
    label: "Not Available",
    description: "Not taking new work",
    color: "text-red-400",
    bgColor: "bg-red-500/15 border-red-500/30",
    icon: "x-circle",
  },
};

// Response time configurations
export const RESPONSE_TIMES: Record<ResponseTime, {
  label: string;
  description: string;
}> = {
  WITHIN_HOURS: {
    label: "Within hours",
    description: "Usually responds within a few hours",
  },
  WITHIN_DAY: {
    label: "Within a day",
    description: "Usually responds within 24 hours",
  },
  WITHIN_WEEK: {
    label: "Within a week",
    description: "Usually responds within a week",
  },
};

// Skill category configurations
export const SKILL_CATEGORIES: Record<SkillCategory, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  DEVELOPMENT: {
    label: "Development",
    description: "Programming & scripting",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/30",
  },
  DESIGN: {
    label: "Design",
    description: "UI/UX & graphics",
    color: "text-pink-400",
    bgColor: "bg-pink-500/15 border-pink-500/30",
  },
  AUDIO: {
    label: "Audio",
    description: "Sound & music",
    color: "text-amber-400",
    bgColor: "bg-amber-500/15 border-amber-500/30",
  },
  ANIMATION: {
    label: "Animation",
    description: "Motion & rigging",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15 border-purple-500/30",
  },
  BUILDING: {
    label: "Building",
    description: "3D modeling & environments",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
  },
  MANAGEMENT: {
    label: "Management",
    description: "Project & team leadership",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/15 border-cyan-500/30",
  },
  OTHER: {
    label: "Other",
    description: "Other skills",
    color: "text-gray-400",
    bgColor: "bg-gray-500/15 border-gray-500/30",
  },
};

// Predefined skills organized by category
export const PREDEFINED_SKILLS: Record<SkillCategory, string[]> = {
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

// Get all skills as a flat array
export function getAllSkills(): Array<{ name: string; category: SkillCategory }> {
  const skills: Array<{ name: string; category: SkillCategory }> = [];
  
  for (const [category, skillNames] of Object.entries(PREDEFINED_SKILLS)) {
    for (const name of skillNames) {
      skills.push({ name, category: category as SkillCategory });
    }
  }
  
  return skills;
}

// Get skills by category
export function getSkillsByCategory(category: SkillCategory): string[] {
  return PREDEFINED_SKILLS[category] || [];
}

// Format hourly rate for display
export function formatHourlyRate(cents: number | null | undefined, currency: string = "USD"): string {
  if (!cents) return "";
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + "/hr";
}

// Parse hourly rate from display to cents
export function parseHourlyRate(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

