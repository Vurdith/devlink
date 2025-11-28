"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const profileTypes = [
  { 
    value: "DEVELOPER", 
    label: "Developer", 
    description: "Showcase portfolio and projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/10"
  },
  { 
    value: "CLIENT", 
    label: "Client", 
    description: "Hire talent and post jobs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 7h-4V3H8v4H4v14h16V7zM8 21V7h8v14H8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-emerald-500 to-green-500",
    borderColor: "border-emerald-500/50",
    bgColor: "bg-emerald-500/10"
  },
  { 
    value: "STUDIO", 
    label: "Studio", 
    description: "Team profile with members",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-violet-500 to-purple-500",
    borderColor: "border-violet-500/50",
    bgColor: "bg-violet-500/10"
  },
  { 
    value: "INFLUENCER", 
    label: "Influencer", 
    description: "Promote and collaborate",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-rose-500 to-pink-500",
    borderColor: "border-rose-500/50",
    bgColor: "bg-rose-500/10"
  },
  { 
    value: "INVESTOR", 
    label: "Investor", 
    description: "Fund projects and startups",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: "from-amber-500 to-yellow-500",
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-500/10"
  },
  { 
    value: "GUEST", 
    label: "Guest", 
    description: "Browse and explore",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    gradient: "from-slate-500 to-gray-500",
    borderColor: "border-slate-500/50",
    bgColor: "bg-slate-500/10"
  },
];

export function ProfileTypeCard() {
  const [type, setType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.profile?.profileType) setType(data.profile.profileType);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileType: type }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-6 border border-purple-500/20 bg-purple-500/5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Profile Type</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Choose how you want to use DevLink</p>
        </div>
      </div>
      
      <form onSubmit={onSubmit}>
        {/* Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {isLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/10" />
                <div className="w-10 h-10 rounded-lg bg-white/10 mb-3" />
                <div className="h-5 w-20 bg-white/10 rounded mb-2" />
                <div className="h-4 w-32 bg-white/10 rounded" />
              </div>
            ))
          ) : profileTypes.map((profileType, index) => {
            const isActive = type === profileType.value;
            
            return (
              <button
                key={profileType.value}
                type="button"
                onClick={() => setType(profileType.value)}
                className={cn(
                  "relative p-4 rounded-xl border text-left transition-all group animate-slide-up active:scale-98",
                  isActive 
                    ? `${profileType.bgColor} ${profileType.borderColor}` 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Selection indicator */}
                <div className={cn(
                  "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isActive 
                    ? `bg-gradient-to-br ${profileType.gradient} border-transparent` 
                    : "border-white/20"
                )}>
                  {isActive && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white animate-pop-in">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all",
                  isActive 
                    ? `bg-gradient-to-br ${profileType.gradient} text-white shadow-lg` 
                    : "bg-white/10 text-[var(--muted-foreground)] group-hover:bg-white/15"
                )}>
                  {profileType.icon}
                </div>
                
                {/* Text */}
                <div className="font-medium text-white mb-1">{profileType.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{profileType.description}</div>
              </button>
              );
            }))}
        </div>
        
        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <Button 
            type="submit" 
            isLoading={saving} 
            disabled={!type}
            variant="gradient"
          >
            Save Changes
          </Button>
          
          {saved && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved successfully
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
