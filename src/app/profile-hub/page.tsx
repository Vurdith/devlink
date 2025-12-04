"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ModalInput, ModalTextarea } from "@/components/ui/BaseModal";
import { 
  SKILL_CATEGORIES, 
  EXPERIENCE_LEVELS, 
  AVAILABILITY_STATUS, 
  RATE_UNITS,
  formatRate,
  type SkillCategory, 
  type ExperienceLevel,
  type AvailabilityStatus,
  type RateUnit,
} from "@/lib/skills";
import { getProfileTypeConfig, PROFILE_TYPE_CONFIG, ProfileTypeIcon } from "@/lib/profile-types";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";

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
  headline: string | null;
  rate: number | null;
  rateUnit: RateUnit | null;
  skillAvailability: AvailabilityStatus | null;
  description: string | null;
  skill: Skill;
}

interface ProfileData {
  bio: string;
  location: string;
  website: string;
  profileType: string;
  availability: AvailabilityStatus;
  headline: string;
  hourlyRate: number | null;
  currency: string;
  responseTime: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export default function ProfileHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "skills">("profile");
  
  // Profile data
  const [profile, setProfile] = useState<ProfileData>({
    bio: "",
    location: "",
    website: "",
    profileType: "DEVELOPER",
    availability: "AVAILABLE",
    headline: "",
    hourlyRate: null,
    currency: "USD",
    responseTime: "",
    avatarUrl: null,
    bannerUrl: null,
  });
  const [name, setName] = useState("");
  
  // Skills data
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "ALL">("ALL");
  const [skillSearch, setSkillSearch] = useState("");
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    if (status !== "authenticated") return;
    
    async function fetchData() {
      setIsLoading(true);
      try {
        const [profileRes, skillsRes, userSkillsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/skills"),
          fetch("/api/users/me/skills"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            bio: data.profile?.bio || "",
            location: data.profile?.location || "",
            website: data.profile?.website || "",
            profileType: data.profile?.profileType || "DEVELOPER",
            availability: data.profile?.availability || "AVAILABLE",
            headline: data.profile?.headline || "",
            hourlyRate: data.profile?.hourlyRate,
            currency: data.profile?.currency || "USD",
            responseTime: data.profile?.responseTime || "",
            avatarUrl: data.profile?.avatarUrl,
            bannerUrl: data.profile?.bannerUrl,
          });
          setName(data.name || "");
        }

        if (skillsRes.ok) {
          setAllSkills(await skillsRes.json());
        }

        if (userSkillsRes.ok) {
          setUserSkills(await userSkillsRes.json());
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [status, toast]);

  // Save profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          profileType: profile.profileType,
          availability: profile.availability,
          headline: profile.headline,
          hourlyRate: profile.hourlyRate,
          currency: profile.currency,
          responseTime: profile.responseTime,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Saved!", description: "Your profile has been updated", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Add skill
  const handleAddSkill = async (skill: Skill) => {
    if (userSkills.length >= 15) {
      toast({ title: "Limit reached", description: "Maximum 15 skills allowed", variant: "destructive" });
      return;
    }
    if (userSkills.some(us => us.skillId === skill.id)) {
      toast({ title: "Already added", description: `${skill.name} is already in your skills`, variant: "default" });
      return;
    }

    try {
      const res = await fetch("/api/users/me/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: skill.id, isPrimary: userSkills.length === 0 }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const newSkill = await res.json();
      setUserSkills(prev => [...prev, { ...newSkill, skill }]);
      toast({ title: "Added!", description: `${skill.name} added to your skills`, variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" });
    }
  };

  // Update skill
  const handleUpdateSkill = async (skillData: Partial<UserSkill>) => {
    if (!editingSkill) return;
    
    try {
      const res = await fetch("/api/users/me/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSkill.id, ...skillData }),
      });
      if (!res.ok) throw new Error("Failed to update");
      
      setUserSkills(prev => prev.map(us => 
        us.id === editingSkill.id ? { ...us, ...skillData } : us
      ));
      setEditingSkill(null);
      toast({ title: "Updated!", description: "Skill updated successfully", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update skill", variant: "destructive" });
    }
  };

  // Remove skill
  const handleRemoveSkill = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/users/me/skills?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      setUserSkills(prev => prev.filter(us => us.id !== id));
      toast({ title: "Removed", description: `${name} removed from your skills`, variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove skill", variant: "destructive" });
    }
  };

  const filteredSkills = allSkills.filter(skill =>
    (selectedCategory === "ALL" || skill.category === selectedCategory) &&
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !userSkills.some(us => us.skillId === skill.id)
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile Hub</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Manage your profile, skills, and services</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveSection("profile")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeSection === "profile" 
              ? "bg-[var(--color-accent)] text-white" 
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveSection("skills")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeSection === "skills" 
              ? "bg-[var(--color-accent)] text-white" 
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          Skills & Services
        </button>
      </div>

      {/* Profile Section */}
      {activeSection === "profile" && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Display Name</label>
                <ModalInput 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Professional Headline</label>
                <ModalInput 
                  value={profile.headline} 
                  onChange={(e) => setProfile(p => ({ ...p, headline: e.target.value }))}
                  placeholder="e.g., Senior Lua Developer | 5+ Years Experience"
                  maxLength={100}
                />
                <p className="text-xs text-white/40 mt-1">{profile.headline.length}/100</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Bio</label>
                <ModalTextarea 
                  value={profile.bio} 
                  onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell others about yourself..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Location</label>
                  <ModalInput 
                    value={profile.location} 
                    onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., London, UK"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Website</label>
                  <ModalInput 
                    value={profile.website} 
                    onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Type Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-4">Profile Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(PROFILE_TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setProfile(p => ({ ...p, profileType: key }))}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left",
                    profile.profileType === key
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", getProfileTypeConfig(key).bgColor)}>
                    <ProfileTypeIcon profileType={key} size={18} />
                  </div>
                  <p className="font-medium text-white text-sm">{config.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-4">Availability & Rates</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Your Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(AVAILABILITY_STATUS) as [AvailabilityStatus, typeof AVAILABILITY_STATUS[AvailabilityStatus]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setProfile(p => ({ ...p, availability: key }))}
                      className={cn(
                        "p-3 rounded-lg border transition-all text-left flex items-center gap-3",
                        profile.availability === key
                          ? `${config.bgColor} border-current`
                          : "border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        key === "AVAILABLE" && "bg-emerald-400",
                        key === "OPEN_TO_OFFERS" && "bg-blue-400",
                        key === "BUSY" && "bg-amber-400",
                        key === "NOT_AVAILABLE" && "bg-red-400",
                        profile.availability === key && key === "AVAILABLE" && "animate-pulse"
                      )} />
                      <div>
                        <p className={cn("font-medium text-sm", profile.availability === key ? config.color : "text-white")}>{config.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Default Hourly Rate</label>
                  <div className="flex gap-2">
                    <select
                      value={profile.currency}
                      onChange={(e) => setProfile(p => ({ ...p, currency: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <ModalInput 
                      type="number"
                      value={profile.hourlyRate ? profile.hourlyRate / 100 : ""}
                      onChange={(e) => setProfile(p => ({ 
                        ...p, 
                        hourlyRate: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null 
                      }))}
                      placeholder="50"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      )}

      {/* Skills Section */}
      {activeSection === "skills" && (
        <div className="space-y-6">
          {/* Your Skills */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Skills ({userSkills.length}/15)</h2>
            </div>
            
            {userSkills.length === 0 ? (
              <p className="text-white/50 text-sm py-8 text-center">No skills added yet. Add skills below to showcase your expertise.</p>
            ) : (
              <div className="space-y-3">
                {userSkills.map((userSkill) => {
                  const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
                  return (
                    <div
                      key={userSkill.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer hover:border-white/20",
                        userSkill.isPrimary 
                          ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30" 
                          : "bg-white/[0.02] border-white/10"
                      )}
                      onClick={() => setEditingSkill(userSkill)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {userSkill.isPrimary && (
                              <span className="text-amber-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </span>
                            )}
                            <span className="font-medium text-white">{userSkill.skill.name}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded", levelConfig.bgColor, levelConfig.color)}>
                              {levelConfig.label}
                            </span>
                          </div>
                          {userSkill.headline && (
                            <p className="text-sm text-white/60 mt-1">{userSkill.headline}</p>
                          )}
                          {userSkill.rate && userSkill.rateUnit && (
                            <p className="text-sm text-emerald-400 mt-1">
                              {formatRate(userSkill.rate, userSkill.rateUnit, profile.currency)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveSkill(userSkill.id, userSkill.skill.name); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Skills */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white mb-4">Add Skills</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <ModalInput
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | "ALL")}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="ALL">All Categories</option>
                {(Object.entries(SKILL_CATEGORIES) as [SkillCategory, typeof SKILL_CATEGORIES[SkillCategory]][]).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {filteredSkills.slice(0, 30).map((skill) => {
                const categoryConfig = SKILL_CATEGORIES[skill.category as SkillCategory];
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleAddSkill(skill)}
                    disabled={userSkills.length >= 15}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]",
                      userSkills.length >= 15 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <p className="font-medium text-white text-sm truncate">{skill.name}</p>
                    <p className={cn("text-xs mt-0.5", categoryConfig?.color || "text-white/50")}>
                      {categoryConfig?.label || skill.category}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skill Edit Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setEditingSkill(null)} />
          <div className="relative w-full max-w-lg bg-[#0a0a0f] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit {editingSkill.skill.name}</h3>
              <button onClick={() => setEditingSkill(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Experience Level */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Experience Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(EXPERIENCE_LEVELS) as [ExperienceLevel, typeof EXPERIENCE_LEVELS[ExperienceLevel]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setEditingSkill(s => s ? { ...s, experienceLevel: key } : null)}
                      className={cn(
                        "p-2 rounded-lg border text-xs font-medium transition-all",
                        editingSkill.experienceLevel === key
                          ? `${config.bgColor} ${config.color}`
                          : "border-white/10 text-white/60 hover:border-white/20"
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Skill Headline (optional)</label>
                <ModalInput
                  value={editingSkill.headline || ""}
                  onChange={(e) => setEditingSkill(s => s ? { ...s, headline: e.target.value } : null)}
                  placeholder={`e.g., Senior ${editingSkill.skill.name} Specialist`}
                />
              </div>

              {/* Rate */}
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Rate (optional)</label>
                <div className="flex gap-2">
                  <ModalInput
                    type="number"
                    value={editingSkill.rate ? editingSkill.rate / 100 : ""}
                    onChange={(e) => setEditingSkill(s => s ? { 
                      ...s, 
                      rate: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null 
                    } : null)}
                    placeholder="50"
                    className="flex-1"
                  />
                  <select
                    value={editingSkill.rateUnit || "HOURLY"}
                    onChange={(e) => setEditingSkill(s => s ? { ...s, rateUnit: e.target.value as RateUnit } : null)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  >
                    {(Object.entries(RATE_UNITS) as [RateUnit, typeof RATE_UNITS[RateUnit]][]).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability for this skill */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Availability for this skill</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(AVAILABILITY_STATUS) as [AvailabilityStatus, typeof AVAILABILITY_STATUS[AvailabilityStatus]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setEditingSkill(s => s ? { ...s, skillAvailability: key } : null)}
                      className={cn(
                        "p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2",
                        editingSkill.skillAvailability === key
                          ? `${config.bgColor} ${config.color}`
                          : "border-white/10 text-white/60 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        key === "AVAILABLE" && "bg-emerald-400",
                        key === "OPEN_TO_OFFERS" && "bg-blue-400",
                        key === "BUSY" && "bg-amber-400",
                        key === "NOT_AVAILABLE" && "bg-red-400",
                      )} />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">Primary Skill</p>
                  <p className="text-xs text-white/50">Shown prominently on your profile</p>
                </div>
                <button
                  onClick={() => setEditingSkill(s => s ? { ...s, isPrimary: !s.isPrimary } : null)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    editingSkill.isPrimary ? "bg-amber-500" : "bg-white/20"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                    editingSkill.isPrimary ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setEditingSkill(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleUpdateSkill(editingSkill)} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

