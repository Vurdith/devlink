import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";
import type { MessageThread } from "@/types/api";

interface MessageThreadHeaderProps {
  otherUser: MessageThread["userA"] | null;
  onShowProfile: () => void;
}

export function MessageThreadHeader({ otherUser, onShowProfile }: MessageThreadHeaderProps) {
  return (
    <div className={surface("toolbar", "noise-overlay flex h-[64px] flex-shrink-0 items-center gap-3 rounded-none border-x-0 border-t-0 px-3 backdrop-blur-md sm:px-4")}>
      <Link href="/messages" className={cn("flex h-11 w-11 items-center justify-center text-white/60 transition-colors md:hidden", ui.control.icon)} aria-label="Back to messages">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <button onClick={onShowProfile} className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1 text-left outline-none transition-colors hover:bg-white/[0.035] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
        <Avatar size={36} src={otherUser?.profile?.avatarUrl || undefined} />
        <div className="min-w-0 text-left">
          <h1 className="truncate text-[15px] font-bold leading-tight text-white">{otherUser?.name || otherUser?.username || "Conversation"}</h1>
          {otherUser?.username ? <p className="truncate text-xs text-white/40">@{otherUser.username}</p> : null}
        </div>
      </button>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onShowProfile}
          className={cn("flex h-11 w-11 items-center justify-center text-white/50 transition-colors sm:h-9 sm:w-9", ui.control.icon)}
          title="View profile"
          aria-label="View profile"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
