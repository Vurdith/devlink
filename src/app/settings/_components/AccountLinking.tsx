"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

interface LinkedAccount {
  provider: string;
  providerAccountId: string;
  type: string;
}

const providers = [
  {
    id: "google",
    name: "Google",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bgColor: "bg-white",
  },
  {
    id: "apple",
    name: "Apple",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    bgColor: "bg-black",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    bgColor: "bg-black",
  }
];

export default function AccountLinking() {
  const { update } = useSession();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch("/api/auth/linked-accounts");
      if (response.ok) {
        const accounts = await response.json();
        setLinkedAccounts(accounts);
      }
    } catch (error) {
      console.error("Error fetching linked accounts:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const linkAccount = async (provider: string) => {
    setLoading(provider);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to link account");
      }

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const unlinkAccount = async (provider: string) => {
    setLoading(provider);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/link-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unlink account");
      }

      await fetchLinkedAccounts();
      await update();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const isAccountLinked = (provider: string) => {
    return linkedAccounts.some(account => account.provider === provider);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/25">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Link accounts for easier sign-in</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Provider List */}
      <div className="space-y-3">
        {isInitialLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10" />
                <div>
                  <div className="h-5 w-20 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
              </div>
              <div className="h-8 w-20 bg-white/10 rounded-lg" />
            </div>
          ))
        ) : providers.map((provider, index) => {
          const linked = isAccountLinked(provider.id);
          const isLoading = loading === provider.id;
          
          return (
            <div
              key={provider.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all animate-slide-up",
                linked 
                  ? "bg-red-600/10 border-red-600/30" 
                  : "bg-white/5 border-white/10 hover:bg-red-600/5 hover:border-red-600/20"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                {/* Provider Icon */}
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", provider.bgColor)}>
                  {provider.icon}
                </div>
                
                {/* Info */}
                <div>
                  <div className="font-medium text-white">{provider.name}</div>
                  <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                    {linked ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        <span className="text-red-500">Connected</span>
                      </>
                    ) : (
                      "Not connected"
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Button
                variant={linked ? "ghost" : "secondary"}
                size="sm"
                onClick={() => linked ? unlinkAccount(provider.id) : linkAccount(provider.id)}
                isLoading={isLoading}
                className={cn(
                  linked && "text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                {linked ? "Disconnect" : "Connect"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
