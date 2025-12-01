"use client";

import { useEffect, useRef, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/lib/profile-types";

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

export const NavbarSearch = memo(function NavbarSearch() {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSearchResult[]>([]);
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchIt() {
      if (value.length < 2) {
        setSuggestions([]);
        setHashtagSuggestions([]);
        setProjectSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const searchTerm = value.trim();
        const isHashtagSearch = searchTerm.startsWith('#');
        const isUserSearch = searchTerm.startsWith('@');
        const isProjectSearch = searchTerm.startsWith('!');
        const isGeneralSearch = !isHashtagSearch && !isUserSearch && !isProjectSearch;

        setSuggestions([]);
        setHashtagSuggestions([]);
        setProjectSuggestions([]);

        const promises: Promise<void>[] = [];

        if (isUserSearch || isGeneralSearch) {
          const userQuery = isUserSearch ? searchTerm.slice(1) : searchTerm;
          promises.push(
            fetch(`/api/search/users?q=${encodeURIComponent(userQuery)}`, { signal: controller.signal })
              .then(res => res.ok ? res.json() : null)
              .then(data => { if (data) setSuggestions(data.users || []); })
          );
        }

        if (isHashtagSearch || isGeneralSearch) {
          promises.push(
            fetch(`/api/search/hashtags?q=${encodeURIComponent(searchTerm)}`, { signal: controller.signal })
              .then(res => res.ok ? res.json() : null)
              .then(data => { if (data) setHashtagSuggestions(data.hashtags || []); })
          );
        }

        if (isProjectSearch || isGeneralSearch) {
          const projectQuery = isProjectSearch ? searchTerm.slice(1) : searchTerm;
          promises.push(
            fetch(`/api/search/projects?q=${encodeURIComponent(projectQuery)}`, { signal: controller.signal })
              .then(res => res.ok ? res.json() : null)
              .then(data => { if (data) setProjectSuggestions(data.projects || []); })
          );
        }

        await Promise.all(promises);
        setOpen(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
          setHashtagSuggestions([]);
          setProjectSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }

    const t = setTimeout(fetchIt, 200);
    return () => { clearTimeout(t); controller.abort(); };
  }, [value]);

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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let term = value.trim();
    
    if (term.startsWith("@")) {
      term = term.slice(1);
      if (term) { router.push(`/search?q=${encodeURIComponent(term)}&type=profiles`); setOpen(false); return; }
    }
    if (term.startsWith("#")) {
      if (term) { router.push(`/search?q=${encodeURIComponent(term)}&type=hashtags`); setOpen(false); return; }
    }
    if (term.startsWith("!")) {
      term = term.slice(1);
      if (term) { router.push(`/search?q=${encodeURIComponent(term)}&type=projects`); setOpen(false); return; }
    }
    if (term) { router.push(`/search?q=${encodeURIComponent(term)}`); setOpen(false); }
  }

  const hasResults = suggestions.length > 0 || hashtagSuggestions.length > 0 || projectSuggestions.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={onSubmit} className="relative">
        <div className={cn(
          "relative flex items-center transition-all duration-150",
          focused ? "w-96" : "w-80"
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
            placeholder="Search DevLink..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => { setFocused(true); value.length >= 2 && setOpen(true); }}
            onBlur={() => !open && setFocused(false)}
            className={cn(
              "w-full h-11 rounded-xl bg-white/5 border pl-11 pr-16 text-sm outline-none placeholder:text-[var(--muted-foreground)] text-white transition-all duration-150",
              focused 
                ? "border-purple-500/50 bg-white/10 shadow-lg shadow-purple-500/10" 
                : "border-white/10 hover:border-white/20"
            )}
            aria-autocomplete="list"
            aria-expanded={open && hasResults}
            aria-controls={open && hasResults ? "search-results" : undefined}
            role="combobox"
          />
          
          <div className="absolute right-3 flex items-center gap-1 text-[var(--muted-foreground)] pointer-events-none">
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 text-[10px] font-medium">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </form>

      {/* Results dropdown - CSS only animation */}
      {open && (hasResults || loading) && (
        <div 
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 mt-2 w-full bg-[#0d0d12] rounded-2xl p-2 shadow-2xl border border-white/10 z-50 max-h-[70vh] overflow-y-auto animate-fade-in"
        >
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && !hasResults && value.length >= 2 && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-[var(--muted-foreground)]">No results found</p>
            </div>
          )}

          {/* Hashtag Suggestions */}
          {hashtagSuggestions.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Hashtags
              </div>
              {hashtagSuggestions.map((hashtag) => (
                <Link
                  key={hashtag.tag}
                  href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">#</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{hashtag.tag}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {hashtag.postCount} {hashtag.postCount === 1 ? 'post' : 'posts'} • {hashtag.projectCount} {hashtag.projectCount === 1 ? 'project' : 'projects'}
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
          {suggestions.length > 0 && (
            <div className="mb-2">
              {hashtagSuggestions.length > 0 && <div className="h-px bg-white/10 my-2" />}
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Users
              </div>
              {suggestions.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <Avatar src={user.avatarUrl ?? undefined} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <span className="truncate">{user.name ?? user.username}</span>
                      {user.verified && (
                        <svg className="w-4 h-4 text-purple-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {user.isYou && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">You</span>
                      )}
                      {user.profileType && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${getProfileTypeConfig(user.profileType).bgColor} ${getProfileTypeConfig(user.profileType).color}`}>
                          <ProfileTypeIcon profileType={user.profileType} size={10} />
                          {getProfileTypeConfig(user.profileType).label}
                        </span>
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
          {projectSuggestions.length > 0 && (
            <div>
              {(suggestions.length > 0 || hashtagSuggestions.length > 0) && <div className="h-px bg-white/10 my-2" />}
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Projects
              </div>
              {projectSuggestions.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">Enter</kbd> to search all
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
