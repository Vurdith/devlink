import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";
import { ArrowLeft, MoreVertical } from "lucide-react";
import type { MessageThread } from "@/types/api";

interface MessageThreadHeaderProps {
  otherUser: MessageThread["userA"] | null;
  onShowProfile: () => void;
}

export function MessageThreadHeader({ otherUser, onShowProfile }: MessageThreadHeaderProps) {
  return (
    <div className={surface("toolbar", "noise-overlay flex h-[64px] flex-shrink-0 items-center gap-3 rounded-none border-x-0 border-t-0 px-3 sm:px-4")}>
      <Link href="/messages" className={cn("flex h-9 w-9 items-center justify-center text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] md:hidden", ui.control.icon)} aria-label="Back to messages">
        <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
      </Link>
      <button onClick={onShowProfile} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]">
        <Avatar size={36} src={otherUser?.profile?.avatarUrl || undefined} />
        <div className="min-w-0 text-left">
          <h1 className="truncate text-[15px] font-bold leading-tight text-white">{otherUser?.name || otherUser?.username || "Conversation"}</h1>
          {otherUser?.username ? <p className="truncate text-xs text-white/40">@{otherUser.username}</p> : null}
        </div>
      </button>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onShowProfile}
          className={cn("flex h-9 w-9 items-center justify-center text-white/50 transition-colors", ui.control.icon)}
          title="View profile"
          aria-label="View profile"
        >
          <MoreVertical className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
