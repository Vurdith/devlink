"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import Link from "next/link";

interface UserSearchResult {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  verified: boolean;
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

export function NavbarSearch() {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSearchResult[]>([]);
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

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
        
        // Determine search type based on prefix
        const isHashtagSearch = searchTerm.startsWith('#');
        const isUserSearch = searchTerm.startsWith('@');
        const isProjectSearch = searchTerm.startsWith('!');
        const isGeneralSearch = !isHashtagSearch && !isUserSearch && !isProjectSearch;

        // Clear all suggestions first
        setSuggestions([]);
        setHashtagSuggestions([]);
        setProjectSuggestions([]);

        // Search for users (if @ prefix or general search)
        if (isUserSearch || isGeneralSearch) {
          const userQuery = isUserSearch ? searchTerm.slice(1) : searchTerm;
          const usersRes = await fetch(`/api/search/users?q=${encodeURIComponent(userQuery)}`, { signal });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setSuggestions(usersData.users || []);
          }
        }

        // Search for hashtags (if # prefix or general search)
        if (isHashtagSearch || isGeneralSearch) {
          const hashtagQuery = isHashtagSearch ? searchTerm : searchTerm;
          const hashtagsRes = await fetch(`/api/search/hashtags?q=${encodeURIComponent(hashtagQuery)}`, { signal });
          if (hashtagsRes.ok) {
            const hashtagsData = await hashtagsRes.json();
            setHashtagSuggestions(hashtagsData.hashtags || []);
          }
        }

        // Search for projects (if ! prefix or general search)
        if (isProjectSearch || isGeneralSearch) {
          const projectQuery = isProjectSearch ? searchTerm.slice(1) : searchTerm;
          const projectsRes = await fetch(`/api/search/projects?q=${encodeURIComponent(projectQuery)}`, { signal });
          if (projectsRes.ok) {
            const projectsData = await projectsRes.json();
            setProjectSuggestions(projectsData.projects || []);
          }
        }

        setOpen(true);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // console.log('Fetch aborted');
        } else {
          console.error("Search suggestions error:", error);
          setSuggestions([]);
          setHashtagSuggestions([]);
          setProjectSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }

    const t = setTimeout(fetchIt, 150);
    return () => { clearTimeout(t); controller.abort(); };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let term = value.trim();
    
    // Handle @username searches
    if (term.startsWith("@")) {
      term = term.slice(1);
      if (term) {
        router.push(`/search?q=${encodeURIComponent(term)}&type=profiles`);
        setOpen(false);
        return;
      }
    }
    
    // Handle hashtag searches
    if (term.startsWith("#")) {
      if (term) {
        router.push(`/search?q=${encodeURIComponent(term)}&type=hashtags`);
        setOpen(false);
        return;
      }
    }
    
    // Handle project searches
    if (term.startsWith("!")) {
      term = term.slice(1);
      if (term) {
        router.push(`/search?q=${encodeURIComponent(term)}&type=projects`);
        setOpen(false);
        return;
      }
    }
    
    // Handle general searches (no prefix)
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
      setOpen(false);
    }
  }

  function onSuggestionClick(username: string) {
    router.push(`/u/${username}`);
    setOpen(false);
  }

  function onHashtagClick(hashtag: string) {
    router.push(`/hashtag/${hashtag.replace('#', '')}`);
    setOpen(false);
  }

  function onProjectClick(projectId: string) {
    router.push(`/projects/${projectId}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          placeholder="Search handles, hashtags, projects..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => value.length >= 2 && setOpen(true)}
          className="w-80 h-10 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 px-12 text-sm outline-none focus:border-purple-400/50 focus:from-purple-500/20 focus:to-blue-500/20 placeholder:text-purple-200/60 text-white transition-all duration-300"
        />
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300/70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </form>
      {open && (suggestions.length > 0 || hashtagSuggestions.length > 0 || projectSuggestions.length > 0) && (
        <div className="absolute left-0 mt-2 w-full max-w-xs glass rounded-[var(--radius)] p-2 shadow-xl glow float-card z-50">
          {/* Hashtag Suggestions */}
          {hashtagSuggestions.length > 0 && (
            <>
              <div className="text-xs font-medium text-[var(--accent)] px-2 py-1 mb-1">Hashtags</div>
              {hashtagSuggestions.map((hashtag) => (
                <Link
                  key={hashtag.tag}
                  href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                  onClick={() => onHashtagClick(hashtag.tag)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition relative group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">#</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--accent)] truncate">{hashtag.tag}</div>
                    <div className="text-xs text-[var(--muted-foreground)] truncate">
                      {hashtag.postCount} {hashtag.postCount === 1 ? 'post' : 'posts'} • {hashtag.projectCount} {hashtag.projectCount === 1 ? 'project' : 'projects'}
                    </div>
                  </div>
                </Link>
              ))}
              {(suggestions.length > 0 || projectSuggestions.length > 0) && <div className="border-t border-white/10 my-2"></div>}
            </>
          )}

          {/* User Suggestions */}
          {suggestions.length > 0 && (
            <>
              <div className="text-xs font-medium text-[var(--accent)] px-2 py-1 mb-1">Users</div>
              {suggestions.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  onClick={() => onSuggestionClick(user.username)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition relative group"
                >
                  <Avatar src={user.avatarUrl ?? undefined} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-1">
                      <span className="truncate">{user.name ?? user.username}</span>
                      {user.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" className="text-[var(--accent)]"><path d="M12 3l2.39 2.39L17 6l-.61 2.61L19 12l-2.61.61L15 17l-2.61-.61L12 21l-2.39-2.39L7 17l.61-2.39L5 12l2.61-.61L7 6l2.39-.61L12 3z" fill="currentColor"/></svg>
                      )}
                      {user.isYou && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">You</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] truncate">@{user.username}</div>
                  </div>
                  {!user.isYou && (
                    <div onClick={(e) => e.preventDefault()} className="relative z-10">
                      <FollowButton targetUserId={user.id} initialFollowing={user.isFollowing} compact />
                    </div>
                  )}
                </Link>
              ))}
              {projectSuggestions.length > 0 && <div className="border-t border-white/10 my-2"></div>}
            </>
          )}

          {/* Project Suggestions */}
          {projectSuggestions.length > 0 && (
            <>
              <div className="text-xs font-medium text-[var(--accent)] px-2 py-1 mb-1">Projects</div>
              {projectSuggestions.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  onClick={() => onProjectClick(project.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition relative group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{project.title}</div>
                    <div className="text-xs text-[var(--muted-foreground)] truncate">
                      by {project.author.name || project.author.username}
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}

          {loading && (
            <div className="p-2 text-center text-[var(--muted-foreground)]">Loading...</div>
          )}

          {!loading && suggestions.length === 0 && hashtagSuggestions.length === 0 && projectSuggestions.length === 0 && (
            <div className="p-2 text-center text-[var(--muted-foreground)]">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}


