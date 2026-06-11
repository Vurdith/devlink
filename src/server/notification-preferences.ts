import type { NotificationType } from "@prisma/client";
import { prisma } from "@/server/db";

export type NotificationPreferenceKey = "likes" | "reposts" | "replies" | "mentions" | "follows" | "jobApplications";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const defaultNotificationPreferences: NotificationPreferences = {
  likes: true,
  reposts: true,
  replies: true,
  mentions: true,
  follows: true,
  jobApplications: true,
};

const notificationPreferenceByType: Record<NotificationType, NotificationPreferenceKey> = {
  LIKE: "likes",
  REPOST: "reposts",
  REPLY: "replies",
  MENTION: "mentions",
  FOLLOW: "follows",
  JOB_APPLICATION: "jobApplications",
};

export function normalizeNotificationPreferences(input: Partial<NotificationPreferences> | null | undefined): NotificationPreferences {
  return {
    ...defaultNotificationPreferences,
    likes: typeof input?.likes === "boolean" ? input.likes : defaultNotificationPreferences.likes,
    reposts: typeof input?.reposts === "boolean" ? input.reposts : defaultNotificationPreferences.reposts,
    replies: typeof input?.replies === "boolean" ? input.replies : defaultNotificationPreferences.replies,
    mentions: typeof input?.mentions === "boolean" ? input.mentions : defaultNotificationPreferences.mentions,
    follows: typeof input?.follows === "boolean" ? input.follows : defaultNotificationPreferences.follows,
    jobApplications: typeof input?.jobApplications === "boolean" ? input.jobApplications : defaultNotificationPreferences.jobApplications,
  };
}

export function getPreferenceKeyForNotificationType(type: NotificationType) {
  return notificationPreferenceByType[type];
}

export async function notificationTypeEnabledForUser(userId: string, type: NotificationType) {
  const preferences = await prisma.userNotificationSettings.findUnique({
    where: { userId },
    select: {
      likes: true,
      reposts: true,
      replies: true,
      mentions: true,
      follows: true,
      jobApplications: true,
    },
  });

  return normalizeNotificationPreferences(preferences)[getPreferenceKeyForNotificationType(type)];
}
