"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type CircleCheckboxProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
  id?: string;
};

const SIZE: Record<NonNullable<CircleCheckboxProps["size"]>, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

const INNER: Record<NonNullable<CircleCheckboxProps["size"]>, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

export function CircleCheckbox({
  checked,
  onCheckedChange,
  disabled,
  size = "md",
  className,
  "aria-label": ariaLabel,
  id,
}: CircleCheckboxProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onCheckedChange?.(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      onKeyDown={handleKey}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-foreground bg-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-muted",
        SIZE[size],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block rounded-full bg-foreground transition-opacity",
          INNER[size],
          checked ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
