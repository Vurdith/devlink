"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

async function uploadToServer(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data.url as string;
}

// Clear all profile caches in sessionStorage
function clearProfileCaches() {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('navbar-profile-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {}
}

// Dispatch profile update event so all components can update
function dispatchProfileUpdate(updates: { avatarUrl?: string; bannerUrl?: string; name?: string }) {
  if (typeof window !== 'undefined') {
    // Clear caches first
    clearProfileCaches();
    // Then dispatch the event with new data
    window.dispatchEvent(new CustomEvent('devlink:profile-updated', { detail: updates }));
  }
}

export function AvatarEditOverlay({ editable }: { editable: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  if (!editable) return null;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadToServer(file);
      
      // Save to backend (this also clears server-side cache)
      await fetch("/api/profile", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ avatarUrl: url }) 
      });
      
      // Clear client caches and dispatch event with new URL
      dispatchProfileUpdate({ avatarUrl: url });
      
      // Refresh the page content
      router.refresh();
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1.5px]"
        aria-label="Change avatar"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={saving ? "animate-pulse" : ""}>
          <path d="M4 7h3l2-2h6l2 2h3v12H4V7Z" stroke="white"/>
          <circle cx="12" cy="13" r="3.5" stroke="white"/>
        </svg>
      </button>
    </>
  );
}

export function BannerEditOverlay({ editable }: { editable: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  if (!editable) return null;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadToServer(file);
      await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bannerUrl: url }) });
      
      // Dispatch event BEFORE refresh so components update immediately
      dispatchProfileUpdate({ bannerUrl: url });
      
      router.refresh();
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px] z-10 cursor-pointer pointer-events-none group-hover:pointer-events-auto"
        aria-label="Change banner"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={saving ? "animate-pulse" : ""}>
          <path d="M4 7h3l2-2h6l2 2h3v12H4V7Z" stroke="white"/>
          <circle cx="12" cy="13" r="3.5" stroke="white"/>
        </svg>
      </button>
    </>
  );
}


