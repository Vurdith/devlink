export const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { key: "lowercase", label: "One lowercase letter", test: (password: string) => /[a-z]/.test(password) },
  { key: "uppercase", label: "One uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { key: "number", label: "One number", test: (password: string) => /\d/.test(password) },
];

export function validateRegisterUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim().toLowerCase();
  if (!trimmed) return { valid: false, error: "Username is required" };
  if (trimmed.length < 3) return { valid: false, error: "At least 3 characters" };
  if (trimmed.length > 30) return { valid: false, error: "Less than 30 characters" };
  if (!/^[a-z0-9_]+$/.test(trimmed)) return { valid: false, error: "Only letters, numbers, underscores" };
  if (trimmed.startsWith("_") || trimmed.endsWith("_")) return { valid: false, error: "Can't start/end with underscore" };
  return { valid: true };
}

export function validateRegisterEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "Email is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { valid: false, error: "Invalid email format" };
  if (trimmed.length > 254) return { valid: false, error: "Email too long" };
  return { valid: true };
}

export function getPasswordStrength(password: string) {
  return PASSWORD_REQUIREMENTS.filter((requirement) => requirement.test(password)).length;
}

export function getStrengthColor(passwordStrength: number) {
  if (passwordStrength === 0) return "bg-gray-600";
  if (passwordStrength === 1) return "bg-[rgba(var(--color-accent-rgb),0.42)]";
  if (passwordStrength === 2) return "bg-[rgba(var(--color-accent-rgb),0.62)]";
  if (passwordStrength === 3) return "bg-[rgba(var(--color-accent-2-rgb),0.72)]";
  return "bg-[var(--color-accent-2)]";
}
