export type NotificationType = "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MENTION";

export type NotificationActor = {
  id: string;
  username: string;
  name: string | null;
  profile: { avatarUrl: string | null; verified: boolean; profileType: string | null } | null;
};

export type NotificationItem = {
  id: string;
  groupIds?: string[];
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
  actor: NotificationActor;
  actors?: Array<{
    actor: NotificationActor;
    createdAt: string;
  }>;
  post: { id: string; userId: string; content: string; createdAt: string } | null;
  sourcePost: { id: string; content: string; createdAt: string } | null;
};

export type NotificationTab = "all" | "unread";

export type NotificationRow =
  | { kind: "header"; label: string; key: string }
  | { kind: "section"; label: string; key: string }
  | { kind: "item"; n: NotificationItem; key: string };
