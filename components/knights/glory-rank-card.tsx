"use client";

import { Button } from "@/components/ui/button";
import { GloryOrbs } from "@/components/knights/sheet/glory-orbs";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { cn } from "@/lib/utils";
import {
  GLORY_MAX,
  RANKS,
  TIER_FIRST_DOT,
  WORTHY_TO,
  rankFromGlory,
} from "@/lib/rank";

type GloryRankCardProps = {
  glory: number;
  onChange: (glory: number) => void;
  canEdit: boolean;
};

const WORTHY_LABEL: Record<(typeof RANKS)[number], string> = {
  "Knight Errant": "Lead a Warband",
  "Knight Gallant": "Serve in Court or Council",
  "Knight Tenant": "Rule a Holding",
  "Knight Dominant": "Rule a Seat of Power",
  "Knight Radiant": "Seek the City",
};

export function GloryRankCard({
  glory,
  onChange,
  canEdit,
}: GloryRankCardProps) {
  const clamped = Math.max(0, Math.min(GLORY_MAX, Math.floor(glory)));
  const currentRank = rankFromGlory(clamped).name;

  const dec = () => onChange(Math.max(0, clamped - 1));
  const inc = () => onChange(Math.min(GLORY_MAX, clamped + 1));

  return (
    <SheetSection title="Glory" eyebrow="Ranked · Worthy to">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 items-center text-sm">
        <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground text-center">
          Glory
        </div>
        <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">
          Ranked
        </div>
        <div className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">
          Worthy to
        </div>
        {RANKS.map((rank, tierIdx) => {
          const firstDot = TIER_FIRST_DOT[tierIdx];
          const nextFirstDot =
            TIER_FIRST_DOT[tierIdx + 1] ?? GLORY_MAX + 1;
          const markers = nextFirstDot - firstDot;
          const filled = Math.max(
            0,
            Math.min(markers, clamped - firstDot + 1),
          );
          const isCurrent = rank === currentRank;
          return (
            <div key={rank} className="contents">
              <div
                className={cn(
                  "flex justify-center py-1 px-1 rounded-sm",
                  isCurrent ? "bg-accent/30" : "",
                )}
              >
                <GloryOrbs
                  filled={filled}
                  total={markers}
                  firstIsDiamond
                  onOrbClick={
                    canEdit ? (i) => onChange(firstDot + i) : undefined
                  }
                  ariaLabelForIndex={(i) =>
                    `Set glory to ${firstDot + i}`
                  }
                  disabled={!canEdit}
                />
              </div>
              <div
                className={cn(
                  "py-1 font-heading tracking-wide",
                  isCurrent
                    ? "bg-accent/30 text-foreground"
                    : "text-foreground/80",
                )}
              >
                {rank.replace(" ", "-")}
              </div>
              <div
                className={cn(
                  "py-1 text-xs",
                  isCurrent
                    ? "bg-accent/30 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {WORTHY_LABEL[rank]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-foreground/20 pt-2">
        <span className="text-xs text-muted-foreground">
          {WORTHY_TO[currentRank]}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={dec}
            disabled={!canEdit || clamped <= 0}
            aria-label="Decrease glory"
          >
            −
          </Button>
          <div
            className="min-w-10 rounded-sm border border-foreground/60 bg-background px-2 py-0.5 text-center font-heading text-lg tabular-nums"
            aria-live="polite"
          >
            {clamped}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={inc}
            disabled={!canEdit || clamped >= 12}
            aria-label="Increase glory"
          >
            +
          </Button>
        </div>
      </div>
      <input type="hidden" name="glory" value={clamped} readOnly />
    </SheetSection>
  );
}
