import type { NotificationType } from "./notification-types";

export function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--color-accent)] text-white">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function TypeIcon({ type }: { type: NotificationType }) {
  const common = "w-[18px] h-[18px]";
  const small = "w-[16px] h-[16px]";

  switch (type) {
    case "LIKE":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s-7-4.4-9.5-8.6C.8 9.3 2.6 6 6 6c1.9 0 3.1 1 4 2.1C10.9 7 12.1 6 14 6c3.4 0 5.2 3.3 3.5 6.4C19 16.6 12 21 12 21Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );
    case "REPOST":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h11v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M18 12l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M17 17H6v-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M6 12l-2 2m2-2l2 2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "REPLY":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 9V5l-7 7 7 7v-4c7 0 10 2 11 6-1-8-4-12-11-12Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );
    case "FOLLOW":
      return (
        <svg className={small} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
          <path d="M19 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "MENTION":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 8a4 4 0 1 0 0 8c1.7 0 3.1-1.2 3.6-2.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M20 12v-1a8 8 0 1 0 2.3 5.7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export function typeBadgeClasses(type: NotificationType) {
  switch (type) {
    case "LIKE":
      return "text-rose-300 border-rose-400/50";
    case "REPOST":
      return "text-emerald-300 border-emerald-400/50";
    case "REPLY":
      return "text-blue-300 border-blue-400/50";
    case "FOLLOW":
      return "text-violet-300 border-violet-400/50";
    case "MENTION":
      return "text-amber-300 border-amber-400/50";
  }
}
