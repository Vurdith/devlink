import type { Message } from "@/types/api";

export type FormattedMessage = Message & {
  showDate: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

export function formatMessageRows(messages: Message[] = []): FormattedMessage[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];
    const previousDate = previous ? new Date(previous.createdAt) : null;
    const currentDate = new Date(message.createdAt);
    const showDate = !previousDate || previousDate.toDateString() !== currentDate.toDateString();

    const isFirstInGroup =
      !previous ||
      previous.senderId !== message.senderId ||
      showDate ||
      currentDate.getTime() - new Date(previous.createdAt).getTime() > 5 * 60 * 1000;

    const next = messages[index + 1];
    const isLastInGroup =
      !next ||
      next.senderId !== message.senderId ||
      new Date(next.createdAt).toDateString() !== currentDate.toDateString() ||
      new Date(next.createdAt).getTime() - currentDate.getTime() > 5 * 60 * 1000;

    return { ...message, showDate, isFirstInGroup, isLastInGroup };
  });
}

export function formatMessageDay(value: Date) {
  const now = new Date();
  const isToday = value.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = value.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return value.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: value.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatMessageTime(value: Date) {
  return value.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
