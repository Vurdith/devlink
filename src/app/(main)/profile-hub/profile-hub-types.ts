import type { AvailabilityStatus, ExperienceLevel, RateUnit } from "@/lib/skills";

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  id: string;
  skillId: string;
  experienceLevel: ExperienceLevel;
  yearsOfExp: number | null;
  isPrimary: boolean;
  headline: string | null;
  rate: number | null;
  rateUnit: RateUnit | null;
  skillAvailability: AvailabilityStatus | null;
  description: string | null;
  skill: Skill;
}
