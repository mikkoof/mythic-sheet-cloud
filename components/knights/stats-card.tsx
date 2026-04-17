import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StatPair = { remaining: number; max: number };

type StatsCardProps = {
  vig: StatPair;
  cla: StatPair;
  spi: StatPair;
  guard: StatPair;
  vigTraits: string[];
  claTraits: string[];
  spiTraits: string[];
  onChange: (patch: {
    vig?: StatPair;
    cla?: StatPair;
    spi?: StatPair;
    guard?: StatPair;
    vigTraits?: string[];
    claTraits?: string[];
    spiTraits?: string[];
  }) => void;
  canEdit: boolean;
};

type StatKey = "vig" | "cla" | "spi" | "guard";
type TraitKey = "vigTraits" | "claTraits" | "spiTraits";

type StatRow = {
  key: StatKey;
  label: string;
  hint: string;
  traitKey?: TraitKey;
  placeholders?: readonly [string, string, string];
};

const STATS: readonly StatRow[] = [
  {
    key: "vig",
    label: "VIG",
    hint: "Vigour",
    traitKey: "vigTraits",
    placeholders: ["Strong Limbs", "Firm Hands", "Powerful Lungs"],
  },
  {
    key: "cla",
    label: "CLA",
    hint: "Clarity",
    traitKey: "claTraits",
    placeholders: ["Keen Instinct", "Lucid Mind", "Shrewd Eyes"],
  },
  {
    key: "spi",
    label: "SPI",
    hint: "Spirit",
    traitKey: "spiTraits",
    placeholders: ["Charming Tongue", "Iron Will", "Fierce Heart"],
  },
  {
    key: "guard",
    label: "Guard",
    hint: "Soaks hits before stats take damage",
  },
];

const STAT_MIN = 2;
const STAT_MAX = 18;
const LABEL_WIDTH = "7rem";

export function StatsCard({
  vig,
  cla,
  spi,
  guard,
  vigTraits,
  claTraits,
  spiTraits,
  onChange,
  canEdit,
}: StatsCardProps) {
  const values: Record<StatKey, StatPair> = { vig, cla, spi, guard };
  const traits: Record<TraitKey, string[]> = {
    vigTraits,
    claTraits,
    spiTraits,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="flex items-end gap-3 text-xs uppercase tracking-wider text-muted-foreground"
          style={{ paddingLeft: LABEL_WIDTH }}
        >
          <span className="w-16 text-center">Remaining</span>
          <span className="w-3" />
          <span className="w-16 text-center">Max</span>
        </div>
        {STATS.map(({ key, label, hint, traitKey, placeholders }) => {
          const v = values[key];
          const idRemaining = `stat-${key}-remaining`;
          const idMax = `stat-${key}-max`;
          const t = traitKey ? traits[traitKey] : null;
          const isGuard = key === "guard";
          const min = isGuard ? 0 : STAT_MIN;
          const max = isGuard ? 99 : STAT_MAX;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-3">
                <div
                  className="shrink-0"
                  style={{ width: LABEL_WIDTH }}
                >
                  <Label
                    htmlFor={idRemaining}
                    className="font-heading text-lg tracking-wide"
                  >
                    {label}
                  </Label>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    {hint}
                  </p>
                </div>
                <Input
                  id={idRemaining}
                  name={`${key}Remaining`}
                  type="number"
                  min={min}
                  max={max}
                  value={v.remaining}
                  onChange={(e) =>
                    onChange({
                      [key]: { ...v, remaining: Number(e.target.value) || 0 },
                    } as Partial<StatsCardProps>)
                  }
                  disabled={!canEdit}
                  className="w-16 text-center tabular-nums"
                />
                <span className="text-lg text-muted-foreground">/</span>
                <Input
                  id={idMax}
                  name={`${key}Max`}
                  type="number"
                  min={min}
                  max={max}
                  value={v.max}
                  onChange={(e) =>
                    onChange({
                      [key]: { ...v, max: Number(e.target.value) || 0 },
                    } as Partial<StatsCardProps>)
                  }
                  disabled={!canEdit}
                  className="w-16 text-center tabular-nums"
                />
              </div>
              {traitKey && t && placeholders ? (
                <>
                  <p
                    className="text-sm italic text-muted-foreground"
                    style={{ paddingLeft: LABEL_WIDTH }}
                  >
                    {placeholders.join(" · ")}
                  </p>
                  <input
                    type="hidden"
                    name={traitKey}
                    value={JSON.stringify(t)}
                    readOnly
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
