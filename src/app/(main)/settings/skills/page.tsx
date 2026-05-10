"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Puzzle } from "lucide-react";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";
import { surface } from "@/components/ui/design-system";

export default function SkillsSettingsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/profile-hub");
  }, [router]);

  return (
    <div className="space-y-5">
      <SettingsPageHeader
        eyebrow="Skills"
        title="Skills"
        description="Skills live in Profile Hub so your profile and settings stay in sync."
        icon={<Puzzle size={20} aria-hidden="true" />}
      />
      <div className={surface("panel", "flex min-h-40 items-center justify-center p-6 text-center")}>
        <div>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          <p className="text-sm text-[var(--muted-foreground)]">Opening Profile Hub...</p>
        </div>
      </div>
    </div>
  );
}
