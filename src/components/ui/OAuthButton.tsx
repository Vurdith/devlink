"use client";

import { signIn } from "next-auth/react";
import { Button } from "./Button";

interface OAuthButtonProps {
  provider: "google" | "twitter" | "apple" | "roblox";
  children: React.ReactNode;
  className?: string;
}

const providerConfig = {
  google: {
    bgColor: "bg-white/[0.04] hover:bg-white/[0.08]",
    textColor: "text-white",
    borderColor: "border-white/[0.1] hover:border-white/20",
  },
  twitter: {
    bgColor: "bg-white/[0.04] hover:bg-white/[0.08]",
    textColor: "text-white",
    borderColor: "border-white/[0.1] hover:border-white/20",
  },
  apple: {
    bgColor: "bg-white/[0.04] hover:bg-white/[0.08]",
    textColor: "text-white",
    borderColor: "border-white/[0.1] hover:border-white/20",
  },
  roblox: {
    bgColor: "bg-[rgba(var(--color-accent-2-rgb),0.14)] hover:bg-[rgba(var(--color-accent-2-rgb),0.2)]",
    textColor: "text-white",
    borderColor: "border-[rgba(var(--color-accent-2-rgb),0.28)]",
  },
};

export function OAuthButton({ provider, children, className = "" }: OAuthButtonProps) {
  const config = providerConfig[provider];

  return (
    <Button
      type="button"
      onClick={() => signIn(provider, { callbackUrl: "/me" })}
      className={`w-full ${config.bgColor} ${config.textColor} ${config.borderColor} border shadow-none transition-all duration-200 ${className}`}
    >
      {children}
    </Button>
  );
}
