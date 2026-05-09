import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { ui } from "@/components/ui/design-system";
import type { MessageThread } from "@/types/api";

interface MessageThreadHeaderProps {
  otherUser: MessageThread["userA"] | null;
  onShowProfile: () => void;
}

export function MessageThreadHeader({ otherUser, onShowProfile }: MessageThreadHeaderProps) {
  return (
    <div className="flex h-[53px] flex-shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[rgba(8,11,16,0.74)] px-4 backdrop-blur-md">
      <Link href="/messages" className={cn("flex h-9 w-9 items-center justify-center text-white/60 transition-colors md:hidden", ui.control.icon)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <button onClick={onShowProfile} className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity">
        <Avatar size={32} src={otherUser?.profile?.avatarUrl || undefined} />
        <div className="min-w-0 text-left">
          <h1 className="text-[15px] font-bold text-white truncate leading-tight">{otherUser?.name || otherUser?.username || "Conversation"}</h1>
        </div>
      </button>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onShowProfile}
          className={cn("flex h-9 w-9 items-center justify-center text-white/50 transition-colors", ui.control.icon)}
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
