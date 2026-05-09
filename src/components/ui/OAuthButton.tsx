"use client";

import { signIn } from "next-auth/react";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

interface OAuthButtonProps {
  provider: "google" | "twitter" | "apple" | "roblox";
  children: React.ReactNode;
  className?: string;
}

const providerConfig = {
  google: {
    bgColor: "bg-white/[0.035] hover:bg-white/[0.065]",
    textColor: "text-white",
    borderColor: "border-white/[0.10] hover:border-white/[0.18]",
  },
  twitter: {
    bgColor: "bg-white/[0.035] hover:bg-white/[0.065]",
    textColor: "text-white",
    borderColor: "border-white/[0.10] hover:border-white/[0.18]",
  },
  apple: {
    bgColor: "bg-white/[0.035] hover:bg-white/[0.065]",
    textColor: "text-white",
    borderColor: "border-white/[0.10] hover:border-white/[0.18]",
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
      className={cn("w-full border transition-all duration-200", config.bgColor, config.textColor, config.borderColor, className)}
    >
      {children}
    </Button>
  );
}
