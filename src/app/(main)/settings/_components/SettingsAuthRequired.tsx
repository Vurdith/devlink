import { FeedbackState } from "@/components/ui/FeedbackState";

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 15v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsAuthRequired({
  title = "Sign in to manage settings",
  description = "Your account controls are private. Sign in to update preferences, security, and connected accounts.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <FeedbackState
      icon={<LockIcon />}
      title={title}
      description={description}
      action={{ label: "Sign in", href: "/login?callbackUrl=/settings" }}
      className="py-14"
    />
  );
}
