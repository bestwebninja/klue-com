import { ReactNode } from "react";

type SectionHeaderTone = "default" | "inverse";

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  align?: "center" | "left";
  tone?: SectionHeaderTone;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  align = "center",
  tone = "default",
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const titleColor = tone === "inverse" ? "text-white" : "text-foreground";
  const subtitleColor = tone === "inverse" ? "text-white/80" : "text-muted-foreground";

  return (
    <div className={`${isCenter ? "text-center" : "text-left"} ${className}`.trim()}>
      {eyebrow && (
        <div
          className={`text-sm md:text-base font-semibold tracking-[0.18em] uppercase ${
            tone === "inverse" ? "text-primary-foreground/80" : "text-primary"
          }`}
        >
          {eyebrow}
        </div>
      )}

      <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${titleColor} mt-2`}>
        {title}
      </h2>

      {subtitle && (
        <p
          className={`text-base md:text-lg ${subtitleColor} mt-3 ${
            isCenter ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
