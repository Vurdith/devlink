"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  usePathname(); // keep hook for future route-based shell toggles

  return (
    <>
      <Sidebar />
      <MobileNav />
      <div className="md:ml-72 min-h-screen relative">
        <Navbar />
        <main id="main-content" className="min-h-screen relative isolate pb-20 md:pb-0" role="main">
          <div className="relative z-10 p-4 md:p-6 pt-16 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

