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

export type RateUnit = "HOURLY" | "PER_FRAME" | "PER_MODEL" | "PER_PROJECT" | "PER_ASSET" | "PER_TRACK" | "PER_WORD" | "NEGOTIABLE";

// Experience level configurations
export const EXPERIENCE_LEVELS: Record<ExperienceLevel, { 
  label: string; 
  description: string; 
  color: string;
  bgColor: string;
}> = {
  BEGINNER: {
    label: "Beginner",
    description: "Learning the fundamentals • Less than 1 year experience",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15 border-emerald-500/30",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    description: "Solid foundation with practical experience • 1-3 years",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 border-blue-500/30",
  },
  ADVANCED: {
    label: "Advanced",
    description: "Deep expertise and complex problem solving • 3-5 years",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15 border-purple-500/30",
  },
  EXPERT: {
    label: "Expert",
    description: "Industry leader with comprehensive mastery • 5+ years",
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

// Rate unit configurations
export const RATE_UNITS: Record<RateUnit, {
  label: string;
  shortLabel: string;
  description: string;
}> = {
  HOURLY: {
    label: "Per Hour",
    shortLabel: "/hr",
    description: "Charged by the hour",
  },
  PER_FRAME: {
    label: "Per Frame",
    shortLabel: "/frame",
    description: "Charged per UI frame or screen",
  },
  PER_MODEL: {
    label: "Per Model",
    shortLabel: "/model",
    description: "Charged per 3D model or asset",
  },
  PER_PROJECT: {
    label: "Per Project",
    shortLabel: "/project",
    description: "Fixed price per project",
  },
  PER_ASSET: {
    label: "Per Asset",
    shortLabel: "/asset",
    description: "Charged per individual asset",
  },
  PER_TRACK: {
    label: "Per Track",
    shortLabel: "/track",
    description: "Charged per audio track or song",
  },
  PER_WORD: {
    label: "Per Word",
    shortLabel: "/word",
    description: "Charged per word (writing/translation)",
  },
  NEGOTIABLE: {
    label: "Negotiable",
    shortLabel: "",
    description: "Price discussed per project",
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

// Format rate for display (supports different rate units)
export function formatRate(
  cents: number | null | undefined, 
  rateUnit: RateUnit = "HOURLY",
  currency: string = "USD"
): string {
  if (!cents) return "";
  const amount = cents / 100;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  const unit = RATE_UNITS[rateUnit];
  return unit?.shortLabel ? `${formattedAmount}${unit.shortLabel}` : formattedAmount;
}

// Legacy function for backward compatibility
export function formatHourlyRate(cents: number | null | undefined, currency: string = "USD"): string {
  return formatRate(cents, "HOURLY", currency);
}

// Parse hourly rate from display to cents
export function parseHourlyRate(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

