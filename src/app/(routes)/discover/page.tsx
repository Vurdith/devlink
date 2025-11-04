"use client";
import { useState } from "react";

type ProfileType = "all" | "developers" | "clients" | "influencers" | "studios";

export default function DiscoverPage() {
  const [selectedFilter, setSelectedFilter] = useState<ProfileType>("all");

  const filters: { value: ProfileType; label: string; icon: React.ReactNode }[] = [
    {
      value: "all",
      label: "All Profiles",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "developers",
      label: "Developers",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "clients",
      label: "Clients",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      value: "influencers",
      label: "Influencers",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "studios",
      label: "Studios",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover</h1>
        <p className="text-[var(--muted-foreground)]">
          Find developers, clients, influencers, and studios in the Roblox community.
        </p>
      </div>
      
      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedFilter === filter.value
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <div className={`p-1 rounded ${
                selectedFilter === filter.value
                  ? "bg-[var(--accent)]/20"
                  : "bg-white/5"
              }`}>
                {filter.icon}
              </div>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content based on filter */}
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        <p className="mb-4">
          {selectedFilter === "all" && "Browse all profile types"}
          {selectedFilter === "developers" && "Browse developer profiles and portfolios"}
          {selectedFilter === "clients" && "Find clients looking for development services"}
          {selectedFilter === "influencers" && "Discover content creators and promotional services"}
          {selectedFilter === "studios" && "Browse studio accounts and team profiles"}
        </p>
        <p className="text-sm">Discovery features coming soon!</p>
      </div>
    </div>
  );
}
