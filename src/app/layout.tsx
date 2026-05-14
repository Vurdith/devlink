import type { Metadata } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { DEFAULT_THEME, getDefaultLogoPath, getFaviconPath, getLogoPath, THEME_ASSET_VERSION } from "@/lib/themes";
import { getAuthSession } from "@/server/auth";

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
    default: "DevLink - Roblox Developer Network",
    template: "%s - DevLink",
  },
  description: "Portfolios, projects, and collaborations for Roblox developers, clients, and creators.",
  metadataBase: new URL("https://devlink.ink"),
  keywords: ["Roblox", "developer", "portfolio", "client", "studio", "influencer", "collaboration", "game development"],
  authors: [{ name: "DevLink" }],
  creator: "DevLink",
  publisher: "DevLink",
  icons: {
    icon: [
      { url: getFaviconPath(DEFAULT_THEME), type: "image/x-icon" },
      { url: getLogoPath(DEFAULT_THEME), sizes: "any", type: "image/png" },
    ],
    shortcut: getFaviconPath(DEFAULT_THEME),
    apple: getLogoPath(DEFAULT_THEME),
  },
  manifest: "/manifest.json",
  // Open Graph meta tags for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devlink.ink",
    siteName: "DevLink",
    title: "DevLink - Roblox Developer Network",
    description: "The premier professional network for Roblox developers, clients, studios, and influencers. Showcase your work, find collaborators, and grow your network.",
    images: [
      {
        url: getDefaultLogoPath(),
        width: 512,
        height: 512,
        alt: "DevLink Logo",
      },
    ],
  },
  // Twitter Card meta tags
  twitter: {
    card: "summary_large_image",
    title: "DevLink - Roblox Developer Network",
    description: "The premier professional network for Roblox developers, clients, studios, and influencers.",
    images: [getDefaultLogoPath()],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to critical external origins */}
        <link rel="preconnect" href="https://cdn.devlink.ink" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />

        {/* Optimize resource loading */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* Early theme favicon sync - runs before React hydrates */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var theme = localStorage.getItem('devlink-theme');
              var assetVersion = '${THEME_ASSET_VERSION}';
              var assetSuffix = '?v=' + assetVersion;
              var allowedThemes = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'];
              if (theme && allowedThemes.indexOf(theme) !== -1) {
                var ensureThemeLink = function(rel, href, type) {
                  var selector = 'link[data-devlink-theme-icon="true"][rel="' + rel + '"]';
                  var link = document.querySelector(selector);
                  if (!link) {
                    link = document.createElement('link');
                    link.rel = rel;
                    link.setAttribute('data-devlink-theme-icon', 'true');
                    document.head.appendChild(link);
                  }
                  link.href = href;
                  if (type) {
                    link.type = type;
                  } else {
                    link.removeAttribute('type');
                  }
                };

                ensureThemeLink('icon', '/favicon-' + theme + '.ico' + assetSuffix, 'image/x-icon');
                ensureThemeLink('shortcut icon', '/favicon-' + theme + '.ico' + assetSuffix);
                ensureThemeLink('apple-touch-icon', '/logo/logo-' + theme + '.png' + assetSuffix);
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#050508] text-foreground`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--color-accent)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
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

        <ThemeProvider>
          <ToastProvider>
            <SessionProvider session={session}>
              <RealtimeProvider session={session}>
                <PerformanceProvider>
                  <ErrorBoundary>
                    <AnimatedBackground />

                    <AppShell session={session}>
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </AppShell>
                  </ErrorBoundary>
                </PerformanceProvider>
              </RealtimeProvider>
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
