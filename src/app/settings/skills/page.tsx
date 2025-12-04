"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SkillsSettingsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/profile-hub");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--muted-foreground)]">Redirecting to Profile Hub...</p>
      </div>
    </div>
  );
}
