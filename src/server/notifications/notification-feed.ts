export type NotificationFeedActor = {
  id?: string | null;
} | null;

export type NotificationFeedActorRow<TActor = NotificationFeedActor> = {
  actor: TActor;
  createdAt: Date;
};

export type NotificationFeedItem<TActor = NotificationFeedActor> = {
  id: string;
  type: string;
  postId: string | null;
  createdAt: Date;
  readAt: Date | null;
  actor: TActor;
  actors?: Array<NotificationFeedActorRow<TActor> | null> | null;
  groupIds?: string[];
};

export type MergedNotificationFeedItem<TItem extends NotificationFeedItem> = Omit<TItem, "actors" | "groupIds"> & {
  groupIds?: string[];
  actors: Array<NotificationFeedActorRow<TItem["actor"]>>;
};

function isStackableNotification(item: NotificationFeedItem) {
  return (item.type === "LIKE" || item.type === "REPOST") && Boolean(item.postId);
}

function actorId(actor: NotificationFeedActor) {
  return actor?.id ?? null;
}

function getActorRows<TItem extends NotificationFeedItem>(
  item: TItem
): Array<NotificationFeedActorRow<TItem["actor"]>> {
  const rows = Array.isArray(item.actors)
    ? item.actors
        .filter((row): row is NotificationFeedActorRow<TItem["actor"]> => Boolean(row?.actor))
        .map((row) => ({ actor: row.actor, createdAt: row.createdAt }))
    : [];

  if (rows.length === 0 && item.actor) {
    rows.push({ actor: item.actor, createdAt: item.createdAt });
  }

  return rows;
}

function mergeActorRows<TActor extends NotificationFeedActor>(
  rows: Array<NotificationFeedActorRow<TActor>>
) {
  const byId = new Map<string, NotificationFeedActorRow<TActor>>();

  for (const row of rows) {
    const id = actorId(row.actor);
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing || row.createdAt.getTime() > existing.createdAt.getTime()) {
      byId.set(id, row);
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
}

export function mergeStackedNotificationItems<TItem extends NotificationFeedItem>(items: TItem[]) {
  const merged: Array<MergedNotificationFeedItem<TItem>> = [];
  const groups = new Map<string, MergedNotificationFeedItem<TItem>>();

  for (const item of items) {
    if (!isStackableNotification(item)) {
      merged.push({ ...item, actors: getActorRows(item) });
      continue;
    }

    const key = `${item.type}:${item.postId}`;
    const existing = groups.get(key);
    const actorRows = getActorRows(item);

    if (!existing) {
      const base = {
        ...item,
        groupIds: [item.id],
        actors: mergeActorRows(actorRows),
      } as MergedNotificationFeedItem<TItem>;
      groups.set(key, base);
      merged.push(base);
      continue;
    }

    existing.groupIds = Array.from(new Set([...(existing.groupIds ?? []), item.id]));
    existing.readAt = existing.readAt === null || item.readAt === null ? null : existing.readAt;

    if (item.createdAt.getTime() > existing.createdAt.getTime()) {
      existing.createdAt = item.createdAt;
      existing.actor = item.actor;
    }

    existing.actors = mergeActorRows([...(existing.actors ?? []), ...actorRows]);
  }

  return merged;
}
