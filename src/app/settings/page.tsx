"use client";

import { ProfileTypeCard } from "./_components/ProfileTypeCard";
import AccountLinking from "./_components/AccountLinking";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
          Profile Settings
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your profile type and connected accounts
        </p>
      </div>

      {/* Profile Type Section */}
      <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <ProfileTypeCard />
      </div>
      
      {/* Account Linking Section */}
      <div 
        className="glass rounded-2xl p-6 border border-purple-500/20 bg-purple-500/5 animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        <AccountLinking />
      </div>
    </div>
  );
}
