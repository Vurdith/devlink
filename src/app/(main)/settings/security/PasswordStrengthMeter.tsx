import { cn } from "@/lib/cn";
import { getPasswordStrength, strengthColors, strengthLabels } from "./password-strength";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const strengthColor = strengthColors[strength - 1] ?? "bg-white/10";
  const label = strengthLabels[strength - 1] ?? "Enter a password";

  return (
    <div className="mt-3">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", strength >= level ? strengthColor : "bg-white/10")}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">{label} password</p>
    </div>
  );
}
