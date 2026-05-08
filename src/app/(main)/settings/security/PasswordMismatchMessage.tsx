export function PasswordMismatchMessage() {
  return (
    <p className="text-xs text-[var(--color-accent)] mt-2 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Passwords do not match
    </p>
  );
}
