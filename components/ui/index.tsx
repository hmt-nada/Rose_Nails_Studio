import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

/** Small all-caps eyebrow label above section headings */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "font-body text-xs tracking-[0.3em] uppercase text-deep-rose",
        className
      )}
    >
      {children}
    </span>
  );
}

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}

/** Cormorant Garamond section title */
export function SectionHeading({ children, className, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-5xl xl:text-6xl font-light text-plum",
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

/** Reusable glass-effect card */
export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn("glass rounded-2xl", className)}>
      {children}
    </div>
  );
}
