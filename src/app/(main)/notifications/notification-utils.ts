import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import type { NotificationActor, NotificationItem, NotificationRow, NotificationTab } from "./notification-types";

export function labelForNotification(n: NotificationItem) {
  switch (n.type) {
    case "LIKE":
      return "liked your post";
    case "REPOST":
      return "reposted your post";
    case "REPLY":
      return "replied to your post";
    case "FOLLOW":
      return "followed you";
    case "MENTION":
      return "mentioned you";
  }
}

export function getStackedActors(n: NotificationItem) {
  const list = (n.actors ?? []).map((x) => x?.actor).filter(Boolean) as NotificationActor[];

  if (list.length === 0 && n.actor) return [n.actor];
  return list;
}

export function getStackedLabel(n: NotificationItem) {
  const names = getStackedActors(n)
    .map((x) => x.name || x.username)
    .filter(Boolean) as string[];
  const first = names[0] || "Someone";

  if (names.length <= 1) return { who: first, rest: "" };

  const second = names[1];
  const remaining = names.length - 2;
  if (remaining <= 0) return { who: `${first} and ${second}`, rest: "" };
  return { who: `${first}, ${second}`, rest: `and ${remaining} others` };
}

export function compactPreviewText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function safeDistance(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export async function safeJson(res: Response) {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function groupNotificationRows(visible: NotificationItem[], tab: NotificationTab): NotificationRow[] {
  const rows: NotificationRow[] = [];

  const pushByDay = (list: NotificationItem[], prefix: string) => {
    let lastKey = "";

    for (const n of list) {
      const d = new Date(n.createdAt);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      if (dayKey !== lastKey) {
        lastKey = dayKey;
        rows.push({ kind: "header", label: getDayLabel(d), key: `${prefix}:h:${dayKey}` });
      }

      rows.push({ kind: "item", n, key: `${prefix}:n:${n.id}` });
    }
  };

  if (tab === "all") {
    const unread = visible.filter((n) => !n.readAt);
    const read = visible.filter((n) => n.readAt);

    if (unread.length) {
      rows.push({ kind: "section", label: "Unread", key: "section:unread" });
      pushByDay(unread, "u");
    }

    if (read.length) {
      rows.push({ kind: "section", label: "Earlier", key: "section:read" });
      pushByDay(read, "r");
    }

    return rows;
  }

  pushByDay(visible, "all");
  return rows;
}

function getDayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, date.getFullYear() === new Date().getFullYear() ? "MMM d" : "MMM d, yyyy");
}
