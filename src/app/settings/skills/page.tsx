"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { 
  SKILL_CATEGORIES, 
  EXPERIENCE_LEVELS, 
  AVAILABILITY_STATUS,
  RESPONSE_TIMES,
  formatHourlyRate,
  type SkillCategory, 
  type ExperienceLevel,
  type AvailabilityStatus,
  type ResponseTime,
} from "@/lib/skills";
import { useToastContext } from "@/components/providers/ToastProvider";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface UserSkill {
  id: string;
  skillId: string;
  experienceLevel: ExperienceLevel;
  yearsOfExp: number | null;
  isPrimary: boolean;
  skill: Skill;
}

export default function SkillsSettingsPage() {
  const { toast } = useToastContext();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Availability settings
  const [availability, setAvailability] = useState<AvailabilityStatus>("AVAILABLE");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [headline, setHeadline] = useState("");
  const [responseTime, setResponseTime] = useState<ResponseTime | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [skillsRes, userSkillsRes, availabilityRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/users/me/skills"),
          fetch("/api/users/me/availability"),
        ]);

        if (skillsRes.ok) {
          const { skills } = await skillsRes.json();
          setAllSkills(skills);
        }

        if (userSkillsRes.ok) {
          const { skills } = await userSkillsRes.json();
          setUserSkills(skills);
        }

        if (availabilityRes.ok) {
          const data = await availabilityRes.json();
          setAvailability(data.availability);
          setHourlyRate(data.hourlyRate ? (data.hourlyRate / 100).toString() : "");
          setHeadline(data.headline || "");
          setResponseTime(data.responseTime);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        toast({ title: "Failed to load skills", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  // Filter skills
  const filteredSkills = allSkills.filter((skill) => {
    const matchesCategory = selectedCategory === "ALL" || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const notAlreadyAdded = !userSkills.some((us) => us.skillId === skill.id);
    return matchesCategory && matchesSearch && notAlreadyAdded;
  });

  // Add skill
  const addSkill = useCallback(async (skill: Skill) => {
    if (userSkills.length >= 15) {
      toast({ title: "Maximum 15 skills allowed", variant: "destructive" });
      return;
    }

    const newUserSkill: UserSkill = {
      id: `temp-${Date.now()}`,
      skillId: skill.id,
      experienceLevel: "INTERMEDIATE",
      yearsOfExp: null,
      isPrimary: userSkills.length === 0,
      skill,
    };

    setUserSkills((prev) => [...prev, newUserSkill]);
  }, [userSkills, toast]);

  // Remove skill
  const removeSkill = useCallback((skillId: string) => {
    setUserSkills((prev) => prev.filter((us) => us.skillId !== skillId));
  }, []);

  // Update skill experience level
  const updateSkillLevel = useCallback((skillId: string, level: ExperienceLevel) => {
    setUserSkills((prev) =>
      prev.map((us) =>
        us.skillId === skillId ? { ...us, experienceLevel: level } : us
      )
    );
  }, []);

  // Set primary skill
  const setPrimarySkill = useCallback((skillId: string) => {
    setUserSkills((prev) =>
      prev.map((us) => ({
        ...us,
        isPrimary: us.skillId === skillId,
      }))
    );
  }, []);

  // Save all changes
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // Save skills
      const skillsPayload = userSkills.map((us) => ({
        skillId: us.skillId,
        experienceLevel: us.experienceLevel,
        yearsOfExp: us.yearsOfExp,
      }));

      const skillsRes = await fetch("/api/users/me/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsPayload }),
      });

      if (!skillsRes.ok) {
        throw new Error("Failed to save skills");
      }

      // Save availability
      const availabilityRes = await fetch("/api/users/me/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability,
          hourlyRate: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : null,
          headline: headline || null,
          responseTime,
        }),
      });

      if (!availabilityRes.ok) {
        throw new Error("Failed to save availability");
      }

      toast({ title: "Skills and availability saved!", variant: "success" });
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Failed to save changes", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/3"></div>
        <div className="h-64 bg-white/5 rounded-2xl"></div>
        <div className="h-48 bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
          Skills & Availability
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Showcase your expertise and set your availability status
        </p>
      </div>

      {/* Headline Section */}
      <div className="bg-[#0d0d12] rounded-2xl p-6 border border-[var(--color-accent)]/20 animate-slide-up">
        <h2 className="text-lg font-semibold text-white mb-4">Professional Headline</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          A short tagline that appears below your name (e.g., &quot;Senior Lua Developer | 5+ Years Experience&quot;)
        </p>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={150}
          placeholder="Enter your professional headline..."
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
        />
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          {headline.length}/150 characters
        </p>
      </div>

      {/* Availability Section */}
      <div className="bg-[#0d0d12] rounded-2xl p-6 border border-[var(--color-accent)]/20 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <h2 className="text-lg font-semibold text-white mb-4">Availability Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(AVAILABILITY_STATUS) as AvailabilityStatus[]).map((status) => {
            const config = AVAILABILITY_STATUS[status];
            const isSelected = availability === status;
            return (
              <button
                key={status}
                onClick={() => setAvailability(status)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isSelected
                    ? `${config.bgColor} border-current ${config.color}`
                    : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                <div className="font-medium text-sm">{config.label}</div>
                <div className="text-xs opacity-60 mt-1">{config.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate & Response Time Section */}
      <div className="bg-[#0d0d12] rounded-2xl p-6 border border-[var(--color-accent)]/20 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-lg font-semibold text-white mb-4">Rates & Response</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hourly Rate */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-2">
              Hourly Rate (optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="50"
                min="0"
                className="w-full pl-8 pr-16 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">/hr</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Displayed on your profile to help clients understand your rates
            </p>
          </div>

          {/* Response Time */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-2">
              Typical Response Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RESPONSE_TIMES) as ResponseTime[]).map((time) => {
                const config = RESPONSE_TIMES[time];
                const isSelected = responseTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => setResponseTime(isSelected ? null : time)}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      isSelected
                        ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)]/30 text-[var(--color-accent)]"
                        : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-[#0d0d12] rounded-2xl p-6 border border-[var(--color-accent)]/20 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Skills</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {userSkills.length}/15 skills • Click a skill to set experience level
            </p>
          </div>
        </div>

        {/* Current Skills */}
        {userSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {userSkills.map((userSkill) => {
              const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
              const categoryConfig = SKILL_CATEGORIES[userSkill.skill.category as SkillCategory];
              return (
                <div
                  key={userSkill.skillId}
                  className={`group relative px-3 py-2 rounded-xl border ${levelConfig.bgColor} ${levelConfig.color} transition-all`}
                >
                  <div className="flex items-center gap-2">
                    {userSkill.isPrimary && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">★</span>
                    )}
                    <span className="text-sm font-medium">{userSkill.skill.name}</span>
                    <span className="text-xs opacity-60">{levelConfig.label}</span>
                    <button
                      onClick={() => removeSkill(userSkill.skillId)}
                      className="ml-1 p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Level selector dropdown */}
                  <div className="absolute top-full left-0 mt-1 bg-[#0d0d12] border border-white/10 rounded-xl p-2 hidden group-hover:block z-10 min-w-[160px]">
                    {(Object.keys(EXPERIENCE_LEVELS) as ExperienceLevel[]).map((level) => {
                      const config = EXPERIENCE_LEVELS[level];
                      return (
                        <button
                          key={level}
                          onClick={() => updateSkillLevel(userSkill.skillId, level)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            userSkill.experienceLevel === level
                              ? `${config.bgColor} ${config.color}`
                              : "text-white/60 hover:bg-white/5"
                          }`}
                        >
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs opacity-60">{config.description}</div>
                        </button>
                      );
                    })}
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={() => setPrimarySkill(userSkill.skillId)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        userSkill.isPrimary
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-white/60 hover:bg-white/5"
                      }`}
                    >
                      {userSkill.isPrimary ? "★ Primary Skill" : "Set as Primary"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--muted-foreground)] mb-6">
            <p>No skills added yet. Add skills below to showcase your expertise.</p>
          </div>
        )}

        {/* Add Skills Section */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-sm font-medium text-white mb-3">Add Skills</h3>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors text-sm"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | "ALL")}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors text-sm"
            >
              <option value="ALL">All Categories</option>
              {(Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {SKILL_CATEGORIES[cat].label}
                </option>
              ))}
            </select>
          </div>

          {/* Available Skills */}
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {filteredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredSkills.map((skill) => {
                  const categoryConfig = SKILL_CATEGORIES[skill.category as SkillCategory];
                  return (
                    <button
                      key={skill.id}
                      onClick={() => addSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all hover:scale-105 ${categoryConfig.bgColor} ${categoryConfig.color}`}
                    >
                      + {skill.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                {searchQuery ? "No matching skills found" : "All available skills have been added"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={saveChanges}
          disabled={isSaving}
          variant="primary"
          size="lg"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

