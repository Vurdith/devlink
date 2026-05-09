"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/design-system";

async function uploadToServer(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data.url as string;
}

function clearProfileCaches() {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('navbar-profile-') || key.startsWith('profile:') || key.startsWith('user:')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {}
}

function dispatchProfileUpdate(updates: { avatarUrl?: string; bannerUrl?: string; name?: string }) {
  if (typeof window !== 'undefined') {
    clearProfileCaches();
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
    
    const localPreviewUrl = URL.createObjectURL(file);
    dispatchProfileUpdate({ avatarUrl: localPreviewUrl });
    
    try {
      const url = await uploadToServer(file);
      
      dispatchProfileUpdate({ avatarUrl: url });
      
      fetch("/api/profile", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ avatarUrl: url }) 
      }).then(() => {
        router.refresh();
      }).catch(console.error);
      
    } catch (error) {
      console.error('Upload failed:', error);
      dispatchProfileUpdate({ avatarUrl: undefined });
      router.refresh();
    } finally {
      setSaving(false);
      URL.revokeObjectURL(localPreviewUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center rounded-full border border-transparent bg-transparent opacity-0 transition-all hover:border-[rgba(var(--color-accent-2-rgb),0.32)] hover:bg-[rgba(5,8,12,0.42)] group-hover:opacity-100"
        aria-label="Change avatar"
      >
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ui.control.icon, saving && "animate-pulse")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h3l2-2h6l2 2h3v12H4V7Z" stroke="currentColor"/>
            <circle cx="12" cy="13" r="3.5" stroke="currentColor"/>
          </svg>
        </span>
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
    
    const localPreviewUrl = URL.createObjectURL(file);
    dispatchProfileUpdate({ bannerUrl: localPreviewUrl });
    
    try {
      const url = await uploadToServer(file);
      
      dispatchProfileUpdate({ bannerUrl: url });
      
      fetch("/api/profile", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ bannerUrl: url }) 
      }).then(() => {
        router.refresh();
      }).catch(console.error);
      
    } catch (error) {
      console.error('Upload failed:', error);
      dispatchProfileUpdate({ bannerUrl: undefined });
      router.refresh();
    } finally {
      setSaving(false);
      URL.revokeObjectURL(localPreviewUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center border border-transparent bg-transparent opacity-0 transition-all hover:border-[rgba(var(--color-accent-2-rgb),0.28)] hover:bg-[rgba(5,8,12,0.38)] group-hover:pointer-events-auto group-hover:opacity-100 pointer-events-none"
        aria-label="Change banner"
      >
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg", ui.control.icon, saving && "animate-pulse")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h3l2-2h6l2 2h3v12H4V7Z" stroke="currentColor"/>
            <circle cx="12" cy="13" r="3.5" stroke="currentColor"/>
          </svg>
        </span>
      </button>
    </>
  );
}


