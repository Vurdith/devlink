"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/cn";
import dynamic from "next/dynamic";

const MobileNav = dynamic(
  () => import("@/components/layout/MobileNav").then((m) => ({ default: m.MobileNav })),
  { ssr: false }
);

interface AppShellProps {
  children: React.ReactNode;
  session: { user?: { id?: string; username?: string; name?: string; image?: string } } | null;
}

type AppFrameKind = "landing" | "standard" | "wide" | "workspace" | "narrow" | "reading" | "fixed";

const frameClassByKind: Record<AppFrameKind, string> = {
  landing: "max-w-none pt-0",
  standard: "max-w-[1180px] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5 sm:pt-5 md:px-6 md:pb-8 md:pt-6",
  wide: "max-w-[1280px] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5 sm:pt-5 md:px-6 md:pb-8 md:pt-6",
  workspace: "max-w-[1400px] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5 sm:pt-5 md:px-6 md:pb-8 md:pt-6",
  narrow: "max-w-[900px] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5 sm:pt-5 md:px-6 md:pb-8 md:pt-6",
  reading: "max-w-[840px] px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-6 md:pb-10 md:pt-8",
  fixed: "max-w-none p-0",
};

function getAppFrameKind(pathname: string): AppFrameKind {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/messages")) return "fixed";
  if (pathname === "/home" || pathname.startsWith("/discover") || pathname.startsWith("/search")) return "workspace";
  if (pathname.startsWith("/u/") || pathname === "/me" || pathname.startsWith("/jobs")) return "wide";
  if (pathname.startsWith("/profile-hub") || pathname.startsWith("/settings")) return "narrow";
  if (pathname === "/privacy" || pathname === "/terms") return "reading";
  return "standard";
}

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();
  const frameKind = getAppFrameKind(pathname);
  const isFixedFrame = frameKind === "fixed";

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-transparent text-[var(--color-foreground)]">
      <Sidebar session={session} />
      <MobileNav session={session} />

      <div className={cn("w-full min-w-0 transition-all duration-300", "md:pl-72")}>
        <Navbar session={session} />

        <main id="main-content" className="relative isolate" role="main">
          <div className={cn(
            "relative z-10 mx-auto w-full min-w-0",
            frameClassByKind[frameKind],
            isFixedFrame && "relative z-auto"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

