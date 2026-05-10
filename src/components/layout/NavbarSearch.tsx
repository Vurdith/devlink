"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { iconBox, menuItem, menuPanel, ui } from "@/components/ui/design-system";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";
import dynamic from "next/dynamic";

const FollowButton = dynamic(
  () => import("@/components/ui/FollowButton").then((mod) => mod.FollowButton),
  { ssr: false }
);

const ProfileTooltip = dynamic(
  () => import("@/components/profile/ProfileTooltip").then((mod) => mod.ProfileTooltip),
  { ssr: false }
);

interface UserSearchResult {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  verified: boolean;
  profileType: string | null;
  isFollowing: boolean;
  isYou: boolean;
}

interface HashtagSearchResult {
  tag: string;
  postCount: number;
  projectCount: number;
}

interface ProjectSearchResult {
  id: string;
  title: string;
  description: string;
  author: {
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface SearchResults {
  users: UserSearchResult[];
  hashtags: HashtagSearchResult[];
  projects: ProjectSearchResult[];
}

const EMPTY_RESULTS: SearchResults = { users: [], hashtags: [], projects: [] };
const MIN_QUERY_LENGTH = 2;
const MAX_PREVIEW_RESULTS = 5;

export const NavbarSearch = memo(function NavbarSearch({ currentUserId }: { currentUserId?: string }) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTerm = value.trim();
  const queryMode = useMemo(() => {
    const isHashtag = searchTerm.startsWith("#");
    const isUser = searchTerm.startsWith("@");
    const isProject = searchTerm.startsWith("!");

    return {
      isHashtag,
      isUser,
      isProject,
      isGeneral: !isHashtag && !isUser && !isProject,
      userQuery: isUser ? searchTerm.slice(1) : searchTerm,
      projectQuery: isProject ? searchTerm.slice(1) : searchTerm,
    };
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchIt() {
      if (searchTerm.length < MIN_QUERY_LENGTH) {
        setResults(EMPTY_RESULTS);
        setLoading(false);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const [users, hashtags, projects] = await Promise.all([
          queryMode.isUser || queryMode.isGeneral
            ? fetch(`/api/search/users?q=${encodeURIComponent(queryMode.userQuery)}`, { signal: controller.signal })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => (data?.users ?? []) as UserSearchResult[])
            : Promise.resolve([]),
          queryMode.isHashtag || queryMode.isGeneral
            ? fetch(`/api/search/hashtags?q=${encodeURIComponent(searchTerm)}`, { signal: controller.signal })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => (data?.hashtags ?? []) as HashtagSearchResult[])
            : Promise.resolve([]),
          queryMode.isProject || queryMode.isGeneral
            ? fetch(`/api/search/projects?q=${encodeURIComponent(queryMode.projectQuery)}`, { signal: controller.signal })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => (data?.projects ?? []) as ProjectSearchResult[])
            : Promise.resolve([]),
        ]);

        if (active) {
          setResults({ users, hashtags, projects });
          setOpen(true);
        }
      } catch (error) {
        if (active && error instanceof Error && error.name !== 'AbortError') {
          setResults(EMPTY_RESULTS);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const t = setTimeout(fetchIt, 200);
    return () => {
      active = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [queryMode, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
  }, []);

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let term = value.trim();
    
    if (term.startsWith("@")) {
      term = term.slice(1);
      if (term) { router.push(`/search?q=${encodeURIComponent(term)}&type=profiles`); closeDropdown(); return; }
    }
    if (term.startsWith("#")) {
      if (term) { router.push(`/search?q=${encodeURIComponent(term)}&type=hashtags`); closeDropdown(); return; }
    }
    if (term.startsWith("!")) {
      term = term.slice(1);
      if (term) { router.push(`/search?q=${encodeURIComponent(term)}&type=projects`); closeDropdown(); return; }
    }
    if (term) { router.push(`/search?q=${encodeURIComponent(term)}`); closeDropdown(); }
  }, [closeDropdown, router, value]);

  const visibleResults = useMemo(() => ({
    users: results.users.slice(0, MAX_PREVIEW_RESULTS),
    hashtags: results.hashtags.slice(0, MAX_PREVIEW_RESULTS),
    projects: results.projects.slice(0, MAX_PREVIEW_RESULTS),
  }), [results]);
  const hasResults = results.users.length > 0 || results.hashtags.length > 0 || results.projects.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={onSubmit} className="relative">
        <div className={cn(
          "relative flex items-center transition-all duration-150",
          focused ? "w-[min(24rem,calc(100vw-5.5rem))]" : "w-[min(20rem,calc(100vw-5.5rem))]"
        )}>
          <div className="absolute left-4 text-[var(--muted-foreground)] pointer-events-none z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <label htmlFor="navbar-search" className="sr-only">Search DevLink</label>
          <input
            id="navbar-search"
            ref={inputRef}
            type="search"
            placeholder="Search people, tags, work"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => { setFocused(true); if (searchTerm.length >= MIN_QUERY_LENGTH) setOpen(true); }}
            onBlur={() => !open && setFocused(false)}
            className={cn(
              "w-full h-11 rounded-xl bg-white/5 border pl-11 pr-16 text-sm outline-none placeholder:text-[var(--muted-foreground)] text-white transition-all duration-150",
              focused 
                ? ui.active.cyan
                : "border-white/[0.10] hover:border-white/[0.18]"
            )}
            aria-autocomplete="list"
            aria-expanded={open && hasResults}
            aria-controls={open && hasResults ? "search-results" : undefined}
            role="combobox"
          />
          
          <div className="absolute right-3 flex items-center gap-1 text-[var(--muted-foreground)] pointer-events-none">
            <kbd className="hidden h-5 items-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.045] px-1.5 text-[10px] font-medium md:inline-flex">
              Ctrl K
            </kbd>
          </div>
        </div>
      </form>

      {/* Results dropdown - CSS only animation */}
      {open && (hasResults || loading || searchTerm.length >= MIN_QUERY_LENGTH) && (
        <div 
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className={cn("absolute right-0 z-50 mt-2 max-h-[70vh] w-[min(28rem,calc(100vw-1rem))] overflow-y-auto p-2 animate-fade-in sm:left-0 sm:right-auto", menuPanel())}
        >
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && !hasResults && searchTerm.length >= MIN_QUERY_LENGTH && (
            <div className="py-8 text-center">
                <div className={iconBox("muted", "mx-auto mb-2 h-12 w-12 rounded-xl")}>
                <svg className="w-6 h-6 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Nothing matched</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Try a username, tag, or portfolio project.</p>
            </div>
          )}

          {/* Hashtag Suggestions */}
          {visibleResults.hashtags.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Tags
              </div>
              {visibleResults.hashtags.map((hashtag) => (
                <Link
                  key={hashtag.tag}
                  href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                  onClick={closeDropdown}
                  className={menuItem()}
                >
                  <div className={iconBox("cyan", "h-10 w-10")}>
                    <span className="text-lg font-bold">#</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{hashtag.tag}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {hashtag.postCount} {hashtag.postCount === 1 ? 'post' : 'posts'} / {hashtag.projectCount} {hashtag.projectCount === 1 ? 'project' : 'projects'}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* User Suggestions */}
          {visibleResults.users.length > 0 && (
            <div className="mb-2">
              {visibleResults.hashtags.length > 0 && <div className="my-2 h-px bg-white/[0.08]" />}
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                People
              </div>
              {visibleResults.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  onClick={closeDropdown}
                  className={menuItem()}
                >
                  <ProfileTooltip
                    user={{
                      id: user.id,
                      username: user.username,
                      name: user.name,
                      profile: {
                        avatarUrl: user.avatarUrl,
                        profileType: user.profileType,
                        verified: user.verified,
                      },
                    }}
                    currentUserId={currentUserId}
                  >
                    <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
                      <Avatar src={user.avatarUrl ?? undefined} size={40} />
                    </div>
                  </ProfileTooltip>
                  <div className="flex-1 min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-semibold text-white">
                      <span className="truncate">{user.name ?? user.username}</span>
                      {user.verified && (
                        <svg className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {user.isYou && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">You</span>
                      )}
                      {user.profileType && (
                        <ProfileTypeLabel profileType={user.profileType} variant="compact" />
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">@{user.username}</div>
                  </div>
                  {!user.isYou && (
                    <div onClick={(e) => e.preventDefault()} className="relative z-10">
                      <FollowButton targetUserId={user.id} initialFollowing={user.isFollowing} compact />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Project Suggestions */}
          {visibleResults.projects.length > 0 && (
            <div>
              {(visibleResults.users.length > 0 || visibleResults.hashtags.length > 0) && <div className="my-2 h-px bg-white/[0.08]" />}
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Work
              </div>
              {visibleResults.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  onClick={closeDropdown}
                  className={menuItem()}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{project.title}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      by {project.author.name || project.author.username}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* Search tip */}
          {hasResults && (
            <div className="mt-2 border-t border-white/[0.08] pt-2">
              <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Press <kbd className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">Enter</kbd> to search DevLink
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
