import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { MessageThread } from "@/types/api";

export function MessageThreadIntro({ otherUser }: { otherUser: MessageThread["userA"] | null }) {
  return (
    <div className="flex flex-col items-center py-6 mb-4">
      <Link href={`/u/${otherUser?.username || ""}`}>
        <Avatar size={64} src={otherUser?.profile?.avatarUrl || undefined} />
      </Link>
      <div className="mt-2 text-center">
        <Link href={`/u/${otherUser?.username || ""}`} className="text-lg font-bold text-white hover:underline">
          {otherUser?.name || otherUser?.username}
        </Link>
        <div className="text-sm text-white/40">@{otherUser?.username}</div>
      </div>
      {otherUser?.profile?.bio && <p className="text-sm text-white/50 text-center mt-2 max-w-[280px] leading-relaxed">{otherUser.profile.bio}</p>}
      <div className="flex items-center gap-2 mt-3 text-xs text-white/30">
        <span>
          Joined{" "}
          {otherUser?.createdAt
            ? new Date(otherUser.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
            : "DevLink"}
        </span>
      </div>
    </div>
  );
}
