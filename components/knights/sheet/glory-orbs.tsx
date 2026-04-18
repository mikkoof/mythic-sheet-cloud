"use client";

import { cn } from "@/lib/utils";

type GloryOrbsProps = {
  filled: number;
  total?: number;
  onOrbClick?: (index: number) => void;
  disabled?: boolean;
  firstIsDiamond?: boolean;
  showFinalDiamond?: boolean;
  className?: string;
  size?: "sm" | "md";
  ariaLabelForIndex?: (index: number) => string;
};

const CIRCLE: Record<NonNullable<GloryOrbsProps["size"]>, string> = {
  sm: "size-2.5",
  md: "size-3",
};

const DIAMOND: Record<NonNullable<GloryOrbsProps["size"]>, string> = {
  sm: "size-2",
  md: "size-2.5",
};

export function GloryOrbs({
  filled,
  total = 3,
  onOrbClick,
  disabled,
  firstIsDiamond = false,
  showFinalDiamond = false,
  className,
  size = "md",
  ariaLabelForIndex,
}: GloryOrbsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const isDiamond =
          (firstIsDiamond && i === 0) ||
          (showFinalDiamond && i === total - 1);
        const isFilled = i < filled;
        const interactive = onOrbClick && !disabled;
        const common = cn(
          "border-[1.5px] border-foreground transition-colors",
          isDiamond
            ? cn("rotate-45", DIAMOND[size])
            : cn("rounded-full", CIRCLE[size]),
          isFilled ? "bg-foreground" : "bg-background",
          interactive ? "cursor-pointer hover:ring-1 hover:ring-primary" : "",
          disabled ? "opacity-50" : "",
        );
        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              aria-label={ariaLabelForIndex?.(i) ?? `Set to ${i + 1}`}
              className={common}
              onClick={() => onOrbClick?.(i)}
            />
          );
        }
        return <span key={i} aria-hidden className={common} />;
      })}
    </div>
  );
}
