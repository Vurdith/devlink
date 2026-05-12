"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { NewMessageModal } from "./_components/NewMessageModal";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [showNewMessage, setShowNewMessage] = useState(false);

  if (!isLoggedIn) return null;

  return (
    <>
      <div className="hidden h-full flex-col items-center justify-center md:flex">
        <FeedbackState
          className="max-w-[420px] px-8 py-10"
          icon={<MessageIcon />}
          title="Select a conversation"
          description="Pick a thread from the inbox or start a new one."
          action={{ label: "New message", onClick: () => setShowNewMessage(true) }}
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
