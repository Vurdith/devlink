import { Button } from "@/components/ui/Button";
import { ModalInput, ModalTextarea } from "@/components/ui/BaseModal";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { profileTypes } from "./profile-type-options";

export interface ProfileData {
  bio: string;
  location: string;
  website: string;
  profileType: string;
  availability: string;
  headline: string;
  hourlyRate: number | null;
  currency: string;
  responseTime: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

interface ProfileSectionProps {
  name: string;
  profile: ProfileData;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onProfileChange: (profile: ProfileData) => void;
  onSaveProfile: () => void;
}

export function ProfileSection({
  name,
  profile,
  isSaving,
  onNameChange,
  onProfileChange,
  onSaveProfile,
}: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div className={surface("panel", "relative overflow-hidden p-6")}>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-65"
          style={{
            background:
              "radial-gradient(900px 260px at 20% 0%, rgba(var(--color-accent-rgb),0.12), transparent 62%), radial-gradient(700px 260px at 90% 10%, rgba(var(--color-accent-2-rgb),0.10), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className={iconBox("cyan", "h-10 w-10")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <ModalInput value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Bio</label>
              <ModalTextarea
                value={profile.bio}
                onChange={(event) => onProfileChange({ ...profile, bio: event.target.value })}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Location</label>
                <ModalInput
                  value={profile.location}
                  onChange={(event) => onProfileChange({ ...profile, location: event.target.value })}
                  placeholder="e.g., London, UK"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Website</label>
                <ModalInput
                  value={profile.website}
                  onChange={(event) => onProfileChange({ ...profile, website: event.target.value })}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={surface("panel", "relative overflow-hidden p-6")}>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-55"
          style={{
            background:
              "radial-gradient(900px 260px at 18% 0%, rgba(var(--color-accent-rgb),0.10), transparent 62%), radial-gradient(700px 260px at 92% 10%, rgba(var(--color-accent-2-rgb),0.10), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className={iconBox("cyan", "h-10 w-10")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile Type</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Choose how you want to use DevLink</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profileTypes.map((profileType) => {
              const isActive = profile.profileType === profileType.value;
              return (
                <button
                  key={profileType.value}
                  type="button"
                  onClick={() => onProfileChange({ ...profile, profileType: profileType.value })}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all group",
                    isActive
                      ? `${profileType.bgColor} ${profileType.borderColor} ${ui.active.purple}`
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isActive ? `bg-gradient-to-br ${profileType.gradient} border-transparent` : "border-white/20"
                    )}
                  >
                    {isActive && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all",
                      isActive ? `bg-gradient-to-br ${profileType.gradient} text-white` : "bg-white/[0.045] text-[var(--muted-foreground)] group-hover:bg-white/[0.075]"
                    )}
                  >
                    {profileType.icon}
                  </div>

                  <div className="font-medium text-white mb-1">{profileType.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{profileType.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button onClick={onSaveProfile} disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
