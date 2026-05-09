"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToastContext } from "@/components/providers/ToastProvider";
import { AddSkillsPanel } from "./AddSkillsPanel";
import { ProfileHubTabs } from "./ProfileHubTabs";
import { ProfileSection, type ProfileData } from "./ProfileSection";
import { SkillEditModal } from "./SkillEditModal";
import { UserSkillsPanel } from "./UserSkillsPanel";
import { iconBox, surface } from "@/components/ui/design-system";
import type { Skill, UserSkill } from "./profile-hub-types";

export default function ProfileHubPage() {
  const { status } = useSession();
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
      } catch {
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
    } catch {
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
    } catch {
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
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create custom skill", variant: "destructive" });
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
    } catch {
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
    } catch {
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
    <main className="relative px-4 py-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-5 sm:mb-8")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
          <div className="inline-flex items-center gap-3">
            <div className={iconBox("cyan", "h-10 w-10")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Profile tools</div>
              <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">Profile Hub</h1>
              <p className="text-[var(--muted-foreground)] mt-0.5">Manage your profile, skills, and services</p>
            </div>
          </div>
        </div>

      <ProfileHubTabs activeSection={activeSection} onSectionChange={setActiveSection} />

      {activeSection === "profile" && (
        <ProfileSection
          name={name}
          profile={profile}
          isSaving={isSaving}
          onNameChange={setName}
          onProfileChange={setProfile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Skills Section */}
      {activeSection === "skills" && (
        <div className="space-y-6">
          <UserSkillsPanel
            userSkills={userSkills}
            currency={profile.currency}
            onEditSkill={setEditingSkill}
            onRemoveSkill={handleRemoveSkill}
          />

          <AddSkillsPanel
            filteredSkills={filteredSkills}
            skillSearch={skillSearch}
            userSkillCount={userSkills.length}
            onSkillSearchChange={setSkillSearch}
            onAddSkill={handleAddSkill}
            onAddCustomSkill={handleAddCustomSkill}
          />
        </div>
      )}

      {editingSkill && (
        <SkillEditModal
          skill={editingSkill}
          onSkillChange={setEditingSkill}
          onSave={handleUpdateSkill}
          onClose={() => setEditingSkill(null)}
        />
      )}
      </div>
    </main>
  );
}

