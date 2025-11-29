import type { Metadata } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DevLink – Roblox Developer Network",
    template: "%s – DevLink",
  },
  description: "Portfolios, projects, and collaborations for Roblox developers, clients, and creators.",
  metadataBase: new URL("https://devlink.ink"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/logo.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/logo/logo.png",
  },
  // Performance hints
  other: {
    "dns-prefetch": "//wknkldqylnkqjmthnjez.supabase.co",
  },
};

// Viewport config for better mobile performance
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}>
        <SessionProvider>
          <ToastProvider>
            <PerformanceProvider>
            <ErrorBoundary>
              {/* Animated background */}
              <AnimatedBackground />
              
              <Sidebar />
              <MobileNav />
              <div className="md:ml-72 min-h-screen relative">
                <Navbar />
                <main className="min-h-screen relative isolate pb-20 md:pb-0">
                  {/* Gradient overlay */}
                  <div className="fixed inset-0 -z-10 gradient-bg pointer-events-none" />
                  
                  {/* Grid pattern */}
                  <div className="fixed inset-0 -z-10 grid-pattern pointer-events-none opacity-50" />
                  
                  <div className="relative z-10 p-4 md:p-6 pt-16 md:pt-6">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </main>
              </div>
            </ErrorBoundary>
            </PerformanceProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
