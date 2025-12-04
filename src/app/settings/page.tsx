"use client";

import AccountLinking from "./_components/AccountLinking";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
          Account Settings
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your connected accounts and sign-in methods
        </p>
      </div>
      
      {/* Account Linking Section */}
      <div 
        className="bg-[#0d0d12] rounded-2xl p-6 border border-[var(--color-accent)]/20 animate-slide-up"
        style={{ animationDelay: '0.05s' }}
      >
        <AccountLinking />
      </div>
    </div>
  );
}
