"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { OAuthButton } from "@/components/ui/OAuthButton";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/me" });
      if ((res as any)?.error) setError((res as any).error as string);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="relative overflow-hidden rounded-[var(--radius)] mb-6">
        <div className="absolute -top-20 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent-2) 0%, transparent 70%)" }} />
        <div className="glass p-6">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Welcome back. Access your DevLink workspace.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="glass rounded-[var(--radius)] p-6 space-y-4 glow">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            autoComplete="email"
            className="w-full h-10 px-3 rounded-md bg-black/30 border border-white/10 outline-none focus:border-[var(--accent)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full h-10 px-3 rounded-md bg-black/30 border border-white/10 outline-none focus:border-[var(--accent)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button type="submit" isLoading={loading} className="w-full">Continue</Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <OAuthButton provider="google">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </div>
          </OAuthButton>
          
          <OAuthButton provider="apple">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </div>
          </OAuthButton>
        </div>

        <div className="text-xs text-[var(--muted-foreground)] text-center">
          No account? <Link href="/register" className="text-[var(--accent)] hover:underline">Create one</Link>
        </div>
      </form>
    </main>
  );
}
