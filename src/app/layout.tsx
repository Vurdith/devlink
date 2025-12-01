import type { Metadata } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
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
  keywords: ["Roblox", "developer", "portfolio", "client", "studio", "influencer", "collaboration", "game development"],
  authors: [{ name: "DevLink" }],
  creator: "DevLink",
  publisher: "DevLink",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/logo.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/logo/logo.png",
  },
  manifest: "/manifest.json",
  // Open Graph meta tags for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devlink.ink",
    siteName: "DevLink",
    title: "DevLink – Roblox Developer Network",
    description: "The premier professional network for Roblox developers, clients, studios, and influencers. Showcase your work, find collaborators, and grow your network.",
    images: [
      {
        url: "/logo/logo.png",
        width: 512,
        height: 512,
        alt: "DevLink Logo",
      },
    ],
  },
  // Twitter Card meta tags
  twitter: {
    card: "summary_large_image",
    title: "DevLink – Roblox Developer Network",
    description: "The premier professional network for Roblox developers, clients, studios, and influencers.",
    images: ["/logo/logo.png"],
    creator: "@devlink",
  },
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      <head>
        {/* Preconnect to critical external origins */}
        <link rel="preconnect" href="https://cdn.devlink.ink" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        
        {/* Optimize resource loading */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}>
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "DevLink",
              "url": "https://devlink.ink",
              "description": "The premier professional network for Roblox developers, clients, studios, and influencers.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://devlink.ink/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        <SessionProvider>
          <ToastProvider>
            <RealtimeProvider>
            <PerformanceProvider>
            <ErrorBoundary>
              {/* Animated background */}
              <AnimatedBackground />
              
              <Sidebar />
              <MobileNav />
              <div className="md:ml-72 min-h-screen relative">
                <Navbar />
                <main id="main-content" className="min-h-screen relative isolate pb-20 md:pb-0" role="main">
                  <div className="relative z-10 p-4 md:p-6 pt-16 md:pt-6">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </div>
                </main>
              </div>
            </ErrorBoundary>
            </PerformanceProvider>
            </RealtimeProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
