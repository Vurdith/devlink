"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { surface } from "@/components/ui/design-system";
import { OptionButton } from "@/components/ui/OptionCard";
import { safeJson } from "@/lib/safe-json";
import type { MessagingSettings } from "@/types/api";
import { SettingsAuthRequired } from "../_components/SettingsAuthRequired";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";
import { SettingsSection } from "../_components/SettingsSection";

const options = [
  { value: "EVERYONE", label: "Everyone", description: "Anyone on DevLink can start a conversation." },
  { value: "FOLLOWERS", label: "Followers", description: "People who follow you can message first." },
  { value: "FOLLOWING", label: "People I follow", description: "Only people you follow can start a new thread." },
  { value: "MUTUALS", label: "Mutuals only", description: "Both of you must follow each other first." },
  { value: "NONE", label: "No one", description: "New conversations stay closed unless you start them." },
];

export default function MessagingSettingsPage() {
  const { status } = useSession();
  const [settings, setSettings] = useState<MessagingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingChoice, setSavingChoice] = useState<MessagingSettings["allowFrom"] | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setLoadingSettings(false);
      return;
    }

    let isMounted = true;
    async function load() {
      setLoadingSettings(true);
      try {
        const res = await fetch("/api/settings/messaging");
        const data = await safeJson<MessagingSettings & { error?: string }>(res);
        if (isMounted) {
          if (res.ok) {
            setSettings((data || { allowFrom: "FOLLOWING" }) as MessagingSettings);
            setError(null);
          } else {
            setError(data?.error || "Unable to load messaging settings");
          }
        }
      } catch {
        if (isMounted) setError("Unable to reach messaging settings. Check your connection and try again.");
      } finally {
        if (isMounted) setLoadingSettings(false);
      }
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, [status]);

  async function updateSetting(allowFrom: MessagingSettings["allowFrom"]) {
    if (saving || settings?.allowFrom === allowFrom) return;
    setSaving(true);
    setSavingChoice(allowFrom);
    setSavedMessage(null);
    try {
      const res = await fetch("/api/settings/messaging", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowFrom }),
      });
      const data = await safeJson<MessagingSettings & { error?: string }>(res);
      if (res.ok && data) {
        setSettings(data);
        setError(null);
        setSavedMessage("Message rule saved.");
      } else {
        setError(data?.error || "Failed to update messaging settings");
      }
    } catch {
      setError("Unable to save messaging settings. Check your connection and try again.");
    } finally {
      setSaving(false);
      setSavingChoice(null);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        eyebrow="Messaging"
        title="Messaging"
        description="Choose who can open a new conversation with you."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />

      {status === "unauthenticated" ? (
        <SettingsAuthRequired
          title="Sign in to control who can message you"
          description="Messaging rules protect your inbox. Sign in to choose who can start conversations and how requests are handled."
        />
      ) : loadingSettings ? (
        <div className={surface("panel", "p-6")}>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-48 animate-pulse rounded bg-white/[0.08]" />
              <div className="mt-2 h-4 w-64 max-w-full animate-pulse rounded bg-white/[0.045]" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.035]" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <SettingsSection
            title="New conversations"
            description="Choose who can send the first message."
            className="animate-slide-up"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <span className="min-w-0 flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => settings && void updateSetting(settings.allowFrom)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-400/10"
                >
                  Retry
                </button>
              </div>
            )}

            {saving || savedMessage ? (
              <div className="mb-4 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-[var(--muted-foreground)]" role="status">
                {saving ? "Saving inbox rule..." : savedMessage}
              </div>
            ) : null}

            <div className="space-y-1">
              {options.map((option, index) => {
                const isSelected = settings?.allowFrom === option.value;
                const isSavingThis = savingChoice === option.value;
                return (
                  <OptionButton
                    key={option.value}
                    disabled={saving}
                    selected={isSelected}
                    onClick={() => updateSetting(option.value as MessagingSettings["allowFrom"])}
                    className="animate-slide-up outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]"
                    style={{ animationDelay: `${0.05 + index * 0.03}s` }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="min-w-0">
                        <span className="block font-semibold text-white">{option.label}</span>
                        <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">{option.description}</span>
                      </span>
                    </div>
                    {isSavingThis ? (
                      <span className="shrink-0 text-xs font-semibold text-[var(--color-accent)]">Saving</span>
                    ) : isSelected ? (
                      <span className="shrink-0 text-xs font-semibold text-[var(--color-accent)]">Active</span>
                    ) : null}
                  </OptionButton>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Requests"
            description="Messages outside your rule arrive here instead of opening a thread."
            tone="muted"
            className="animate-slide-up"
            style={{ animationDelay: "0.08s" }}
          >
            <p className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Messages outside your rule arrive as requests. You can accept the thread or leave it closed.
            </p>
          </SettingsSection>
        </>
      )}
    </div>
  );
}
