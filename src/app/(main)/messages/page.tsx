"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ui } from "@/components/ui/design-system";
import { NewMessageModal } from "./_components/NewMessageModal";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [showNewMessage, setShowNewMessage] = useState(false);

  return (
    <>
      <div className="hidden md:flex flex-col items-center justify-center h-full">
        <div className="max-w-[340px] text-center px-8">
          <h2 className="text-[31px] font-extrabold text-white leading-tight">
            {isLoggedIn ? "Select a message" : "Your messages"}
          </h2>
          <p className="text-[15px] text-white/40 mt-2 leading-relaxed">
            {isLoggedIn
              ? "Choose from your existing conversations, start a new one, or just keep swimming."
              : "Sign in to send and receive private messages with other developers on DevLink."}
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => setShowNewMessage(true)}
              className={`mt-7 rounded-lg px-8 py-3.5 text-[15px] font-bold ${ui.control.gradient}`}
            >
              New message
            </button>
          ) : (
            <Link
              href="/login"
              className={`mt-7 inline-block rounded-lg px-8 py-3.5 text-[15px] font-bold ${ui.control.gradient}`}
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onThreadCreated={() => setShowNewMessage(false)}
          onRequestSent={() => setShowNewMessage(false)}
        />
      )}
    </>
  );
}
