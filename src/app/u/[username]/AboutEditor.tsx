"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AboutEditor({ initialBio, initialLocation, initialWebsite, initialName, username, editable }: {
  initialBio?: string | null;
  initialLocation?: string | null;
  initialWebsite?: string | null;
  initialName?: string | null;
  username?: string;
  editable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(initialBio ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [website, setWebsite] = useState(initialWebsite ?? "");
  const [name, setName] = useState(initialName ?? "");
  const [saving, setSaving] = useState(false);

  if (!editable) return null;

  async function onSave() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, location, website, name })
      });
      setOpen(false);
      try {
        window.dispatchEvent(new Event("devlink:profile-updated"));
      } catch {}
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 md:top-3 group">
        <button
          className="p-2 rounded-full glass hover:bg-white/10 ring-1 ring-white/10 hover:ring-[color-mix(in_oklab,var(--accent)_60%,transparent)] transition duration-200 hover:scale-105"
          onClick={() => setOpen(true)}
          aria-label="Edit profile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--foreground)]"><path d="M12 20h9" stroke="currentColor"/><path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor"/></svg>
        </button>
        <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-black/60 text-[var(--foreground)] text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Edit profile</span>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative glass glow rounded-[var(--radius)] p-6 w-[min(92vw,520px)]">
            <h4 className="text-lg font-semibold mb-3">Edit profile</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-[var(--muted-foreground)]">Display Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your display name"
                    className="w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-[var(--muted-foreground)]">Username</label>
                  <input value={username ?? ''} disabled className="w-full h-10 rounded-md bg-black/20 border border-white/10 px-3 text-[var(--muted-foreground)]" />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-[var(--muted-foreground)]">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                  className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-[var(--muted-foreground)]">Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-[var(--muted-foreground)]">Website</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..."
                    className="w-full h-10 rounded-md bg-black/30 border border-white/10 px-3 outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={onSave} isLoading={saving}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


