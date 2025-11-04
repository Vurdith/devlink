import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevLink – Roblox Developer Network",
    template: "%s – DevLink",
  },
  description: "Portfolios, projects, and collaborations for Roblox developers, clients, and creators.",
  metadataBase: new URL("https://devlink.local"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/logo.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/logo/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen` }>
        <SessionProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Sidebar />
              <div className="ml-72 min-h-screen bg-gradient-to-br from-slate-900/95 via-purple-900/10 to-slate-900/95">
                <Navbar />
                <main className="min-h-screen relative">
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5 pointer-events-none"></div>
                  <div className="relative z-10">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </main>
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
