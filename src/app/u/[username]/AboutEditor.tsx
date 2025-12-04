"use client";
import Link from "next/link";

export function AboutEditor({ editable }: {
  initialBio?: string | null;
  initialLocation?: string | null;
  initialWebsite?: string | null;
  initialName?: string | null;
  username?: string;
  editable: boolean;
}) {
  if (!editable) return null;

  return (
    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 group z-10">
      <Link
        href="/profile-hub"
        className="relative p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-black/80 transition-all duration-200 hover:scale-105 inline-flex items-center justify-center shadow-xl shadow-black/50"
        aria-label="Profile Hub"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Tooltip */}
        <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium text-white bg-black/90 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Profile Hub
        </span>
      </Link>
    </div>
  );
}
