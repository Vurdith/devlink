"use client";

import { surface } from "@/components/ui/design-system";
import AccountLinking from "./_components/AccountLinking";
import { SettingsPageHeader } from "./_components/SettingsPageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        eyebrow="Account"
        title="Account"
        description="Manage sign-in providers and keep a password fallback ready."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        }
      />
      
      <div 
        className={surface("panel", "relative overflow-hidden p-4 animate-slide-up sm:p-6")}
        style={{ animationDelay: '0.05s' }}
      >
        <AccountLinking />
      </div>
    </div>
  );
}
