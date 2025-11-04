"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PROFILE_TYPE_CONFIG, getProfileTypeConfig } from "@/lib/profile-types";

export function ProfileTypeCard() {
  const [type, setType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.profile?.profileType) setType(data.profile.profileType);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type) return;
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileType: type }),
      });
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl p-8 shadow-lg">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Profile Type</h2>
            <p className="text-sm text-gray-400">Choose how you want to use DevLink</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <TypeCard label="Developer" value="DEVELOPER" current={type} setType={setType} desc="Showcase a portfolio and projects." />
          <TypeCard label="Client" value="CLIENT" current={type} setType={setType} desc="Hire talent and manage postings." />
          <TypeCard label="Studio" value="STUDIO" current={type} setType={setType} desc="Team profile with members and work." />
          <TypeCard label="Influencer" value="INFLUENCER" current={type} setType={setType} desc="Offer promotional services." />
          <TypeCard label="Investor" value="INVESTOR" current={type} setType={setType} desc="Invest in projects and startups." />
          <TypeCard label="Guest" value="GUEST" current={type} setType={setType} desc="Browse and explore the platform." />
        </div>
        
        <Button 
          type="submit" 
          isLoading={saving} 
          disabled={!type}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
}

function TypeCard({ label, value, current, setType, desc }: { label: string; value: string; current: string | null; setType: (v: string) => void; desc: string }) {
  const active = current === value;
  const config = getProfileTypeConfig(value);

  // Get colors for the card based on profile type
  const getCardColors = (profileType: string) => {
    const config = getProfileTypeConfig(profileType);
    const colorMap: { [key: string]: string } = {
      'text-blue-400': 'bg-blue-500/10 border-blue-500/50',
      'text-green-400': 'bg-green-500/10 border-green-500/50',
      'text-purple-400': 'bg-purple-500/10 border-purple-500/50',
      'text-red-400': 'bg-red-500/10 border-red-500/50',
      'text-yellow-400': 'bg-yellow-500/10 border-yellow-500/50',
      'text-gray-400': 'bg-gray-500/10 border-gray-500/50',
    };
    return colorMap[config.color] || 'bg-gray-500/10 border-gray-500/50';
  };

  // Get colors for the checkbox
  const getCheckboxColors = (profileType: string) => {
    const config = getProfileTypeConfig(profileType);
    const colorMap: { [key: string]: string } = {
      'text-blue-400': 'bg-blue-500 border-blue-500',
      'text-green-400': 'bg-green-500 border-green-500',
      'text-purple-400': 'bg-purple-500 border-purple-500',
      'text-red-400': 'bg-red-500 border-red-500',
      'text-yellow-400': 'bg-yellow-500 border-yellow-500',
      'text-gray-400': 'bg-gray-500 border-gray-500',
    };
    return colorMap[config.color] || 'bg-gray-500 border-gray-500';
  };

  return (
    <button 
      type="button" 
      onClick={() => setType(value)}
      className={`text-left p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
        active 
          ? `${getCardColors(value)} shadow-lg` 
          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white mb-1">{label}</div>
          <div className="text-sm text-gray-400">{desc}</div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          active 
            ? `${getCheckboxColors(value)} shadow-lg` 
            : "border-gray-500 bg-gray-800/50 hover:border-gray-400"
        }`}>
          {active && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M20 7 10 17l-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}


