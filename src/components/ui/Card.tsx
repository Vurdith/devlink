"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "gradient";
  hover?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, glow = false, children, ...props }, ref) => {
    const variants = {
      default: "glass border border-[var(--color-accent)]/10",
      elevated: "glass border border-[var(--color-accent)]/20 shadow-xl shadow-[var(--color-accent)]/10",
      bordered: "glass border border-[var(--color-accent)]/20",
      gradient: "glass border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-accent)]/5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-200",
          variants[variant],
          hover && "hover:bg-[var(--color-accent)]/[0.08] hover:border-[var(--color-accent)]/30 hover:-translate-y-1 cursor-pointer",
          glow && "shadow-lg shadow-[var(--color-accent)]/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "mb-4 flex items-center justify-between",
        className
      )} 
      {...props} 
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={cn(
        "text-lg font-semibold text-white font-[var(--font-space-grotesk)]",
        className
      )} 
      {...props} 
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn(
        "text-sm text-[var(--muted-foreground)]",
        className
      )} 
      {...props} 
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "text-sm text-[var(--muted-foreground)]",
        className
      )} 
      {...props} 
    />
  );
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "mt-4 pt-4 border-t border-[var(--color-accent)]/20 flex items-center justify-between",
        className
      )} 
      {...props} 
    />
  );
}

// Specialized card variants
export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className,
  ...props 
}: CardProps & { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card hover variant="bordered" className={cn("group", className)} {...props}>
      <div className="mb-4 inline-flex p-3 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/25 transition-colors">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-2">{description}</CardDescription>
    </Card>
  );
}

export function StatCard({
  value,
  label,
  icon,
  trend,
  className,
  ...props
}: CardProps & {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card variant="bordered" className={className} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-white font-[var(--font-space-grotesk)]">
            {value}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{label}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              trend.positive ? "text-green-400" : "text-red-400"
            )}>
              <svg 
                className={cn("w-3 h-3", !trend.positive && "rotate-180")} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
