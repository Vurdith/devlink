"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: {
    user?: {
      id?: string;
      email?: string;
      name?: string;
      username?: string;
      image?: string;
      needsPassword?: boolean;
    };
  } | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session as Parameters<typeof NextAuthSessionProvider>[0]["session"]}>
      {children}
    </NextAuthSessionProvider>
  );
}
