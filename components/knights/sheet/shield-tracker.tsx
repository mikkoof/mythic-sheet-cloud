"use client";

import { cn } from "@/lib/utils";

type ShieldTrackerPairProps = {
  variant: "pair";
  remaining: number;
  max: number;
  onChange?: (pair: { remaining: number; max: number }) => void;
  disabled?: boolean;
  min?: number;
  maxValue?: number;
  idPrefix: string;
  ariaLabel: string;
};

type ShieldTrackerSingleProps = {
  variant: "single";
  value: number;
  ariaLabel: string;
  idPrefix?: string;
};

type ShieldTrackerProps = ShieldTrackerPairProps | ShieldTrackerSingleProps;

const SHIELD_PATH =
  "M50 4 C30 4 10 10 6 16 L6 46 C6 74 30 96 50 108 C70 96 94 74 94 46 L94 16 C90 10 70 4 50 4 Z";

export function ShieldTracker(props: ShieldTrackerProps) {
  return (
    <div
      className="relative h-28 w-24 shrink-0"
      role="group"
      aria-label={props.ariaLabel}
    >
      <svg
        viewBox="0 0 100 112"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d={SHIELD_PATH}
          fill="var(--background)"
          stroke="var(--foreground)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity="0.3"
          strokeWidth="1"
          transform="translate(0 0) scale(0.88) translate(6.8 7.5)"
        />
      </svg>
      {props.variant === "pair" ? <PairBody {...props} /> : <SingleBody {...props} />}
    </div>
  );
}

function PairBody({
  remaining,
  max,
  onChange,
  disabled,
  min = 0,
  maxValue = 99,
  idPrefix,
  ariaLabel,
}: ShieldTrackerPairProps) {
  const clamp = (n: number) => {
    if (Number.isNaN(n)) return 0;
    return Math.max(min, Math.min(maxValue, Math.floor(n)));
  };

  return (
    <div className="relative grid h-full grid-rows-2 pt-4 pb-3">
      <div className="flex flex-col items-center justify-end">
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
      <div className="flex flex-col items-center justify-start">
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
  );
}

function SingleBody({ value }: ShieldTrackerSingleProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center pb-4">
      <span className="font-heading text-3xl tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
