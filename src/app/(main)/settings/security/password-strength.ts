export const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"] as const;

export const strengthColors = [
  "bg-[rgba(var(--color-accent-rgb),0.36)]",
  "bg-[rgba(var(--color-accent-rgb),0.52)]",
  "bg-[rgba(var(--color-accent-rgb),0.68)]",
  "bg-[rgba(var(--color-accent-2-rgb),0.78)]",
  "bg-[var(--color-accent-2)]",
] as const;

export function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
