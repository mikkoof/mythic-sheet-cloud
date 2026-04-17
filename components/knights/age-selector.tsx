import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { KnightAge } from "@/lib/validators/knight";

type AgeSelectorProps = {
  age: KnightAge;
  onChange: (age: KnightAge) => void;
  canEdit: boolean;
};

const OPTIONS: { value: KnightAge; label: string }[] = [
  { value: "young", label: "Young" },
  { value: "mature", label: "Mature" },
  { value: "old", label: "Old" },
];

export function AgeSelector({ age, onChange, canEdit }: AgeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">Age</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label="Age"
          className="grid grid-cols-3 gap-2"
        >
          {OPTIONS.map(({ value, label }) => {
            const id = `age-${value}`;
            const selected = age === value;
            return (
              <label
                key={value}
                htmlFor={id}
                className={
                  "cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition " +
                  (selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-muted text-muted-foreground") +
                  (canEdit ? " hover:border-primary/60" : " cursor-not-allowed opacity-60")
                }
              >
                <input
                  id={id}
                  type="radio"
                  name="age"
                  value={value}
                  checked={selected}
                  onChange={() => onChange(value)}
                  disabled={!canEdit}
                  className="sr-only"
                />
                {label}
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
