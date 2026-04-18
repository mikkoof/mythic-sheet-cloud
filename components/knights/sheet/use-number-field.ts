"use client";

import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";

type UseNumberFieldArgs = {
  value: number;
  onCommit: (next: number) => void;
  min?: number;
  max?: number;
};

export function useNumberField({
  value,
  onCommit,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
}: UseNumberFieldArgs) {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const n = Number(text);
    if (!Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    const clamped = Math.max(min, Math.min(max, Math.floor(n)));
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return {
    value: text,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setText(e.target.value),
    onBlur: commit,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
  };
}
