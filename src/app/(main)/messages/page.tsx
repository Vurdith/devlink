"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { NewMessageModal } from "./_components/NewMessageModal";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [showNewMessage, setShowNewMessage] = useState(false);

  return (
    <>
      <div className="hidden h-full flex-col items-center justify-center md:flex">
        <div className={surface("panel", "noise-overlay relative max-w-[380px] overflow-hidden px-8 py-9 text-center")}>
          <div className={iconBox("cyan", "mx-auto mb-5 h-12 w-12")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[28px] font-extrabold leading-tight text-white">
            {isLoggedIn ? "Select a message" : "Your messages"}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/45">
            {isLoggedIn
              ? "Choose an existing conversation or start a new private thread."
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
