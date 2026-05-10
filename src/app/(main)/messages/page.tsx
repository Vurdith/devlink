"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { NewMessageModal } from "./_components/NewMessageModal";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [showNewMessage, setShowNewMessage] = useState(false);

  return (
    <>
      <div className="hidden h-full flex-col items-center justify-center md:flex">
        <FeedbackState
          className="max-w-[420px] px-8 py-10"
          icon={<MessageIcon />}
          title={isLoggedIn ? "Select a conversation" : "Your messages"}
          description={
            isLoggedIn
              ? "Choose a thread from the inbox, or start a conversation with a builder, client, or collaborator."
              : "Log in to read threads, send messages, and review requests."
          }
          action={
            isLoggedIn
              ? { label: "New message", onClick: () => setShowNewMessage(true) }
              : { label: "Log in", href: "/login" }
          }
        />
      </div>

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onThreadCreated={() => setShowNewMessage(false)}
          onRequestSent={() => undefined}
        />
      )}
    </>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
