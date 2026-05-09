import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { isMediaUrl } from "@/lib/message-utils";
import type { MessageThread } from "@/types/api";
import type { FormattedMessage } from "./message-thread-format";
import { formatMessageDay, formatMessageTime } from "./message-thread-format";

interface MessageListProps {
  messages: FormattedMessage[];
  userId: string;
  otherUser: MessageThread["userA"] | null;
  typingUsers: unknown[];
}

export function MessageList({ messages, userId, otherUser, typingUsers }: MessageListProps) {
  return (
    <div className="space-y-0.5">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isMine={message.senderId === userId} otherUser={otherUser} />
      ))}

      {typingUsers.length > 0 && <TypingIndicator />}
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
  otherUser,
}: {
  message: FormattedMessage;
  isMine: boolean;
  otherUser: MessageThread["userA"] | null;
}) {
  return (
    <div>
      {message.showDate && (
        <div className="flex items-center justify-center py-4">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs font-medium text-white/35">{formatMessageDay(new Date(message.createdAt))}</span>
        </div>
      )}

      <div className={cn("flex", isMine ? "justify-end" : "justify-start", message.isFirstInGroup ? "mt-3" : "mt-[2px]")}>
        <div className="group flex items-end gap-1.5 max-w-[75%]">
          {!isMine && (
            <div className="w-8 flex-shrink-0 self-end">
              {message.isLastInGroup && <Avatar size={32} src={otherUser?.profile?.avatarUrl || undefined} />}
            </div>
          )}

          <div className="flex flex-col">
            <div
              className={cn(
                isMediaUrl(message.content) ? "p-1 overflow-hidden" : "px-4 py-2.5 text-[15px] leading-snug break-words",
                isMine
                  ? "border border-[rgba(var(--color-accent-2-rgb),0.26)] bg-[linear-gradient(135deg,var(--color-accent),rgba(var(--color-accent-2-rgb),0.92))] text-white"
                  : "border border-white/[0.08] bg-white/[0.055] text-white",
                isMine ? mineBubbleShape(message) : otherBubbleShape(message)
              )}
            >
              {isMediaUrl(message.content) ? (
                <div className="relative w-full max-w-xs aspect-video overflow-hidden rounded-lg">
                  <Image src={message.content.trim()} alt="" fill className="object-contain" sizes="320px" unoptimized />
                </div>
              ) : (
                message.content
              )}
            </div>

            {message.isLastInGroup && (
              <div className={cn("text-[11px] text-white/25 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity", isMine ? "text-right" : "text-left")}>
                {formatMessageTime(new Date(message.createdAt))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function mineBubbleShape(message: FormattedMessage) {
  return cn(
    message.isFirstInGroup && message.isLastInGroup && "rounded-[22px]",
    message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-br-[4px]",
    !message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-r-[4px]",
    !message.isFirstInGroup && message.isLastInGroup && "rounded-[22px] rounded-tr-[4px]"
  );
}

function otherBubbleShape(message: FormattedMessage) {
  return cn(
    message.isFirstInGroup && message.isLastInGroup && "rounded-[22px]",
    message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-bl-[4px]",
    !message.isFirstInGroup && !message.isLastInGroup && "rounded-[22px] rounded-l-[4px]",
    !message.isFirstInGroup && message.isLastInGroup && "rounded-[22px] rounded-tl-[4px]"
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mt-3">
      <div className="flex items-center gap-2 rounded-[22px] border border-white/[0.08] bg-white/[0.055] px-4 py-2.5">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
