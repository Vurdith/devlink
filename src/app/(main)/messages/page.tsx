"use client";

import { useSession } from "next-auth/react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  if (!isLoggedIn) return null;

  return (
    <div
      className="hidden h-full min-w-0 bg-[radial-gradient(640px_360px_at_50%_8%,rgba(var(--color-accent-2-rgb),0.055),transparent_68%)] md:block"
      aria-hidden="true"
    />
  );
}
