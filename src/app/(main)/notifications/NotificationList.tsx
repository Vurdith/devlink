import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ProfileTooltip } from "@/components/profile/ProfileTooltip";
import { TypeIcon, VerifiedBadge, typeBadgeClasses } from "./NotificationIcons";
import type { NotificationItem, NotificationRow } from "./notification-types";
import { compactPreviewText, getStackedActors, getStackedLabel, labelForNotification, safeDistance } from "./notification-utils";

interface NotificationListProps {
  rows: NotificationRow[];
  currentUserId?: string;
  hasMore: boolean;
  loadingMore: boolean;
  onFetchMore: () => void;
  onMarkRead: (ids: string[]) => void;
}

export function NotificationList({ rows, currentUserId, hasMore, loadingMore, onFetchMore, onMarkRead }: NotificationListProps) {
  return (
    <>
      {rows.map((row, index) => {
        if (row.kind === "section") {
          return <NotificationSection key={row.key} label={row.label} />;
        }

        if (row.kind === "header") {
          return <NotificationDayHeader key={row.key} label={row.label} />;
        }

        return (
          <NotificationCard
            key={row.key}
            notification={row.n}
            currentUserId={currentUserId}
            previousIsItem={rows[index - 1]?.kind === "item"}
            nextIsItem={rows[index + 1]?.kind === "item"}
            onMarkRead={onMarkRead}
          />
        );
      })}

      {hasMore ? (
        <div className="pt-2 flex justify-center">
          <Button size="sm" variant="secondary" onClick={onFetchMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </>
  );
}

function NotificationSection({ label }: { label: string }) {
  return (
    <div className="pt-6 pb-2">
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 tracking-wide uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
        {label}
      </div>
    </div>
  );
}

function NotificationDayHeader({ label }: { label: string }) {
  return (
    <div className="pt-4 pb-2">
      <div className="text-xs font-semibold text-white/45 tracking-wide uppercase">{label}</div>
    </div>
  );
}

function NotificationCard({
  notification: n,
  currentUserId,
  previousIsItem,
  nextIsItem,
  onMarkRead,
}: {
  notification: NotificationItem;
  currentUserId?: string;
  previousIsItem: boolean;
  nextIsItem: boolean;
  onMarkRead: (ids: string[]) => void;
}) {
  const router = useRouter();
  const who = getStackedLabel(n);
  const href = n.post?.id ? `/p/${n.post.id}` : n.type === "FOLLOW" ? `/u/${n.actor.username}` : "#";
  const actors = getStackedActors(n);
  const verified = !!actors[0]?.profile?.verified;
  const markIds = Array.isArray(n.groupIds) && n.groupIds.length ? n.groupIds : [n.id];
  const avatarStack = actors.slice(0, 3).map((actor) => ({
    id: actor.id,
    username: actor.username,
    name: actor.name || actor.username,
    avatarUrl: actor.profile?.avatarUrl || null,
    verified: !!actor.profile?.verified,
    profileType: actor.profile?.profileType || null,
  }));

  const markRead = () => {
    if (!n.readAt) onMarkRead(markIds);
  };

  const go = () => {
    markRead();
    if (href !== "#") router.push(href);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          go();
        }
      }}
      className={[
        "group relative rounded-2xl p-4 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-rgb),0.45)] border border-white/10 hover:border-white/20",
        n.readAt
          ? "glass-soft"
          : "glass-soft bg-[rgba(var(--color-accent-rgb),0.10)] border-[rgba(var(--color-accent-rgb),0.35)] shadow-[0_0_35px_rgba(var(--color-accent-rgb),0.18)]",
      ].join(" ")}
      aria-label="Notification"
    >
      {!n.readAt ? <UnreadGlow /> : null}
      <div className="flex items-start gap-3">
        <ActorStack
          actors={avatarStack}
          totalActors={actors.length}
          currentUserId={currentUserId}
          previousIsItem={previousIsItem}
          nextIsItem={nextIsItem}
          onProfileClick={(username) => {
            markRead();
            router.push(`/u/${username}`);
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-white/90 flex items-center gap-2 min-w-0">
                <span className="font-semibold truncate">{who.who}</span>
                {verified ? <VerifiedBadge /> : null}
                <span className="text-white/60 truncate">
                  {who.rest ? `${who.rest} ` : ""}
                  {labelForNotification(n)}.
                </span>
              </div>
            </div>
            <NotificationMeta notification={n} onMarkRead={markRead} />
          </div>

          <NotificationPreview notification={n} />
        </div>
      </div>
    </div>
  );
}

function UnreadGlow() {
  return (
    <>
      <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent-2)] to-[var(--color-accent-3)]" />
      <span aria-hidden="true" className="absolute inset-0 rounded-2xl border border-[rgba(var(--color-accent-rgb),0.45)] pointer-events-none" />
    </>
  );
}

function ActorStack({
  actors,
  totalActors,
  currentUserId,
  previousIsItem,
  nextIsItem,
  onProfileClick,
}: {
  actors: Array<{ id: string; username: string; name: string; avatarUrl: string | null; verified: boolean; profileType: string | null }>;
  totalActors: number;
  currentUserId?: string;
  previousIsItem: boolean;
  nextIsItem: boolean;
  onProfileClick: (username: string) => void;
}) {
  return (
    <div className="relative flex-shrink-0">
      <span
        aria-hidden="true"
        className="absolute left-1/2 w-px bg-white/10"
        style={{ top: previousIsItem ? "-10px" : "38px", bottom: nextIsItem ? "-10px" : "38px" }}
      />
      <div className="flex items-center -space-x-3">
        {actors.map((actor, index) => (
          <div
            key={actor.id}
            className={["rounded-full overflow-hidden flex items-center justify-center ring-2 ring-[var(--color-background)]", index === 0 ? "w-10 h-10" : "w-9 h-9"].join(" ")}
          >
            <ProfileTooltip
              user={{
                id: actor.id,
                username: actor.username,
                name: actor.name,
                profile: { avatarUrl: actor.avatarUrl, profileType: actor.profileType, verified: actor.verified },
              }}
              currentUserId={currentUserId}
            >
              <div
                onClick={(event) => {
                  event.stopPropagation();
                  onProfileClick(actor.username);
                }}
                className="block w-10 h-10 leading-none"
                aria-label={`Open profile for ${actor.name}`}
              >
                <Avatar src={actor.avatarUrl} alt={actor.name} className="w-full h-full border-0" />
              </div>
            </ProfileTooltip>
          </div>
        ))}
      </div>
      {totalActors > 1 ? (
        <span className="absolute -top-2 -right-2 rounded-full bg-white/10 border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
          +{totalActors - 1}
        </span>
      ) : null}
    </div>
  );
}

function NotificationMeta({ notification: n, onMarkRead }: { notification: NotificationItem; onMarkRead: () => void }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className={["w-7 h-7 rounded-full border bg-white/5 flex items-center justify-center", typeBadgeClasses(n.type)].join(" ")} aria-hidden="true">
        <TypeIcon type={n.type} />
      </span>
      <div className="text-[11px] text-white/45 tabular-nums">{safeDistance(n.createdAt)}</div>
      {!n.readAt ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 hover:bg-white/10 text-white/65 hover:text-white"
          aria-label="Mark as read"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

function NotificationPreview({ notification: n }: { notification: NotificationItem }) {
  if (n.type === "REPLY" && (n.sourcePost?.content || n.post?.content)) {
    return (
      <div className="mt-2 relative rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 pl-5 text-sm text-white/60">
        <span className="absolute left-2 top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />
        <span className="absolute left-1.5 top-2 w-2 h-2 rounded-full bg-white/25" aria-hidden="true" />
        {n.sourcePost?.content ? <div className="line-clamp-3 break-words">{compactPreviewText(n.sourcePost.content)}</div> : null}
        {n.post?.content ? (
          <div className="mt-2 pl-3 border-l border-white/10">
            <div className="line-clamp-3 break-words text-white/70">{compactPreviewText(n.post.content)}</div>
          </div>
        ) : null}
      </div>
    );
  }

  if (!n.post?.content) return null;

  return (
    <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-sm text-white/60 line-clamp-2 break-words">
      {compactPreviewText(n.post.content)}
    </div>
  );
}
