"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [bio, setBio] = useState(initialBio ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [website, setWebsite] = useState(initialWebsite ?? "");
  const [name, setName] = useState(initialName ?? "");
  const [saving, setSaving] = useState(false);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d1117] via-[#0a0e14] to-[#080b10] border border-purple-500/30 shadow-2xl shadow-purple-500/20 animate-pop-in">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h4 className="text-lg font-semibold text-white">Edit Profile</h4>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[var(--muted-foreground)]">Display Name</label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your display name"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-[var(--muted-foreground)]/50" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[var(--muted-foreground)]">Username</label>
                <input 
                  value={username ?? ''} 
                  disabled 
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-[var(--muted-foreground)] cursor-not-allowed opacity-60" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--muted-foreground)]">Bio</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3}
                placeholder="Tell everyone a bit about yourself..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none placeholder:text-[var(--muted-foreground)]/50" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                  </span>
                </label>
                <input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-[var(--muted-foreground)]/50" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </span>
                </label>
                <input 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)} 
                  placeholder="https://yoursite.com"
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-[var(--muted-foreground)]/50" 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          <Button variant="ghost" onClick={() => setOpen(false)} className="px-5">
            Cancel
          </Button>
          <Button onClick={onSave} isLoading={saving} className="px-6">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="absolute right-2 top-2 md:top-3 group z-10">
        <button
          className="p-2 rounded-full bg-[#0d0d12] hover:bg-white/10 ring-1 ring-white/10 hover:ring-[color-mix(in_oklab,var(--accent)_60%,transparent)] transition duration-200 hover:scale-105"
          onClick={() => setOpen(true)}
          aria-label="Edit profile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--foreground)]">
            <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-black/80 text-[var(--foreground)] text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none border border-white/10">
          Edit profile
        </span>
      </div>
      
      {/* Portal modal to document.body to escape any overflow constraints */}
      {mounted && open && createPortal(modalContent, document.body)}
    </>
  );
}


