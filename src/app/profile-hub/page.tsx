"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ModalInput, ModalTextarea, Tooltip } from "@/components/ui/BaseModal";
import { 
  EXPERIENCE_LEVELS, 
  AVAILABILITY_STATUS, 
  RATE_UNITS,
  formatRate,
  type ExperienceLevel,
  type AvailabilityStatus,
  type RateUnit,
} from "@/lib/skills";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";

// Profile type configurations with icons and colors
const profileTypes = [
  { 
    value: "DEVELOPER", 
    label: "Developer", 
    description: "Showcase portfolio and projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/10"
  },
  { 
    value: "CLIENT", 
    label: "Client", 
    description: "Hire talent and post jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 7h-4V3H8v4H4v14h16V7zM8 21V7h8v14H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-emerald-500 to-green-500",
    borderColor: "border-emerald-500/50",
    bgColor: "bg-emerald-500/10"
  },
  { 
    value: "STUDIO", 
    label: "Studio", 
    description: "Team profile with members",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-purple-500 to-purple-600",
    borderColor: "border-purple-500/50",
    bgColor: "bg-purple-500/10"
  },
  { 
    value: "INFLUENCER", 
    label: "Influencer", 
    description: "Promote and collaborate",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-rose-500 to-pink-500",
    borderColor: "border-rose-500/50",
    bgColor: "bg-rose-500/10"
  },
  { 
    value: "INVESTOR", 
    label: "Investor", 
    description: "Fund projects and startups",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-amber-500 to-yellow-500",
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-500/10"
  },
  { 
    value: "GUEST", 
    label: "Guest", 
    description: "Browse and explore",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    gradient: "from-slate-500 to-gray-500",
    borderColor: "border-slate-500/50",
    bgColor: "bg-slate-500/10"
  },
];

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

  // Add custom skill
  const handleAddCustomSkill = async (skillName: string) => {
    if (userSkills.length >= 15) {
      toast({ title: "Limit reached", description: "Maximum 15 skills allowed", variant: "destructive" });
      return;
    }
    
    // Check if skill name already exists (case insensitive)
    const existingSkill = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (existingSkill) {
      handleAddSkill(existingSkill);
      return;
    }

    try {
      // First create the custom skill
      const createRes = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: skillName }),
      });
      
      if (!createRes.ok) {
        const error = await createRes.json();
        throw new Error(error.error || "Failed to create skill");
      }
      
      const newSkill = await createRes.json();
      setAllSkills(prev => [...prev, newSkill]);
      
      // Then add it to user's skills
      const addRes = await fetch("/api/users/me/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: newSkill.id, isPrimary: userSkills.length === 0 }),
      });
      
      if (!addRes.ok) throw new Error("Failed to add skill to profile");
      
      const userSkill = await addRes.json();
      setUserSkills(prev => [...prev, { ...userSkill, skill: newSkill }]);
      setSkillSearch("");
      toast({ title: "Added!", description: `"${skillName}" created and added to your skills`, variant: "success" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create custom skill", variant: "destructive" });
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

      {/* Section Tabs - Profile Page Style */}
      <div className="flex gap-2 mb-6 overflow-x-auto bg-black/40 rounded-xl p-2 border border-[rgba(var(--color-accent-rgb),0.2)]">
        <button
          onClick={() => setActiveSection("profile")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap",
            activeSection === "profile" 
              ? "text-white bg-[rgba(var(--color-accent-rgb),0.2)] border border-[rgba(var(--color-accent-rgb),0.4)]" 
              : "text-[var(--muted-foreground)] hover:text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] border border-transparent"
          )}
        >
          <svg className={cn("w-4 h-4", activeSection === "profile" && "text-[var(--color-accent)]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>
        <button
          onClick={() => setActiveSection("skills")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap",
            activeSection === "skills" 
              ? "text-white bg-[rgba(var(--color-accent-rgb),0.2)] border border-[rgba(var(--color-accent-rgb),0.4)]" 
              : "text-[var(--muted-foreground)] hover:text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] border border-transparent"
          )}
        >
          <svg className={cn("w-4 h-4", activeSection === "skills" && "text-[var(--color-accent)]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills & Services
        </button>
      </div>

      {/* Profile Section */}
      {activeSection === "profile" && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="p-6 rounded-xl bg-[#0d0d12] border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Your public profile details</p>
              </div>
            </div>
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

          {/* Profile Type Card - Settings Style */}
          <div className="p-6 rounded-xl bg-[#0d0d12] border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Profile Type</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Choose how you want to use DevLink</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profileTypes.map((profileType, index) => {
                const isActive = profile.profileType === profileType.value;
                return (
                  <button
                    key={profileType.value}
                    type="button"
                    onClick={() => setProfile(p => ({ ...p, profileType: profileType.value }))}
                    className={cn(
                      "relative p-4 rounded-xl border text-left transition-all group",
                      isActive 
                        ? `${profileType.bgColor} ${profileType.borderColor}` 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {/* Selection indicator */}
                    <div className={cn(
                      "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isActive 
                        ? `bg-gradient-to-br ${profileType.gradient} border-transparent` 
                        : "border-white/20"
                    )}>
                      {isActive && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all",
                      isActive 
                        ? `bg-gradient-to-br ${profileType.gradient} text-white shadow-lg` 
                        : "bg-white/10 text-[var(--muted-foreground)] group-hover:bg-white/15"
                    )}>
                      {profileType.icon}
                    </div>
                    
                    {/* Text */}
                    <div className="font-medium text-white mb-1">{profileType.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{profileType.description}</div>
                  </button>
                );
              })}
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
          <div className="p-6 rounded-xl bg-[#0d0d12] border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Your Skills ({userSkills.length}/15)</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Click a skill to edit rates and details</p>
              </div>
            </div>
            
            {userSkills.length === 0 ? (
              <p className="text-white/50 text-sm py-8 text-center">No skills added yet. Add skills below to showcase your expertise.</p>
            ) : (
              <div className="space-y-3">
                {userSkills.map((userSkill) => {
                  const levelConfig = EXPERIENCE_LEVELS[userSkill.experienceLevel];
                  const availConfig = userSkill.skillAvailability ? AVAILABILITY_STATUS[userSkill.skillAvailability as AvailabilityStatus] : null;
                  return (
                    <div
                      key={userSkill.id}
                      className={cn(
                        "rounded-xl border transition-all overflow-hidden",
                        userSkill.isPrimary 
                          ? "bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20" 
                          : "bg-white/[0.01] border-white/[0.06] hover:border-white/10"
                      )}
                    >
                      {/* Content area */}
                      <div className="p-5">
                        {/* Top row: Name + Rate */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            {userSkill.isPrimary && (
                              <span className="text-amber-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </span>
                            )}
                            <h4 className="font-semibold text-white text-base">{userSkill.skill.name}</h4>
                          </div>
                          
                        {/* Rate */}
                        {userSkill.rate && userSkill.rateUnit && (
                          <span className="text-sm font-medium text-emerald-400">
                            {formatRate(userSkill.rate, userSkill.rateUnit, profile.currency)}
                          </span>
                        )}
                        </div>
                        
                        {/* Middle row: Metadata */}
                        <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                          <span className={levelConfig.color}>
                            {levelConfig.label}
                          </span>
                          
                          {userSkill.yearsOfExp && (
                            <>
                              <span className="text-white/20">•</span>
                              <span>{userSkill.yearsOfExp}+ years</span>
                            </>
                          )}
                          
                          {availConfig && (
                            <>
                              <span className="text-white/20">•</span>
                              <span className="flex items-center gap-1.5">
                                <span className={cn("w-1.5 h-1.5 rounded-full", 
                                  userSkill.skillAvailability === 'AVAILABLE' && "bg-emerald-400",
                                  userSkill.skillAvailability === 'OPEN_TO_OFFERS' && "bg-blue-400",
                                  userSkill.skillAvailability === 'BUSY' && "bg-amber-400",
                                  userSkill.skillAvailability === 'NOT_AVAILABLE' && "bg-red-400",
                                )} />
                                <span className={availConfig.color}>{availConfig.label}</span>
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Headline */}
                        {userSkill.headline && (
                          <p className="text-sm text-white/60 leading-relaxed">{userSkill.headline}</p>
                        )}
                        
                        {/* Description preview */}
                        {userSkill.description && (
                          <p className="text-xs text-white/40 leading-relaxed mt-2 line-clamp-2">{userSkill.description}</p>
                        )}
                      </div>
                      
                      {/* Actions - full width border */}
                      <div className="flex items-center gap-2 px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                        <button
                          onClick={() => setEditingSkill(userSkill)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveSkill(userSkill.id, userSkill.skill.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Skills */}
          <div className="p-6 rounded-xl bg-[#0d0d12] border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Add Skills</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Search from 200+ skills or add your own</p>
              </div>
            </div>
            
            <ModalInput
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="mb-4"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
              {filteredSkills.slice(0, 30).map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleAddSkill(skill)}
                  disabled={userSkills.length >= 15}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    "border-white/10 hover:border-[var(--color-accent)]/30 bg-white/[0.02] hover:bg-[var(--color-accent)]/5",
                    userSkills.length >= 15 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <p className="font-medium text-white text-sm">{skill.name}</p>
                </button>
              ))}
              
              {/* Show "add custom skill" when no results or user is searching */}
              {skillSearch.trim() && filteredSkills.length === 0 && (
                <button
                  onClick={() => handleAddCustomSkill(skillSearch.trim())}
                  disabled={userSkills.length >= 15}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all col-span-full",
                    "border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10",
                    userSkills.length >= 15 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <p className="font-medium text-white text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add "{skillSearch.trim()}" as custom skill
                  </p>
                </button>
              )}
            </div>
            
            {/* Custom skill hint */}
            {!skillSearch.trim() && (
              <p className="text-xs text-white/40 text-center">
                Can't find your skill? Type it above and add it as a custom skill
              </p>
            )}
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

              {/* Years of Experience */}
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Years of Experience (optional)</label>
                <ModalInput
                  type="number"
                  value={editingSkill.yearsOfExp || ""}
                  onChange={(e) => setEditingSkill(s => s ? { ...s, yearsOfExp: e.target.value ? parseInt(e.target.value) : null } : null)}
                  placeholder="e.g., 3"
                  min={0}
                  max={50}
                />
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

              {/* Description */}
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Description (optional)</label>
                <ModalTextarea
                  value={editingSkill.description || ""}
                  onChange={(e) => setEditingSkill(s => s ? { ...s, description: e.target.value } : null)}
                  placeholder="What you offer and your approach..."
                  rows={3}
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
                    className="px-3 py-2 pr-8 rounded-lg bg-[#1a1a24] border border-white/20 text-white text-sm cursor-pointer hover:border-white/30 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
                  >
                    {(Object.entries(RATE_UNITS) as [RateUnit, typeof RATE_UNITS[RateUnit]][]).map(([key, config]) => (
                      <option key={key} value={key} className="bg-[#1a1a24] text-white">{config.label}</option>
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

