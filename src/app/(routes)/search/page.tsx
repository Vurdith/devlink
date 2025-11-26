"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { useSearchParams } from "next/navigation";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";

type SearchType = "all" | "profiles" | "hashtags" | "projects";

interface UserSearchResult {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  verified: boolean;
  profileType: string | null;
  bio: string | null;
  isFollowing: boolean;
}

interface HashtagResult {
  tag: string;
  postCount: number;
  projectCount: number;
}

interface ProjectResult {
  id: string;
  title: string;
  description: string | null;
  author: {
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const type = (searchParams.get("type") as SearchType) || "all";
  
  const [selectedType, setSelectedType] = useState<SearchType>(type);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [hashtags, setHashtags] = useState<HashtagResult[]>([]);
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(!!query);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Real API calls for search functionality
  useEffect(() => {
    if (!query) return;
    
    setLoading(true);
    
    const searchData = async () => {
      try {
        // Search users
        if (selectedType === "all" || selectedType === "profiles") {
          const usersResponse = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData.users || []);
          }
        } else {
          setUsers([]);
        }

        // Search hashtags (always include in main search)
        if (selectedType === "all" || selectedType === "hashtags") {
          const hashtagsResponse = await fetch(`/api/search/hashtags?q=${encodeURIComponent(query)}`);
          if (hashtagsResponse.ok) {
            const hashtagsData = await hashtagsResponse.json();
            setHashtags(hashtagsData.hashtags || []);
          }
        } else {
          setHashtags([]);
        }


        // Search projects
        if (selectedType === "all" || selectedType === "projects") {
          const projectsResponse = await fetch(`/api/search/projects?q=${encodeURIComponent(query)}`);
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.projects || []);
          }
        } else {
          setProjects([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Search error:", error);
        setLoading(false);
      }
    };

    searchData();
  }, [query, selectedType]);

  const filters: { value: SearchType; label: string; icon: React.ReactNode }[] = [
    {
      value: "all",
      label: "All Results",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "profiles",
      label: "Profiles",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      value: "hashtags",
      label: "Hashtags",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "projects",
      label: "Projects",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const totalResults = users.length + hashtags.length + projects.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        {query && (
          <div className="glass rounded-[var(--radius)] p-4 mb-6">
            <div className="text-sm text-[var(--muted-foreground)]">
              Search results for: <span className="text-[var(--foreground)] font-medium">{query}</span>
              {totalResults > 0 && (
                <span className="ml-2 text-[var(--accent)]">({totalResults} results)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedType === filter.value
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                  : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <div className={`p-1 rounded ${
                selectedType === filter.value
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

      {loading ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-r-transparent"></div>
          <p className="mt-2">Searching...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Profile Results */}
          {(selectedType === "all" || selectedType === "profiles") && users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-[var(--accent)]">Profiles</h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="group relative glass rounded-[var(--radius)] p-3 flex items-center gap-3">
                    <div className="absolute inset-0 rounded-[var(--radius)] pointer-events-none transition-colors group-hover:bg-white/10" />
                    <Link href={`/u/${user.username}`} className="absolute inset-0 z-10" aria-label={`View @${user.username}`}>
                      <span className="sr-only">View @{user.username}</span>
                    </Link>
                    <div className="pointer-events-none">
                      <Avatar src={user.avatarUrl ?? undefined} size={40} />
                    </div>
                    <div className="min-w-0 flex-1 relative z-10 pointer-events-none">
                      <div className="text-sm flex items-center gap-2">
                        <span className="font-medium truncate">{user.name ?? user.username}</span>
                        {user.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" className="text-[var(--accent)]">
                            <path d="M12 3l2.39 2.39L17 6l-.61 2.61L19 12l-2.61.61L15 17l-2.61-.61L12 21l-2.39-2.39L7 17l.61-2.39L5 12l2.61-.61L7 6l2.39-.61L12 3z" fill="currentColor"/>
                          </svg>
                        )}
                        {user.profileType && (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${getProfileTypeConfig(user.profileType).bgColor} ${getProfileTypeConfig(user.profileType).color}`}>
                            <ProfileTypeIcon profileType={user.profileType} size={10} />
                            {getProfileTypeConfig(user.profileType).label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate">@{user.username}</div>
                      {user.bio && <div className="mt-0.5 text-xs text-[var(--muted-foreground)] truncate">{user.bio}</div>}
                    </div>
                    <div className="relative z-20 pointer-events-auto">
                      <FollowButton targetUserId={user.id} initialFollowing={user.isFollowing} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Results */}
          {(selectedType === "all" || selectedType === "hashtags") && hashtags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-[var(--accent)]">Hashtags</h2>
              <div className="space-y-2">
                {hashtags.map((hashtag) => (
                  <div key={hashtag.tag} className="group relative glass rounded-[var(--radius)] p-3 flex items-center gap-3">
                    <div className="absolute inset-0 rounded-[var(--radius)] pointer-events-none transition-colors group-hover:bg-white/10" />
                    <Link href={`/hashtag/${hashtag.tag.replace('#', '')}`} className="absolute inset-0 z-10" aria-label={`View ${hashtag.tag}`}>
                      <span className="sr-only">View {hashtag.tag}</span>
                    </Link>
                    <div className="pointer-events-none">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">#</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 relative z-10 pointer-events-none">
                      <div className="text-sm flex items-center gap-2">
                        <span className="font-medium truncate text-[var(--accent)]">{hashtag.tag}</span>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate">
                        {hashtag.postCount} {hashtag.postCount === 1 ? 'post' : 'posts'} • {hashtag.projectCount} {hashtag.projectCount === 1 ? 'project' : 'projects'}
                      </div>
                    </div>
                    <div className="relative z-20 pointer-events-auto">
                      <Link 
                        href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                        className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Results */}
          {(selectedType === "all" || selectedType === "projects") && projects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-[var(--accent)]">Projects</h2>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="glass rounded-[var(--radius)] p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="text-lg font-medium">{project.title}</div>
                        {project.description && (
                          <div className="text-sm text-[var(--muted-foreground)] mt-1">{project.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar src={project.author.avatarUrl ?? undefined} size={24} />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            by @{project.author.username}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/projects/${project.id}`}
                        className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!query && (
            <div className="text-center py-12 text-[var(--muted-foreground)]">
              <p>Type a search term above to get started.</p>
              <p className="text-sm mt-1">Search for handles, hashtags, or project names.</p>
            </div>
          )}

          {query && totalResults === 0 && !loading && (
            <div className="text-center py-12 text-[var(--muted-foreground)]">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
