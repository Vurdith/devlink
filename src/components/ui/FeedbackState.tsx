import { Button } from "@/components/ui/Button";
import { ActionLink } from "@/components/ui/ActionLink";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { iconBox, surface } from "./design-system";

interface FeedbackStateProps {
  title: string;
  description?: string;
  icon: ReactNode;
  tone?: "neutral" | "danger";
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function FeedbackState({
  title,
  description,
  icon,
  tone = "neutral",
  action,
  className,
}: FeedbackStateProps) {
  const danger = tone === "danger";

  return (
    <div
      className={surface(
        "empty",
        cn(
          "noise-overlay relative overflow-hidden px-6 py-12 text-center text-[var(--muted-foreground)]",
          danger && "border-rose-400/20 bg-rose-500/[0.045]",
          className
        )
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          danger ? "via-rose-300/40" : "via-[rgba(var(--color-accent-2-rgb),0.42)]"
        )}
      />
      <div
        className={iconBox(
          danger ? "danger" : "muted",
          "mx-auto mb-4 h-14 w-14 text-white/55 [&>svg]:h-7 [&>svg]:w-7"
        )}
      >
        {icon}
      </div>
      <h3 className={cn("text-lg font-semibold text-white", danger && "text-rose-100")}>{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed">{description}</p> : null}
      {action ? (
        <div className="mt-5">
          {action.href ? (
            <ActionLink href={action.href} variant="primary">
              {action.label}
            </ActionLink>
          ) : (
            <Button onClick={action.onClick} variant={danger ? "secondary" : "primary"} size="md">
              {action.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface LoadMoreButtonProps {
  loading: boolean;
  onClick: () => void;
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export function LoadMoreButton({
  loading,
  onClick,
  label = "Load more",
  loadingLabel = "Loading...",
  className,
}: LoadMoreButtonProps) {
  return (
    <div className={cn("flex justify-center pt-6", className)}>
      <Button onClick={onClick} disabled={loading} isLoading={loading} variant="secondary" size="lg">
        {loading ? loadingLabel : label}
      </Button>
    </div>
  );
}
