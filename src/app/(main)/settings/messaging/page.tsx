"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import type { MessagingSettings } from "@/types/api";

const options = [
  { value: "EVERYONE", label: "Everyone" },
  { value: "FOLLOWERS", label: "Followers" },
  { value: "FOLLOWING", label: "People I follow" },
  { value: "MUTUALS", label: "Mutuals only" },
  { value: "NONE", label: "No one" },
];

export default function MessagingSettingsPage() {
  const { status } = useSession();
  const [settings, setSettings] = useState<MessagingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let isMounted = true;
    async function load() {
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
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [status]);

  async function updateSetting(allowFrom: MessagingSettings["allowFrom"]) {
    setSaving(true);
    const res = await fetch("/api/settings/messaging", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowFrom }),
    });
    const data = await safeJson<MessagingSettings & { error?: string }>(res);
    if (res.ok && data) {
      setSettings(data);
      setError(null);
    } else {
      setError(data?.error || "Failed to update messaging settings");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
          Messaging Settings
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Control who can start conversations with you.
        </p>
      </div>

      {status === "unauthenticated" ? (
        <div className="glass-soft border border-white/10 rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
          Sign in to update messaging preferences.
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden glass glass-hover rounded-2xl p-6 border border-white/10 animate-slide-up noise-overlay">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(900px 240px at 15% 0%, rgba(var(--color-accent-rgb),0.16), transparent 55%), radial-gradient(800px 240px at 95% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Who can message you</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">New messages from others</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
                  {error}
                </div>
              )}

          <div className="space-y-1">
            {options.map((option, index) => {
              const isSelected = settings?.allowFrom === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={saving}
                  onClick={() => updateSetting(option.value as MessagingSettings["allowFrom"])}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all animate-slide-up",
                    isSelected
                      ? "bg-[rgba(var(--color-accent-rgb),0.10)] border-[rgba(var(--color-accent-rgb),0.22)] text-white"
                      : "bg-white/[0.03] border-white/10 text-[var(--muted-foreground)] hover:bg-white/[0.05] hover:border-white/15",
                    saving && "opacity-60 cursor-not-allowed"
                  )}
                  style={{ animationDelay: `${0.05 + index * 0.03}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full border",
                        isSelected
                          ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                          : "border-white/20"
                      )}
                    />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-[var(--color-accent)]">Selected</span>
                  )}
                </button>
              );
            })}
          </div>
            </div>
          </div>

          <div className="relative overflow-hidden glass rounded-2xl p-6 border border-white/10 animate-slide-up noise-overlay" style={{ animationDelay: "0.08s" }}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(900px 240px at 20% 0%, rgba(56,189,248,0.12), transparent 60%), radial-gradient(800px 240px at 90% 0%, rgba(14,165,233,0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <h2 className="text-lg font-semibold text-white mb-2">Message requests</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                When someone doesn’t match your rules, their message becomes a request you can accept or decline.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
