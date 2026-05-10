import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { LoadMoreButton } from "@/components/ui/FeedbackState";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
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
        <LoadMoreButton
          loading={loadingMore}
          onClick={onFetchMore}
          label="Load older notifications"
          loadingLabel="Loading older notifications"
          className="pt-5"
        />
      ) : null}
    </>
  );
}

function NotificationSection({ label }: { label: string }) {
  return (
    <div className="pb-2 pt-6 first:pt-2">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-2)]" />
        {label}
      </div>
    </div>
  );
}

function NotificationDayHeader({ label }: { label: string }) {
  return (
    <div className="pb-2 pt-4">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span>{label}</span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
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
        surface(
          "panelMuted",
          "group relative cursor-pointer overflow-hidden p-4 outline-none transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.045] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:p-5"
        ),
        n.readAt ? "" : ui.active.cyan,
      ].join(" ")}
      aria-label="Notification"
    >
      {!n.readAt ? <UnreadGlow /> : null}
      <div className="flex items-start gap-3 sm:gap-4">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 text-sm leading-6 text-white/[0.88] sm:text-[15px]">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="max-w-full truncate font-semibold text-white">{who.who}</span>
                {verified ? <VerifiedBadge /> : null}
                <span className="min-w-0 text-white/[0.62]">
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
      <span aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-gradient-to-b from-[var(--color-accent-2)] via-[var(--color-accent)] to-[var(--color-accent-3)]" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.38)]" />
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
    <div className="relative shrink-0">
      <span
        aria-hidden="true"
        className="absolute left-1/2 w-px bg-white/10"
        style={{ top: previousIsItem ? "-10px" : "38px", bottom: nextIsItem ? "-10px" : "38px" }}
      />
      <div className="flex items-center -space-x-3">
        {actors.map((actor, index) => (
          <div
            key={actor.id}
            className={["flex items-center justify-center overflow-hidden rounded-full ring-2 ring-[var(--color-background)]", index === 0 ? "h-10 w-10" : "h-9 w-9"].join(" ")}
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
                className="block h-10 w-10 leading-none"
                aria-label={`Open profile for ${actor.name}`}
              >
                <Avatar src={actor.avatarUrl} alt={actor.name} className="w-full h-full border-0" />
              </div>
            </ProfileTooltip>
          </div>
        ))}
      </div>
      {totalActors > 1 ? (
        <span className="absolute -right-2 -top-2 rounded-full border border-white/15 bg-[rgba(8,11,16,0.92)] px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
          +{totalActors - 1}
        </span>
      ) : null}
    </div>
  );
}

function NotificationMeta({ notification: n, onMarkRead }: { notification: NotificationItem; onMarkRead: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2 self-start">
      <span className={["flex h-7 w-7 items-center justify-center rounded-lg border bg-white/[0.045]", typeBadgeClasses(n.type)].join(" ")} aria-hidden="true">
        <TypeIcon type={n.type} />
      </span>
      <div className="whitespace-nowrap text-[11px] tabular-nums text-white/45">{safeDistance(n.createdAt)}</div>
      {!n.readAt ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead();
          }}
          className={cn("p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100", ui.control.icon)}
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
      <div className="relative mt-3 rounded-lg border border-white/[0.08] bg-black/10 px-3 py-2 pl-5 text-sm leading-6 text-white/60">
        <span className="absolute bottom-2 left-2 top-2 w-px bg-[rgba(var(--color-accent-2-rgb),0.18)]" aria-hidden="true" />
        <span className="absolute left-1.5 top-2 h-2 w-2 rounded-full bg-[rgba(var(--color-accent-2-rgb),0.42)]" aria-hidden="true" />
        {n.sourcePost?.content ? <div className="line-clamp-3 break-words">{compactPreviewText(n.sourcePost.content)}</div> : null}
        {n.post?.content ? (
          <div className="mt-2 border-l border-white/[0.08] pl-3">
            <div className="line-clamp-3 break-words text-white/70">{compactPreviewText(n.post.content)}</div>
          </div>
        ) : null}
      </div>
    );
  }

  if (!n.post?.content) return null;

  return (
    <div className="mt-3 line-clamp-2 break-words rounded-lg border border-white/[0.08] bg-black/10 px-3 py-2 text-sm leading-6 text-white/60">
      {compactPreviewText(n.post.content)}
    </div>
  );
}
