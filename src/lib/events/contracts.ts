export type EventTopic =
  | "post.created"
  | "post.liked"
  | "message.sent"
  | "profile.updated"
  | "notification.created"
  | "media.uploaded";

export type EventEnvelope<T extends EventTopic, P> = {
  id: string;
  topic: T;
  occurredAt: string;
  version: "v1";
  payload: P;
};

export type PostCreatedPayload = {
  postId: string;
  userId: string;
  createdAt: string;
};

export type PostLikedPayload = {
  postId: string;
  actorId: string;
  recipientId: string;
  createdAt: string;
};

export type MessageSentPayload = {
  messageId: string;
  threadId: string;
  senderId: string;
  recipientIds: string[];
  createdAt: string;
};

export type ProfileUpdatedPayload = {
  userId: string;
  fields: string[];
  updatedAt: string;
};

export type NotificationCreatedPayload = {
  notificationId?: string;
  recipientId: string;
  actorId: string;
  type: "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MENTION";
  postId?: string | null;
  sourcePostId?: string | null;
  createdAt: string;
};

export type MediaUploadedPayload = {
  mediaId: string;
  ownerId: string;
  url: string;
  mediaType: "image" | "video";
  createdAt: string;
};

export type EventPayloadMap = {
  "post.created": PostCreatedPayload;
  "post.liked": PostLikedPayload;
  "message.sent": MessageSentPayload;
  "profile.updated": ProfileUpdatedPayload;
  "notification.created": NotificationCreatedPayload;
  "media.uploaded": MediaUploadedPayload;
};

export function createEventEnvelope<T extends EventTopic>(
  topic: T,
  payload: EventPayloadMap[T]
): EventEnvelope<T, EventPayloadMap[T]> {
  return {
    id: crypto.randomUUID(),
    topic,
    occurredAt: new Date().toISOString(),
    version: "v1",
    payload,
  };
}
