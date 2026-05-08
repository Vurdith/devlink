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

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="min-h-[100dvh] bg-transparent text-[var(--color-foreground)]">
      <Sidebar session={session} />
      <MobileNav session={session} />

      {/* Main Content Area */}
      <div className={cn("w-full transition-all duration-300", "md:pl-72")}>
        <Navbar session={session} />

        <main id="main-content" className="relative isolate" role="main">
          <div className={cn(
            "mx-auto w-full relative z-10",
            !isLandingPage ? "max-w-[1380px] p-4 md:p-6 pt-16 md:pt-6 pb-24 md:pb-8" : "pt-0"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

