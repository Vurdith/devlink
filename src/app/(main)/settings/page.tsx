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
        className="relative overflow-hidden glass glass-hover rounded-2xl p-6 border border-[var(--color-accent)]/20 animate-slide-up noise-overlay"
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
