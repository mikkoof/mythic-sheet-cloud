import * as React from "react";

import { cn } from "@/lib/utils";

type SheetSectionProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
};

export function SheetSection({
  title,
  eyebrow,
  children,
  footer,
  className,
  contentClassName,
  compact,
}: SheetSectionProps) {
  return (
    <section
      className={cn(
        "relative rounded-sm border-2 border-foreground/80 bg-background shadow-[inset_0_0_0_2px_var(--background),0_0_0_1px_var(--foreground)] text-foreground",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-1 rounded-sm ring-1 ring-foreground/30" />
      <header className="relative flex flex-col items-center justify-center gap-0.5 -mt-3.5">
        {eyebrow ? (
          <span className="bg-background px-2 text-[10px] font-heading uppercase tracking-[0.25em] text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="bg-background px-3 font-heading text-2xl leading-none tracking-wide text-foreground">
          {title}
        </h2>
      </header>
      <div
        className={cn(
          "relative",
          compact ? "px-3 pb-3 pt-2" : "px-4 pb-4 pt-3",
          contentClassName,
        )}
      >
        {children}
      </div>
      {footer ? (
        <footer className="relative border-t border-foreground/20 px-4 py-2 text-xs text-muted-foreground">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

type SheetSubheadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function SheetSubheading({ children, className }: SheetSubheadingProps) {
  return (
    <h3
      className={cn(
        "font-heading text-lg leading-none tracking-wide text-foreground",
        className,
      )}
    >
      {children}
    </h3>
  );
}
