import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { MessageThread } from "@/types/api";

export function MessageThreadIntro({ otherUser }: { otherUser: MessageThread["userA"] | null }) {
  return (
    <div className="mx-auto mb-6 w-full max-w-4xl">
      <div className="flex items-center justify-center">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-white/[0.03]" />
        <Link
          href={`/u/${otherUser?.username || ""}`}
          className="mx-4 flex max-w-[min(520px,82vw)] items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-white/[0.04]"
        >
          <Avatar size={48} src={otherUser?.profile?.avatarUrl || undefined} />
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-bold text-white">
              {otherUser?.name || otherUser?.username || "Conversation"}
            </div>
            {otherUser?.username ? <div className="truncate text-xs text-white/38">@{otherUser.username}</div> : null}
            {otherUser?.profile?.bio ? (
              <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-white/48">{otherUser.profile.bio}</p>
            ) : null}
          </div>
        </Link>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.08] to-white/[0.03]" />
      </div>
    </div>
  );
}
