"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BaseModal, ModalInput, ModalTextarea, Tooltip } from "@/components/ui/BaseModal";

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
      
      // Dispatch event with name so navbar and other components update immediately
      window.dispatchEvent(new CustomEvent('devlink:profile-updated', { 
        detail: { name } 
      }));
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button variant="ghost" onClick={() => setOpen(false)} className="px-5">
        Cancel
      </Button>
      <Button onClick={onSave} isLoading={saving} className="px-6">
        Save Changes
      </Button>
    </div>
  );

  return (
    <>
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4 group z-10">
        <Tooltip content="Edit profile" side="left">
          <button
            className="p-2 rounded-full bg-[#0d0d12] hover:bg-white/10 ring-1 ring-white/10 hover:ring-purple-500/50 transition duration-200 hover:scale-105"
            onClick={() => setOpen(true)}
            aria-label="Edit profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--foreground)]">
              <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Tooltip>
      </div>
      
      <BaseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Edit Profile"
        size="lg"
        footer={footer}
        contentClassName="px-6 py-5"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalInput 
              label="Display Name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your display name"
            />
            <ModalInput 
              label="Username"
              value={username ?? ''} 
              disabled 
              className="opacity-60"
            />
          </div>
          
          <ModalTextarea 
            label="Bio"
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            rows={3}
            placeholder="Tell everyone a bit about yourself..."
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalInput 
              label="Location"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
            <ModalInput 
              label="Website"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              }
              value={website} 
              onChange={(e) => setWebsite(e.target.value)} 
              placeholder="https://yoursite.com"
            />
          </div>
        </div>
      </BaseModal>
    </>
  );
}
