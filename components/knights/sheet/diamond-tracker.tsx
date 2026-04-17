"use client";

import { cn } from "@/lib/utils";

type DiamondTrackerProps = {
  remaining: number;
  max: number;
  onChange?: (pair: { remaining: number; max: number }) => void;
  disabled?: boolean;
  min?: number;
  maxValue?: number;
  idPrefix: string;
  ariaLabel: string;
};

export function DiamondTracker({
  remaining,
  max,
  onChange,
  disabled,
  min = 0,
  maxValue = 99,
  idPrefix,
  ariaLabel,
}: DiamondTrackerProps) {
  const clamp = (n: number) => {
    if (Number.isNaN(n)) return 0;
    return Math.max(min, Math.min(maxValue, Math.floor(n)));
  };

  return (
    <div
      className="relative size-28 shrink-0"
      role="group"
      aria-label={ariaLabel}
    >
      <div className="absolute inset-1 rotate-45 border-[1.5px] border-foreground bg-background" />
      <div className="absolute inset-x-1 top-1/2 h-px -translate-y-px bg-foreground/70" />
      <div className="relative grid h-full grid-rows-2">
        <div className="flex flex-col items-center justify-end pb-0.5">
          <span className="pointer-events-none text-[9px] font-heading uppercase tracking-widest text-muted-foreground">
            Remaining
          </span>
          <input
            id={`${idPrefix}-remaining`}
            type="number"
            inputMode="numeric"
            min={min}
            max={maxValue}
            value={remaining}
            disabled={disabled}
            onChange={(e) =>
              onChange?.({ remaining: clamp(Number(e.target.value)), max })
            }
            className={cn(
              "sheet-number h-6 w-10 bg-transparent text-center font-heading text-lg tabular-nums outline-none",
              "focus-visible:ring-1 focus-visible:ring-primary rounded-sm",
              disabled ? "cursor-not-allowed" : "",
            )}
            aria-label={`${ariaLabel} remaining`}
          />
        </div>
        <div className="flex flex-col items-center justify-start pt-0.5">
          <input
            id={`${idPrefix}-max`}
            type="number"
            inputMode="numeric"
            min={min}
            max={maxValue}
            value={max}
            disabled={disabled}
            onChange={(e) =>
              onChange?.({ remaining, max: clamp(Number(e.target.value)) })
            }
            className={cn(
              "sheet-number h-6 w-10 bg-transparent text-center font-heading text-lg tabular-nums outline-none",
              "focus-visible:ring-1 focus-visible:ring-primary rounded-sm",
              disabled ? "cursor-not-allowed" : "",
            )}
            aria-label={`${ariaLabel} max`}
          />
          <span className="pointer-events-none text-[9px] font-heading uppercase tracking-widest text-muted-foreground">
            Maximum
          </span>
        </div>
      </div>
    </div>
  );
}
