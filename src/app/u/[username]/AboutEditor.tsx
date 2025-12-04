"use client";
import Link from "next/link";
import { Tooltip } from "@/components/ui/BaseModal";

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
      <Tooltip content="Edit profile" side="left">
        <Link
          href="/profile-hub"
          className="p-2 rounded-full bg-[#0d0d12] hover:bg-white/10 ring-1 ring-white/10 hover:ring-[var(--color-accent)]/50 transition duration-200 hover:scale-105 inline-flex"
          aria-label="Edit profile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--foreground)]">
            <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16.5 3.5 20.5 7.5 8 20H4v-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </Tooltip>
    </div>
  );
}
