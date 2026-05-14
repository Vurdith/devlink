"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToastContext } from "@/components/providers/ToastProvider";
import { AddSkillsPanel } from "./AddSkillsPanel";
import { ProfileHubTabs } from "./ProfileHubTabs";
import { ProfileSection, type ProfileData } from "./ProfileSection";
import { SkillEditModal } from "./SkillEditModal";
import { UserSkillsPanel } from "./UserSkillsPanel";
import { iconBox, skeleton, surface } from "@/components/ui/design-system";
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
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);
  const [addingSkillId, setAddingSkillId] = useState<string | null>(null);
  const [isAddingCustomSkill, setIsAddingCustomSkill] = useState(false);
  const [savingSkillId, setSavingSkillId] = useState<string | null>(null);
  const [removingSkillId, setRemovingSkillId] = useState<string | null>(null);

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
        toast({ title: "Could not load profile", description: "Refresh the page and try again.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [status, toast]);

  // Save profile
  const handleSaveProfile = useCallback(async () => {
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
      toast({ title: "Saved", description: "Profile updated.", variant: "success" });
    } catch {
      toast({ title: "Could not save profile", description: "Check the fields and try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [name, profile, toast]);

  // Add skill
  const handleAddSkill = useCallback(async (skill: Skill) => {
    if (addingSkillId || isAddingCustomSkill) return false;
    if (userSkills.length >= 15) {
      toast({ title: "Skill limit reached", description: "Remove a skill before adding another.", variant: "destructive" });
      return false;
    }
    if (userSkills.some(us => us.skillId === skill.id)) {
      toast({ title: "Already added", description: `${skill.name} is already on your profile.`, variant: "default" });
      return false;
    }

    setAddingSkillId(skill.id);
    try {
      const res = await fetch("/api/users/me/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: skill.id, isPrimary: userSkills.length === 0 }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const newSkill = await res.json();
      setUserSkills(prev => [...prev, { ...newSkill, skill }]);
      toast({ title: "Added", description: `${skill.name} added to your profile.`, variant: "success" });
      return true;
    } catch {
      toast({ title: "Could not add skill", description: "Try again in a moment.", variant: "destructive" });
      return false;
    } finally {
      setAddingSkillId(null);
    }
  }, [addingSkillId, isAddingCustomSkill, toast, userSkills]);

  // Add custom skill
  const handleAddCustomSkill = useCallback(async (skillName: string) => {
    if (addingSkillId || isAddingCustomSkill) return false;
    if (userSkills.length >= 15) {
      toast({ title: "Skill limit reached", description: "Remove a skill before adding another.", variant: "destructive" });
      return false;
    }
    
    // Reuse catalog skills when the name already exists.
    const existingSkill = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (existingSkill) {
      return handleAddSkill(existingSkill);
    }

    setIsAddingCustomSkill(true);
    try {
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
      
      const addRes = await fetch("/api/users/me/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: newSkill.id, isPrimary: userSkills.length === 0 }),
      });
      
      if (!addRes.ok) throw new Error("Failed to add skill to profile");
      
      const userSkill = await addRes.json();
      setUserSkills(prev => [...prev, { ...userSkill, skill: newSkill }]);
      toast({ title: "Added", description: `${skillName} added to your profile.`, variant: "success" });
      return true;
    } catch (error) {
      toast({ title: "Could not create skill", description: error instanceof Error ? error.message : "Try a different name.", variant: "destructive" });
      return false;
    } finally {
      setIsAddingCustomSkill(false);
    }
  }, [addingSkillId, allSkills, handleAddSkill, isAddingCustomSkill, toast, userSkills.length]);

  // Update skill
  const handleUpdateSkill = useCallback(async (skillData: Partial<UserSkill>) => {
    if (!editingSkill || savingSkillId) return;
    
    setSavingSkillId(editingSkill.id);
    try {
      const res = await fetch("/api/users/me/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSkill.id, ...skillData }),
      });
      if (!res.ok) throw new Error("Failed to update");
      
      setUserSkills(prev => prev.map(us => 
        us.id === editingSkill.id
          ? { ...us, ...skillData }
          : skillData.isPrimary
            ? { ...us, isPrimary: false }
            : us
      ));
      setEditingSkill(null);
      toast({ title: "Saved", description: "Skill updated.", variant: "success" });
    } catch {
      toast({ title: "Could not update skill", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setSavingSkillId(null);
    }
  }, [editingSkill, savingSkillId, toast]);

  // Remove skill
  const handleRemoveSkill = useCallback(async (id: string, name: string) => {
    if (removingSkillId) return;

    setRemovingSkillId(id);
    try {
      const res = await fetch(`/api/users/me/skills?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      setUserSkills(prev => prev.filter(us => us.id !== id));
      toast({ title: "Removed", description: `${name} removed from your profile.`, variant: "success" });
    } catch {
      toast({ title: "Could not remove skill", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setRemovingSkillId(null);
    }
  }, [removingSkillId, toast]);

  if (status === "loading" || isLoading) {
    return (
      <main className="relative w-full min-w-0 px-0 py-4 sm:px-4 sm:py-10">
        <div className="relative mx-auto w-full min-w-0 max-w-4xl">
          <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-5 sm:mb-8")}>
            <div className="flex items-center gap-3">
              <div className={skeleton("h-10 w-10")} />
              <div className="min-w-0 flex-1">
                <div className={skeleton("mb-2 h-3 w-24")} />
                <div className={skeleton("h-7 w-44")} />
                <div className={skeleton("mt-2 h-4 w-64 max-w-full")} />
              </div>
            </div>
          </div>
          <div className={surface("toolbar", "noise-overlay mb-6 flex gap-2 overflow-hidden p-1.5")}>
            <div className={skeleton("h-10 w-28 flex-shrink-0")} />
            <div className={skeleton("h-10 w-40 flex-shrink-0")} />
          </div>
          <div className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
            <div className="flex items-center gap-3">
              <div className={skeleton("h-10 w-10")} />
              <div className="flex-1">
                <div className={skeleton("h-5 w-36")} />
                <div className={skeleton("mt-2 h-4 w-48 max-w-full")} />
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className={skeleton("h-11 w-full")} />
              <div className={skeleton("h-28 w-full")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={skeleton("h-11 w-full")} />
                <div className={skeleton("h-11 w-full")} />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-w-0 px-0 py-4 sm:px-4 sm:py-10">
      <div className="relative mx-auto w-full min-w-0 max-w-6xl">
        {/* Header */}
        <div className={surface("panel", "relative mb-6 overflow-hidden p-5 sm:mb-8 sm:p-6")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className={iconBox("cyan", "h-10 w-10 shrink-0")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-2)]">Profile hub</p>
                <h1 className="mt-1 font-[var(--font-space-grotesk)] text-2xl font-bold text-white">Edit your public profile</h1>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">Keep your name, bio, profile type, and skill list accurate.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="min-w-0">
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

            {activeSection === "skills" && (
              <div className="space-y-6">
                <UserSkillsPanel
                  userSkills={userSkills}
                  currency={profile.currency}
                  onEditSkill={setEditingSkill}
                  onRemoveSkill={handleRemoveSkill}
                  removingSkillId={removingSkillId}
                  isSavingSkill={Boolean(savingSkillId)}
                />

                <AddSkillsPanel
                  allSkills={allSkills}
                  userSkills={userSkills}
                  userSkillCount={userSkills.length}
                  onAddSkill={handleAddSkill}
                  onAddCustomSkill={handleAddCustomSkill}
                  addingSkillId={addingSkillId}
                  isAddingCustomSkill={isAddingCustomSkill}
                />
              </div>
            )}
          </div>
        </div>

      {editingSkill && (
        <SkillEditModal
          skill={editingSkill}
          onSave={handleUpdateSkill}
          onClose={() => {
            if (!savingSkillId) setEditingSkill(null);
          }}
          isSaving={savingSkillId === editingSkill.id}
        />
      )}
      </div>
    </main>
  );
}

