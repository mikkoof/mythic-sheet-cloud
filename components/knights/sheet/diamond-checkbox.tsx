"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DiamondCheckboxProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  id?: string;
};

export function DiamondCheckbox({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
  id,
}: DiamondCheckboxProps) {
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
        "inline-flex size-5 rotate-45 shrink-0 items-center justify-center border-[1.5px] border-foreground bg-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block size-2.5 transition-opacity",
          checked ? "bg-foreground opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
