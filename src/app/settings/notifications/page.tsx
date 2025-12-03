"use client";

import { useState, memo } from "react";
import { cn } from "@/lib/cn";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: "email_mentions",
    label: "Mentions",
    description: "When someone mentions you in a post or comment",
    enabled: true,
  },
  {
    id: "email_replies",
    label: "Replies",
    description: "When someone replies to your posts",
    enabled: true,
  },
  {
    id: "email_followers",
    label: "New Followers",
    description: "When someone follows your profile",
    enabled: false,
  },
  {
    id: "email_messages",
    label: "Direct Messages",
    description: "When you receive a new message",
    enabled: true,
  },
  {
    id: "email_updates",
    label: "Platform Updates",
    description: "News about new features and improvements",
    enabled: false,
  },
];

const Toggle = memo(function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        checked ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
});

export default function NotificationSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
          Notification Settings
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Choose what notifications you want to receive
        </p>
      </div>

      {/* Email Notifications */}
      <div className="bg-[#0d0d12] rounded-2xl p-6 border border-white/10 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Configure email alerts</p>
          </div>
        </div>

        <div className="space-y-1">
          {settings.map((setting, index) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors animate-slide-up"
              style={{ animationDelay: `${0.05 + index * 0.03}s` }}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="font-medium text-white">{setting.label}</div>
                <div className="text-sm text-[var(--muted-foreground)]">{setting.description}</div>
              </div>
              <Toggle 
                checked={setting.enabled} 
                onChange={() => toggleSetting(setting.id)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications - Coming Soon */}
      <div className="bg-[#0d0d12] rounded-2xl p-6 border border-white/10 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--muted-foreground)]">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white font-medium">Push Notifications</p>
            <p className="text-sm text-[var(--muted-foreground)]">Coming soon</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 opacity-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Push Notifications</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Browser and mobile alerts</p>
          </div>
        </div>

        <div className="space-y-4 opacity-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-3 w-40 bg-white/5 rounded mt-2" />
              </div>
              <div className="w-11 h-6 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
