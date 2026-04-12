import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface VeteranBadgeProps {
  size?: "sm" | "md" | "lg";
  sdvosb?: boolean;
  className?: string;
}

export function VeteranBadge({ size = "md", sdvosb = false, className }: VeteranBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };
  const iconSize = { sm: "h-2.5 w-2.5", md: "h-3 w-3", lg: "h-4 w-4" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        "border-amber-500/40 bg-amber-500/10 text-amber-400",
        sizeClasses[size],
        className
      )}
    >
      <Shield className={iconSize[size]} />
      {sdvosb ? "SDVOSB" : "Veteran-Owned"}
    </span>
  );
}
