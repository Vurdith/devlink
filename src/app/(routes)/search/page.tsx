"use client";
import { useState, useEffect, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

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
  isYou?: boolean;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const type = (searchParams.get("type") as SearchType) || "all";
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  
  const [selectedType, setSelectedType] = useState<SearchType>(type);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [hashtags, setHashtags] = useState<HashtagResult[]>([]);
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(!!query);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setSelectedType(type);
  }, [type]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const updateSearchUrl = (nextQuery: string, nextType: SearchType = selectedType) => {
    const params = new URLSearchParams();
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery) params.set("q", trimmedQuery);
    if (nextType !== "all") params.set("type", nextType);

    const nextUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    router.push(nextUrl);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchUrl(searchInput);
  };

  const handleTypeChange = (nextType: SearchType) => {
    setSelectedType(nextType);
    if (query) updateSearchUrl(query, nextType);
  };

  useEffect(() => {
    if (!query) {
      setUsers([]);
      setHashtags([]);
      setProjects([]);
      setError(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    
    const searchData = async () => {
      try {
        if (selectedType === "all" || selectedType === "profiles") {
          const usersResponse = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData.users || []);
          } else {
            throw new Error("User search failed");
          }
        } else {
          setUsers([]);
        }

        if (selectedType === "all" || selectedType === "hashtags") {
          const hashtagsResponse = await fetch(`/api/search/hashtags?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
          });
          if (hashtagsResponse.ok) {
            const hashtagsData = await hashtagsResponse.json();
            setHashtags(hashtagsData.hashtags || []);
          } else {
            throw new Error("Hashtag search failed");
          }
        } else {
          setHashtags([]);
        }

        if (selectedType === "all" || selectedType === "projects") {
          const projectsResponse = await fetch(`/api/search/projects?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
          });
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.projects || []);
          } else {
            throw new Error("Project search failed");
          }
        } else {
          setProjects([]);
        }

        setLoading(false);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Search error:", error);
        setError("Search did not finish. Check your connection and try again.");
        setLoading(false);
      }
    };

    searchData();

    return () => controller.abort();
  }, [query, selectedType, retryCount]);

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
  const filterCounts: Record<SearchType, number> = {
    all: totalResults,
    profiles: users.length,
    hashtags: hashtags.length,
    projects: projects.length,
  };
  const selectedLabel = filters.find((filter) => filter.value === selectedType)?.label ?? "results";

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
      <div className={surface("panel", "noise-overlay relative mb-5 overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(760px 220px at 15% 0%, rgba(var(--color-accent-2-rgb),0.10), transparent 62%), radial-gradient(520px 220px at 100% 20%, rgba(var(--color-accent-rgb),0.07), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Search</div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Search results</h1>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="search-query" className="sr-only">Search DevLink</label>
            <input
              id="search-query"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search handles, hashtags, or projects"
              className="min-h-11 flex-1 rounded-lg border border-white/[0.08] bg-black/20 px-3 text-sm font-medium text-white outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:ring-2 focus:ring-[rgba(var(--color-accent-2-rgb),0.18)]"
            />
            <button
              type="submit"
              className={cn("min-h-11 rounded-lg px-4 text-sm font-semibold text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]", ui.active.cyanStrong)}
            >
              Search
            </button>
          </form>
        {query ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span>Showing results for</span>
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 font-semibold text-white">{query}</span>
              {!loading && !error && (
                <span className="text-[var(--color-accent-2)]">{totalResults} result{totalResults === 1 ? "" : "s"}</span>
              )}
            </div>
        ) : null}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-5">
        <div className={surface("toolbar", "flex gap-2 overflow-x-auto p-2")}>
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleTypeChange(filter.value)}
              aria-pressed={selectedType === filter.value}
              className={cn("flex flex-shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                selectedType === filter.value
                  ? ui.active.cyanStrong
                  : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white"
              )}
            >
                <div className={`rounded-md p-1 ${
                selectedType === filter.value
                  ? "bg-[rgba(var(--color-accent-2-rgb),0.14)]"
                  : "bg-white/5"
              }`}>
                {filter.icon}
              </div>
              <span>{filter.label}</span>
              {query && !loading && !error ? (
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[11px] tabular-nums text-white/70">
                  {filterCounts[filter.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {error && !loading ? (
        <FeedbackState
          title="Search could not load"
          description={error}
          tone="danger"
          className="py-14"
          action={{
            label: "Try again",
            onClick: () => setRetryCount((count) => count + 1),
          }}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 9v4" strokeLinecap="round" />
              <path d="M12 17h.01" strokeLinecap="round" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
            </svg>
          }
        />
      ) : loading ? (
        <div className={surface("empty", "flex items-center justify-center gap-3 py-12 text-sm font-semibold text-[var(--muted-foreground)]")}>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent-2)] border-r-transparent" />
          <span>Searching</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Profile Results */}
          {(selectedType === "all" || selectedType === "profiles") && users.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Profiles</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {users.map((user) => (
                  <div key={user.id} className={surface("panelMuted", "noise-overlay group relative flex min-h-[136px] items-start gap-3 overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                    <ProfileTooltip
                      user={{
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        profile: {
                          avatarUrl: user.avatarUrl,
                          verified: user.verified,
                          profileType: user.profileType,
                          bio: user.bio,
                        },
                      }}
                      currentUserId={currentUserId}
                    >
                      <Link
                        href={`/u/${user.username}`}
                        className="relative z-10 flex min-w-0 flex-1 items-start gap-3"
                        aria-label={`View @${user.username}`}
                      >
                        <Avatar src={user.avatarUrl ?? undefined} size={44} className="border border-white/[0.10]" />
                      <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                            <span className="truncate font-semibold text-white group-hover:text-[var(--color-accent-2)]">{user.name ?? user.username}</span>
                        {user.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" className="text-[var(--accent)]">
                            <path d="M12 3l2.39 2.39L17 6l-.61 2.61L19 12l-2.61.61L15 17l-2.61-.61L12 21l-2.39-2.39L7 17l.61-2.39L5 12l2.61-.61L7 6l2.39-.61L12 3z" fill="currentColor"/>
                          </svg>
                        )}
                        {user.profileType && (
                          <ProfileTypeLabel profileType={user.profileType} variant="compact" />
                        )}
                      </div>
                          <div className="text-xs text-[var(--muted-foreground)] truncate">@{user.username}</div>
                          {user.bio && <div className="mt-2 line-clamp-2 border-l border-[rgba(var(--color-accent-2-rgb),0.28)] pl-2 text-xs leading-relaxed text-white/62">{user.bio}</div>}
                        </div>
                      </Link>
                    </ProfileTooltip>
                    {currentUserId && !user.isYou && currentUserId !== user.id ? (
                      <div className="relative z-20 pointer-events-auto">
                        <FollowButton targetUserId={user.id} initialFollowing={user.isFollowing} compact />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hashtag Results */}
          {(selectedType === "all" || selectedType === "hashtags") && hashtags.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Hashtags</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {hashtags.map((hashtag) => (
                  <div key={hashtag.tag} className={surface("panelMuted", "group relative flex items-center gap-3 p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <Link href={`/hashtag/${hashtag.tag.replace('#', '')}`} className="absolute inset-0 z-10" aria-label={`View ${hashtag.tag}`}>
                      <span className="sr-only">View {hashtag.tag}</span>
                    </Link>
                    <div className="pointer-events-none">
                      <div className={iconBox("cyan", "h-12 w-12")}>
                        <span className="text-white font-bold text-xl">#</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 relative z-10 pointer-events-none">
                      <div className="text-sm flex items-center gap-2">
                        <span className="truncate font-semibold text-white group-hover:text-[var(--color-accent-2)]">{hashtag.tag}</span>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate">
                        {hashtag.postCount} {hashtag.postCount === 1 ? 'post' : 'posts'} / {hashtag.projectCount} {hashtag.projectCount === 1 ? 'project' : 'projects'}
                      </div>
                    </div>
                    <div className="relative z-20 pointer-events-auto">
                      <Link 
                        href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                        className={cn("rounded-lg px-3 py-1 text-sm text-[var(--accent)] transition-colors", ui.control.ghost)}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Project Results */}
          {(selectedType === "all" || selectedType === "projects") && projects.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Projects</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project) => (
                  <div key={project.id} className={surface("panelMuted", "group p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-white group-hover:text-[var(--color-accent-2)]">{project.title}</div>
                        {project.description && (
                          <div className="mt-2 line-clamp-2 border-l border-[rgba(var(--color-accent-2-rgb),0.24)] pl-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{project.description}</div>
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
                        className={cn("rounded-lg px-3 py-1 text-[var(--accent)] transition-colors", ui.control.ghost)}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {!query && (
            <FeedbackState
              title="Search DevLink"
              description="Look up handles, hashtags, or project names."
              className="py-14"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              }
            />
          )}

          {query && totalResults === 0 && !loading && (
            <FeedbackState
              title={`No ${selectedType === "all" ? "results" : selectedLabel.toLowerCase()} for "${query}"`}
              description={
                selectedType === "all"
                  ? "Try a different handle, hashtag, or project name."
                  : "Switch back to all results or try a broader search term."
              }
              className="py-14"
              action={selectedType === "all" ? undefined : {
                label: "Show all results",
                onClick: () => handleTypeChange("all"),
              }}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              }
            />
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
