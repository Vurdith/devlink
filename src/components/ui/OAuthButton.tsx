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
    bgColor: "bg-white hover:bg-gray-50",
    textColor: "text-gray-900",
    borderColor: "border-gray-300",
  },
  twitter: {
    bgColor: "bg-black hover:bg-gray-900",
    textColor: "text-white",
    borderColor: "border-gray-800",
  },
  apple: {
    bgColor: "bg-black hover:bg-gray-900",
    textColor: "text-white",
    borderColor: "border-gray-800",
  },
  roblox: {
    bgColor: "bg-[#00A2FF] hover:bg-[#0088CC]",
    textColor: "text-white",
    borderColor: "border-[#00A2FF]",
  },
};

export function OAuthButton({ provider, children, className = "" }: OAuthButtonProps) {
  const config = providerConfig[provider];

  return (
    <Button
      type="button"
      onClick={() => signIn(provider, { callbackUrl: "/me" })}
      className={`w-full ${config.bgColor} ${config.textColor} ${config.borderColor} border transition-all duration-200 ${className}`}
    >
      {children}
    </Button>
  );
}
