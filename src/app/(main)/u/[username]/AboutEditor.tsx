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
    <div className="group absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
      <Link
        href="/profile-hub"
        className="relative inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-[rgba(7,10,15,0.74)] px-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(var(--color-accent-2-rgb),0.42)] hover:bg-[rgba(11,16,23,0.94)]"
        aria-label="Edit profile"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent-2)]">
          <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="hidden sm:inline">Edit profile</span>
        {/* Tooltip */}
        <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium text-white bg-black/90 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none sm:hidden">
          Edit profile
        </span>
      </Link>
    </div>
  );
}
