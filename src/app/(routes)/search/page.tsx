"use client";
import { useState, useEffect, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { ToneBadge } from "@/components/ui/DataDisplay";
import { FollowButton } from "@/components/ui/FollowButton";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { AlertTriangle, ArrowRight, CheckCircle2, FolderKanban, Hash, Search, Users } from "lucide-react";

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

function formatCount(count: number) {
  return new Intl.NumberFormat("en", { notation: count > 999 ? "compact" : "standard" }).format(count);
}

function queryInText(text: string | null | undefined, query: string) {
  return Boolean(text?.toLowerCase().includes(query.toLowerCase()));
}

function getProfileMatchLabel(user: UserSearchResult, query: string) {
  if (queryInText(user.bio, query)) return "bio";
  if (queryInText(user.name, query)) return "display name";
  if (queryInText(user.username, query)) return null;
  return null;
}

function getProjectMatchLabel(project: ProjectResult, query: string) {
  if (queryInText(project.description, query)) return "description";
  if (queryInText(project.author.username, query) || queryInText(project.author.name, query)) return "creator";
  if (queryInText(project.title, query)) return null;
  return null;
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
        const encodedQuery = encodeURIComponent(query);
        const shouldFetchUsers = selectedType === "all" || selectedType === "profiles";
        const shouldFetchHashtags = selectedType === "all" || selectedType === "hashtags";
        const shouldFetchProjects = selectedType === "all" || selectedType === "projects";

        const [usersData, hashtagsData, projectsData] = await Promise.all([
          shouldFetchUsers
            ? fetch(`/api/search/users?q=${encodedQuery}`, { signal: controller.signal }).then(async (response) => {
                if (!response.ok) throw new Error("User search failed");
                return response.json();
              })
            : Promise.resolve({ users: [] }),
          shouldFetchHashtags
            ? fetch(`/api/search/hashtags?q=${encodedQuery}`, { signal: controller.signal }).then(async (response) => {
                if (!response.ok) throw new Error("Hashtag search failed");
                return response.json();
              })
            : Promise.resolve({ hashtags: [] }),
          shouldFetchProjects
            ? fetch(`/api/search/projects?q=${encodedQuery}`, { signal: controller.signal }).then(async (response) => {
                if (!response.ok) throw new Error("Project search failed");
                return response.json();
              })
            : Promise.resolve({ projects: [] }),
        ]);

        setUsers(usersData.users || []);
        setHashtags(hashtagsData.hashtags || []);
        setProjects(projectsData.projects || []);

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
      label: "All",
      icon: <Search className="h-4 w-4" aria-hidden="true" />,
    },
    {
      value: "profiles",
      label: "Profiles",
      icon: <Users className="h-4 w-4" aria-hidden="true" />,
    },
    {
      value: "hashtags",
      label: "Hashtags",
      icon: <Hash className="h-4 w-4" aria-hidden="true" />,
    },
    {
      value: "projects",
      label: "Projects",
      icon: <FolderKanban className="h-4 w-4" aria-hidden="true" />,
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
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
      <div className={surface("panel", "noise-overlay relative mb-5 overflow-hidden p-4 sm:p-6")}>
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
          <h1 className="max-w-3xl font-[var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {query ? `Results for "${query}"` : "Search DevLink"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            Find profiles, tags, and portfolio work without leaving the current flow.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label htmlFor="search-query" className="sr-only">Search DevLink</label>
            <input
              id="search-query"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Handle, hashtag, skill, or project"
              className={cn(ui.control.field, "min-h-12 bg-black/20 text-sm font-medium")}
            />
            <Button
              type="submit"
              variant="glow"
              size="md"
              className="min-h-12"
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            >
              Search
            </Button>
          </form>
        {query ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)] sm:text-sm">
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 font-semibold text-white">{query}</span>
              {!loading && !error && (
                <span className="text-[var(--color-accent-2)]">{formatCount(totalResults)} found</span>
              )}
            </div>
        ) : null}
        </div>
      </div>

      <div className="mb-5">
        <div className={surface("toolbar", "grid grid-flow-col auto-cols-max gap-2 overflow-x-auto p-2 md:grid-flow-row md:grid-cols-4")}>
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleTypeChange(filter.value)}
              aria-pressed={selectedType === filter.value}
              className={cn("flex min-w-36 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] md:min-w-0",
                selectedType === filter.value
                  ? ui.active.cyanStrong
                  : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white"
              )}
            >
                <div className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-md ${
                selectedType === filter.value
                  ? "bg-[rgba(var(--color-accent-2-rgb),0.14)]"
                  : "bg-white/5"
              }`}>
                {filter.icon}
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{filter.label}</span>
              </span>
              {query && !loading && !error ? (
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[11px] tabular-nums text-white/70">
                  {formatCount(filterCounts[filter.value])}
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
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          }
        />
      ) : loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className={surface("panelMuted", "animate-pulse p-4")}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 h-4 w-44 max-w-full rounded bg-white/10" />
                  <div className="h-3 w-72 max-w-full rounded bg-white/10" />
                </div>
                <div className="hidden h-8 w-16 rounded bg-white/10 sm:block" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Profile Results */}
          {(selectedType === "all" || selectedType === "profiles") && users.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="font-[var(--font-space-grotesk)] text-sm font-semibold text-white">Profiles</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
                <span className="text-xs text-[var(--muted-foreground)]">{formatCount(users.length)}</span>
              </div>
              <div className="space-y-2">
                {users.map((user) => {
                  const matchLabel = getProfileMatchLabel(user, query);
                  return (
                  <div key={user.id} className={surface("panelMuted", "group relative flex min-h-[120px] items-start gap-3 overflow-hidden p-4 transition-colors duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
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
                        className="relative z-10 flex min-w-0 flex-1 items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]"
                        aria-label={`View @${user.username}`}
                      >
                        <Avatar src={user.avatarUrl ?? undefined} size={48} className="border border-white/[0.10]" />
                      <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                            <span className="truncate font-semibold text-white group-hover:text-[var(--color-accent-2)]">{user.name ?? user.username}</span>
                        {user.verified && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-accent-2)]" aria-label="Verified" />}
                      </div>
                          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                            <span className="truncate">@{user.username}</span>
                            {user.profileType && (
                              <ProfileTypeLabel profileType={user.profileType} variant="compact" />
                            )}
                          </div>
                          <div className="mt-2 min-w-0">
                            {matchLabel ? (
                              <p className="mb-1 text-[11px] font-semibold text-white/42">Matched {matchLabel}</p>
                            ) : null}
                            {user.bio ? (
                              <p className="line-clamp-2 border-l border-[rgba(var(--color-accent-2-rgb),0.24)] pl-3 text-xs leading-relaxed text-white/62">{user.bio}</p>
                            ) : (
                              <p className="text-xs text-white/35">Bio not published</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </ProfileTooltip>
                    {currentUserId && !user.isYou && currentUserId !== user.id ? (
                      <div className="relative z-20 pointer-events-auto">
                        <FollowButton targetUserId={user.id} initialFollowing={user.isFollowing} compact />
                      </div>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Hashtag Results */}
          {(selectedType === "all" || selectedType === "hashtags") && hashtags.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="font-[var(--font-space-grotesk)] text-sm font-semibold text-white">Hashtags</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
                <span className="text-xs text-[var(--muted-foreground)]">{formatCount(hashtags.length)}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {hashtags.map((hashtag) => (
                  <div key={hashtag.tag} className={surface("panelMuted", "group relative flex min-h-[92px] items-center gap-3 p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <Link href={`/hashtag/${hashtag.tag.replace('#', '')}`} className="absolute inset-0 z-10" aria-label={`Open ${hashtag.tag}`}>
                      <span className="sr-only">Open {hashtag.tag}</span>
                    </Link>
                    <div className="pointer-events-none">
                      <div className={iconBox("cyan", "h-12 w-12")}>
                        <Hash className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 relative z-10 pointer-events-none">
                      <div className="text-sm flex items-center gap-2">
                        <span className="truncate font-semibold text-white group-hover:text-[var(--color-accent-2)]">{hashtag.tag}</span>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate">
                        {formatCount(hashtag.postCount)} {hashtag.postCount === 1 ? 'post' : 'posts'} / {formatCount(hashtag.projectCount)} {hashtag.projectCount === 1 ? 'project' : 'projects'}
                      </div>
                    </div>
                    <div className="relative z-20 pointer-events-auto hidden sm:block">
                      <ActionLink
                        href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                        variant="ghost"
                        size="sm"
                        rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                      >
                        Open
                      </ActionLink>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Project Results */}
          {(selectedType === "all" || selectedType === "projects") && projects.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="font-[var(--font-space-grotesk)] text-sm font-semibold text-white">Projects</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
                <span className="text-xs text-[var(--muted-foreground)]">{formatCount(projects.length)}</span>
              </div>
              <div className="space-y-2">
                {projects.map((project) => {
                  const matchLabel = getProjectMatchLabel(project, query);
                  return (
                  <div key={project.id} className={surface("panelMuted", "group p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className={iconBox("muted", "hidden h-12 w-12 flex-shrink-0 sm:flex")}>
                        <FolderKanban className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-semibold text-white group-hover:text-[var(--color-accent-2)]">{project.title}</div>
                          {matchLabel ? (
                            <ToneBadge tone="muted" className="text-[11px]">Matched {matchLabel}</ToneBadge>
                          ) : null}
                        </div>
                        {project.description && (
                          <div className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{project.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar src={project.author.avatarUrl ?? undefined} size={24} />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            by @{project.author.username}
                          </span>
                        </div>
                      </div>
                      <ActionLink
                        href={`/projects/${project.id}`}
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                      >
                        Open
                      </ActionLink>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* No Results */}
          {!query && (
            <FeedbackState
              title="Start with a handle, tag, or project"
              description="Try a username, Roblox skill, or portfolio title."
              className="py-14"
              icon={
                <Search className="h-5 w-5" aria-hidden="true" />
              }
            />
          )}

          {query && totalResults === 0 && !loading && (
            <FeedbackState
              title={`No ${selectedType === "all" ? "results" : selectedLabel.toLowerCase()} for "${query}"`}
              description={
                selectedType === "all"
                  ? "Try fewer words, remove punctuation, or search a related Roblox skill."
                  : "Switch back to all results or try a broader search term."
              }
              className="py-14"
              action={selectedType === "all" ? undefined : {
                label: "Show all results",
                onClick: () => handleTypeChange("all"),
              }}
              icon={
                <Search className="h-5 w-5" aria-hidden="true" />
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
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <div className={surface("panel", "mb-4 p-4 sm:p-6")}>
            <div className="skeleton mb-3 h-4 w-24 rounded-lg" />
            <div className="skeleton h-8 w-80 max-w-full rounded-lg" />
            <div className="skeleton mt-4 h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className={surface("panelMuted", "p-4")}>
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="skeleton mb-2 h-4 w-44 max-w-full rounded" />
                    <div className="skeleton h-3 w-72 max-w-full rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
