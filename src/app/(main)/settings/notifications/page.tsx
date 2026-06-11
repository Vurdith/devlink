"use client";

import { useCallback, useEffect, useState, memo } from "react";
import type { ComponentType } from "react";
import { useSession } from "next-auth/react";
import { Bell, BellDot, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import { safeJson } from "@/lib/safe-json";
import { surface } from "@/components/ui/design-system";
import { OptionCard } from "@/components/ui/OptionCard";
import { cn } from "@/lib/cn";
import { SettingsAuthRequired } from "../_components/SettingsAuthRequired";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";
import { SettingsSection } from "../_components/SettingsSection";

type NotificationPreferenceKey = "likes" | "reposts" | "replies" | "mentions" | "follows";
type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

interface NotificationSetting {
  id: NotificationPreferenceKey;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

type NotificationSettingsPayload = Partial<NotificationPreferences> & { error?: string };

const defaultPreferences: NotificationPreferences = {
  likes: true,
  reposts: true,
  replies: true,
  mentions: true,
  follows: true,
};

const notificationSettings: NotificationSetting[] = [
  {
    id: "mentions",
    label: "Mentions",
    description: "Someone tags you in a post or reply.",
    icon: BellDot,
  },
  {
    id: "replies",
    label: "Replies",
    description: "Someone replies to one of your posts.",
    icon: MessageCircle,
  },
  {
    id: "follows",
    label: "New followers",
    description: "Someone follows your profile.",
    icon: UserPlus,
  },
  {
    id: "likes",
    label: "Likes",
    description: "Someone likes one of your posts.",
    icon: Heart,
  },
  {
    id: "reposts",
    label: "Reposts",
    description: "Someone reposts one of your posts.",
    icon: Repeat2,
  },
];

function normalizePreferences(input: NotificationSettingsPayload | null): NotificationPreferences {
  return {
    ...defaultPreferences,
    likes: typeof input?.likes === "boolean" ? input.likes : defaultPreferences.likes,
    reposts: typeof input?.reposts === "boolean" ? input.reposts : defaultPreferences.reposts,
    replies: typeof input?.replies === "boolean" ? input.replies : defaultPreferences.replies,
    mentions: typeof input?.mentions === "boolean" ? input.mentions : defaultPreferences.mentions,
    follows: typeof input?.follows === "boolean" ? input.follows : defaultPreferences.follows,
  };
}

const Toggle = memo(function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60",
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
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<NotificationPreferenceKey | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadPreferences = useCallback(async () => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settings/notifications", { cache: "no-store" });
      const data = await safeJson<NotificationSettingsPayload>(res);
      if (!res.ok) {
        setError(data?.error || "Notification preferences did not load.");
        return;
      }
      setPreferences(normalizePreferences(data));
    } catch {
      setError("Notification preferences are not reachable right now.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadPreferences();
      return;
    }

    if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [loadPreferences, status]);

  async function toggleSetting(id: NotificationPreferenceKey) {
    if (savingKey) return;

    const previous = preferences;
    const next = { ...preferences, [id]: !preferences[id] };
    setPreferences(next);
    setSavingKey(id);
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await safeJson<NotificationSettingsPayload>(res);
      if (!res.ok) {
        setPreferences(previous);
        setError(data?.error || "Notification preferences were not saved.");
        return;
      }

      setPreferences(normalizePreferences(data));
      setFeedback("Notification preferences saved.");
    } catch {
      setPreferences(previous);
      setError("Notification preferences were not saved. Check your connection, then try again.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        eyebrow="Notifications"
        title="Notifications"
        description="Choose which in-app events should pull you back into DevLink."
        icon={<Bell className="h-5 w-5" aria-hidden="true" />}
      />

      {status === "unauthenticated" ? (
        <SettingsAuthRequired
          title="Sign in to manage notification settings"
          description="Notification preferences are tied to your account. Sign in to choose which updates should reach you."
        />
      ) : status === "loading" || loading ? (
        <div className={surface("panel", "p-6")}>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-48 animate-pulse rounded bg-white/[0.08]" />
              <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded bg-white/[0.045]" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.035]" />
            ))}
          </div>
        </div>
      ) : (
        <SettingsSection
          title="In-app alerts"
          description="Mute low-value activity while keeping the moments that matter."
          className="animate-slide-up"
          style={{ animationDelay: "0.05s" }}
          icon={<BellDot className="h-5 w-5 text-white" aria-hidden="true" />}
        >
          {error ? (
            <div className={cn(surface("empty"), "mb-4 border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-100")} role="alert">
              {error}
            </div>
          ) : null}
          {feedback ? (
            <div className={cn(surface("empty"), "mb-4 border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100")} role="status">
              {feedback}
            </div>
          ) : null}

          <div className="space-y-1">
            {notificationSettings.map((setting, index) => {
              const Icon = setting.icon;
              const isSaving = savingKey === setting.id;
              const isDisabled = Boolean(savingKey);

              return (
                <OptionCard
                  key={setting.id}
                  selected={preferences[setting.id]}
                  disabled={isDisabled}
                  className="animate-slide-up"
                  style={{ animationDelay: `${0.05 + index * 0.03}s` }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[var(--color-accent-2)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white">{setting.label}</div>
                      <div className="mt-0.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{setting.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <Toggle checked={preferences[setting.id]} disabled={isDisabled} onChange={() => void toggleSetting(setting.id)} />
                    {isSaving ? <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">Saving</span> : null}
                  </div>
                </OptionCard>
              );
            })}
          </div>
        </SettingsSection>
      )}
    </div>
  );
}
