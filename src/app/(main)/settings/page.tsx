"use client";

import { surface } from "@/components/ui/design-system";
import AccountLinking from "./_components/AccountLinking";
import { SettingsPageHeader } from "./_components/SettingsPageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        eyebrow="Account"
        title="Account Settings"
        description="Manage your connected accounts and sign-in methods"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        }
      />
      
      {/* Account Linking Section */}
      <div 
        className={surface("panel", "noise-overlay relative overflow-hidden p-6 animate-slide-up")}
        style={{ animationDelay: '0.05s' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(800px 220px at 20% 0%, rgba(var(--color-accent-rgb),0.18), transparent 55%), radial-gradient(700px 240px at 90% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 60%)",
          }}
        />
        <AccountLinking />
      </div>
    </div>
  );
}
