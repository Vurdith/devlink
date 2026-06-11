import { describe, expect, it } from "vitest";

import { mergeStackedNotificationItems, type NotificationFeedItem } from "../notification-feed";

type Actor = { id: string; username: string };
type Item = NotificationFeedItem<Actor>;

function actor(id: string): Actor {
  return { id, username: id };
}

function item(overrides: Partial<Item> & { id: string; type: string; actor: Actor }): Item {
  return {
    id: overrides.id,
    type: overrides.type,
    postId: overrides.postId ?? "post-1",
    createdAt: overrides.createdAt ?? new Date("2026-01-10T10:00:00Z"),
    readAt: overrides.readAt ?? null,
    actor: overrides.actor,
    actors: overrides.actors ?? [],
  };
}

describe("mergeStackedNotificationItems", () => {
  it("merges legacy like duplicates for the same post and keeps all group ids", () => {
    const merged = mergeStackedNotificationItems([
      item({ id: "n2", type: "LIKE", actor: actor("ada"), createdAt: new Date("2026-01-10T10:00:00Z") }),
      item({ id: "n1", type: "LIKE", actor: actor("ben"), createdAt: new Date("2026-01-09T10:00:00Z") }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].groupIds).toEqual(["n2", "n1"]);
    expect(merged[0].actors.map((row) => row.actor.username)).toEqual(["ada", "ben"]);
  });

  it("keeps a stack unread when any merged notification is unread", () => {
    const merged = mergeStackedNotificationItems([
      item({
        id: "read",
        type: "REPOST",
        actor: actor("read"),
        readAt: new Date("2026-01-10T10:00:00Z"),
      }),
      item({ id: "unread", type: "REPOST", actor: actor("unread"), readAt: null }),
    ]);

    expect(merged[0].readAt).toBeNull();
  });

  it("does not merge different stackable posts or non-stackable notification types", () => {
    const merged = mergeStackedNotificationItems([
      item({ id: "like-a", type: "LIKE", postId: "post-a", actor: actor("ada") }),
      item({ id: "like-b", type: "LIKE", postId: "post-b", actor: actor("ben") }),
      item({ id: "follow", type: "FOLLOW", postId: null, actor: actor("cal") }),
    ]);

    expect(merged.map((notification) => notification.id)).toEqual(["like-a", "like-b", "follow"]);
  });

  it("uses actor join timestamps and keeps the newest row per actor", () => {
    const merged = mergeStackedNotificationItems([
      item({
        id: "stack",
        type: "LIKE",
        actor: actor("fallback"),
        actors: [
          { actor: actor("ada"), createdAt: new Date("2026-01-08T10:00:00Z") },
          { actor: actor("ben"), createdAt: new Date("2026-01-10T10:00:00Z") },
        ],
      }),
      item({
        id: "legacy",
        type: "LIKE",
        actor: actor("ada"),
        actors: [{ actor: actor("ada"), createdAt: new Date("2026-01-11T10:00:00Z") }],
      }),
    ]);

    expect(merged[0].actors.map((row) => row.actor.username)).toEqual(["ada", "ben"]);
    expect(merged[0].actors[0].createdAt.toISOString()).toBe("2026-01-11T10:00:00.000Z");
  });
});
