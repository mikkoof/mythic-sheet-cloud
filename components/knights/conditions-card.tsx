import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export const CONDITION_TEXT = {
  fatigued: "Marker — fills a Property slot until cleared by rest.",
  exhausted: "Cannot Attack if you moved this turn.",
  exposed: "Treated as having 0 Guard.",
  impaired: "Attacks use a single d4.",
} as const;

type ConditionKey = keyof typeof CONDITION_TEXT;

type ConditionsCardProps = {
  fatigued: boolean;
  exposed: boolean;
  exhausted: boolean;
  impaired: boolean;
  onChange: (patch: Partial<Record<ConditionKey, boolean>>) => void;
  canEdit: boolean;
};

const ORDER: ConditionKey[] = ["fatigued", "exhausted", "exposed", "impaired"];
const LABELS: Record<ConditionKey, string> = {
  fatigued: "Fatigued",
  exhausted: "Exhausted",
  exposed: "Exposed",
  impaired: "Impaired",
};

export function ConditionsCard({
  fatigued,
  exposed,
  exhausted,
  impaired,
  onChange,
  canEdit,
}: ConditionsCardProps) {
  const values: Record<ConditionKey, boolean> = {
    fatigued,
    exhausted,
    exposed,
    impaired,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ORDER.map((key) => {
          const id = `condition-${key}`;
          const checked = values[key];
          return (
            <div key={key} className="flex items-start gap-3">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(v) =>
                  onChange({ [key]: v === true } as Partial<
                    Record<ConditionKey, boolean>
                  >)
                }
                disabled={!canEdit}
                className="mt-0.5"
              />
              <input
                type="hidden"
                name={key}
                value={checked ? "on" : ""}
                readOnly
              />
              <div className="flex-1">
                <label
                  htmlFor={id}
                  className="font-heading text-sm tracking-wide"
                >
                  {LABELS[key]}
                </label>
                <p className="text-xs text-muted-foreground">
                  {CONDITION_TEXT[key]}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
