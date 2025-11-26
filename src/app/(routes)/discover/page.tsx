"use client";
import { useState, useEffect } from "react";
import { PROFILE_TYPE_CONFIG } from "@/lib/profile-types.tsx";
import Link from "next/link";
import Image from "next/image";

type ProfileType = "all" | "DEVELOPER" | "CLIENT" | "INFLUENCER" | "STUDIO" | "INVESTOR";

interface User {
  id: string;
  username: string;
  name: string | null;
  profile: {
    avatarUrl: string | null;
    bannerUrl: string | null;
    profileType: string;
    verified: boolean;
    bio: string | null;
  } | null;
  _count: {
    followers: number;
    following: number;
  };
}

export default function DiscoverPage() {
  const [selectedFilter, setSelectedFilter] = useState<ProfileType>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: { value: ProfileType; label: string; icon: string; color: string; bgColor: string }[] = [
    {
      value: "all",
      label: "All Profiles",
      icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
      color: "text-white",
      bgColor: "bg-white/20"
    },
    {
      value: "DEVELOPER",
      label: PROFILE_TYPE_CONFIG.DEVELOPER.label + "s",
      icon: PROFILE_TYPE_CONFIG.DEVELOPER.icon,
      color: PROFILE_TYPE_CONFIG.DEVELOPER.color,
      bgColor: PROFILE_TYPE_CONFIG.DEVELOPER.bgColor
    },
    {
      value: "CLIENT",
      label: PROFILE_TYPE_CONFIG.CLIENT.label + "s",
      icon: PROFILE_TYPE_CONFIG.CLIENT.icon,
      color: PROFILE_TYPE_CONFIG.CLIENT.color,
      bgColor: PROFILE_TYPE_CONFIG.CLIENT.bgColor
    },
    {
      value: "STUDIO",
      label: PROFILE_TYPE_CONFIG.STUDIO.label + "s",
      icon: PROFILE_TYPE_CONFIG.STUDIO.icon,
      color: PROFILE_TYPE_CONFIG.STUDIO.color,
      bgColor: PROFILE_TYPE_CONFIG.STUDIO.bgColor
    },
    {
      value: "INFLUENCER",
      label: PROFILE_TYPE_CONFIG.INFLUENCER.label + "s",
      icon: PROFILE_TYPE_CONFIG.INFLUENCER.icon,
      color: PROFILE_TYPE_CONFIG.INFLUENCER.color,
      bgColor: PROFILE_TYPE_CONFIG.INFLUENCER.bgColor
    },
    {
      value: "INVESTOR",
      label: PROFILE_TYPE_CONFIG.INVESTOR.label + "s",
      icon: PROFILE_TYPE_CONFIG.INVESTOR.icon,
      color: PROFILE_TYPE_CONFIG.INVESTOR.color,
      bgColor: PROFILE_TYPE_CONFIG.INVESTOR.bgColor
    }
  ];

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const url = selectedFilter === "all" 
          ? "/api/discover" 
          : `/api/discover?type=${selectedFilter}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [selectedFilter]);

  const getProfileConfig = (type: string) => {
    return PROFILE_TYPE_CONFIG[type as keyof typeof PROFILE_TYPE_CONFIG] || PROFILE_TYPE_CONFIG.GUEST;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover</h1>
        <p className="text-[var(--muted-foreground)]">
          Find developers, clients, studios, influencers, and investors in the Roblox community.
        </p>
      </div>
      
      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                selectedFilter === filter.value
                  ? `${filter.bgColor} ${filter.color} border border-current/30 shadow-lg`
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                selectedFilter === filter.value
                  ? "bg-current/20"
                  : "bg-white/10"
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d={filter.icon} />
                </svg>
              </div>
              <span className="font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/10" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-white/10 rounded mb-2" />
              <div className="h-4 w-3/4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const config = getProfileConfig(user.profile?.profileType || "GUEST");
            return (
              <Link 
                key={user.id} 
                href={`/u/${user.username}`}
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] border border-white/10 hover:border-white/20"
              >
                {/* Banner */}
                {user.profile?.bannerUrl && (
                  <div className="h-20 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
                    <Image
                      src={user.profile.bannerUrl}
                      alt=""
                      width={400}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* User Info */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {user.profile?.avatarUrl ? (
                      <Image
                        src={user.profile.avatarUrl}
                        alt={user.username}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white/20">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Verified Badge */}
                    {user.profile?.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[var(--background)]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {user.name || user.username}
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-2">@{user.username}</p>
                    
                    {/* Profile Type Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.color}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d={config.icon} />
                      </svg>
                      {config.label}
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                {user.profile?.bio && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-4 line-clamp-2">
                    {user.profile.bio}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    <span className="font-semibold text-white">{user._count.followers}</span> followers
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    <span className="font-semibold text-white">{user._count.following}</span> following
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted-foreground)]">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
          <p className="text-[var(--muted-foreground)]">
            {selectedFilter === "all" 
              ? "No users have joined yet. Be the first!"
              : `No ${filters.find(f => f.value === selectedFilter)?.label.toLowerCase()} have joined yet.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
