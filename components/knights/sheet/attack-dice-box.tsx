"use client";

import { cn } from "@/lib/utils";

type AttackDiceBoxProps = {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
};

export function AttackDiceBox({
  value,
  onChange,
  disabled,
  id,
  ariaLabel,
  className,
}: AttackDiceBoxProps) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      maxLength={8}
      disabled={disabled}
      aria-label={ariaLabel ?? "Attack dice"}
      placeholder="d8"
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "h-8 w-14 rounded-sm border-[1.5px] border-foreground bg-background px-1.5 text-center font-heading text-base tabular-nums outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
    />
  );
}
