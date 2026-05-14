"use client";

import { useState, memo } from "react";
import { useSession } from "next-auth/react";
import { surface } from "@/components/ui/design-system";
import { OptionCard } from "@/components/ui/OptionCard";
import { cn } from "@/lib/cn";
import { SettingsAuthRequired } from "../_components/SettingsAuthRequired";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";
import { SettingsSection } from "../_components/SettingsSection";

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
    label: "New followers",
    description: "When someone follows your profile",
    enabled: false,
  },
  {
    id: "email_messages",
    label: "Direct messages",
    description: "When you receive a new message",
    enabled: true,
  },
  {
    id: "email_updates",
    label: "Product changes",
    description: "Important account and DevLink release updates",
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
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        checked ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
});

export default function NotificationSettings() {
  const { status } = useSession();
  const [settings, setSettings] = useState(defaultSettings);

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        eyebrow="Notifications"
        title="Notifications"
        description="Control the account events that can reach your email."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />

      {status === "unauthenticated" ? (
        <SettingsAuthRequired
          title="Sign in to manage notification settings"
          description="Notification preferences are tied to your account. Sign in to choose which updates should reach you."
        />
      ) : status === "loading" ? (
        <div className={surface("panel", "p-6")}>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-48 animate-pulse rounded bg-white/[0.08]" />
              <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded bg-white/[0.045]" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.035]" />
            ))}
          </div>
        </div>
      ) : (
        <>
      <SettingsSection
        title="Email"
        description="Choose the moments worth sending outside the app."
        className="animate-slide-up"
        style={{ animationDelay: '0.05s' }}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
          </svg>
        }
      >
        <div className="space-y-1">
          {settings.map((setting, index) => (
            <OptionCard
              key={setting.id}
              selected={setting.enabled}
              className="animate-slide-up"
              style={{ animationDelay: `${0.05 + index * 0.03}s` }}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="font-semibold text-white">{setting.label}</div>
                <div className="mt-0.5 text-sm text-[var(--muted-foreground)]">{setting.description}</div>
              </div>
              <Toggle 
                checked={setting.enabled} 
                onChange={() => toggleSetting(setting.id)} 
              />
            </OptionCard>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Push"
        description="Browser notifications will be added after inbox delivery is stable."
        tone="muted"
        className="animate-slide-up"
        style={{ animationDelay: '0.1s' }}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
        aside={
          <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-white/50">
            Later
          </span>
        }
      >
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
          Push settings are hidden until the delivery system exists, so this page only shows controls that work today.
        </div>
      </SettingsSection>
        </>
      )}
    </div>
  );
}
