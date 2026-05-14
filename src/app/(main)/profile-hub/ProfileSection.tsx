import { Button } from "@/components/ui/Button";
import { ModalInput, ModalTextarea } from "@/components/ui/BaseModal";
import { OptionButton } from "@/components/ui/OptionCard";
import { iconBox, surface } from "@/components/ui/design-system";
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
      <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
        <div className="relative">
          <div className="mb-6 flex min-w-0 items-center gap-3">
            <div className={iconBox("cyan", "h-10 w-10")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white">Identity</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Name, bio, location, and website.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/68">Display name</label>
              <ModalInput value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/68">Bio</label>
              <ModalTextarea
                value={profile.bio}
                onChange={(event) => onProfileChange({ ...profile, bio: event.target.value })}
                placeholder="What you build, who you help, and how you work."
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/68">Location</label>
                <ModalInput
                  value={profile.location}
                  onChange={(event) => onProfileChange({ ...profile, location: event.target.value })}
                  placeholder="e.g., London, UK"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/68">Website</label>
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

      <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
        <div className="relative">
          <div className="mb-5 flex min-w-0 items-center gap-3">
            <div className={iconBox("cyan", "h-10 w-10")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white">Profile type</h2>
              <p className="text-sm text-[var(--muted-foreground)]">This label appears beside your name across DevLink.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {profileTypes.map((profileType) => {
              const isActive = profile.profileType === profileType.value;
              return (
                <OptionButton
                  key={profileType.value}
                  onClick={() => onProfileChange({ ...profile, profileType: profileType.value })}
                  selected={isActive}
                  className={cn(
                    "relative min-h-[86px] min-w-0 rounded-lg p-3.5 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)]",
                    isActive
                      ? `${profileType.bgColor} ${profileType.borderColor} text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`
                      : null
                  )}
                >
                  <div
                    className={cn(
                      "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                      isActive ? `border-transparent bg-gradient-to-br ${profileType.gradient}` : "border-white/[0.18]"
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
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all",
                      isActive ? `bg-gradient-to-br ${profileType.gradient} text-white` : "bg-white/[0.045] text-[var(--muted-foreground)] group-hover:bg-white/[0.075] group-hover:text-white/78"
                    )}
                  >
                    {profileType.icon}
                  </div>

                  <div className="min-w-0 flex-1 pr-7">
                    <div className="break-words font-medium text-white">{profileType.label}</div>
                    <div className="mt-1 break-words text-xs leading-relaxed text-[var(--muted-foreground)]">{profileType.description}</div>
                  </div>
                </OptionButton>
              );
            })}
          </div>
        </div>
      </div>

      <Button onClick={onSaveProfile} disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}
