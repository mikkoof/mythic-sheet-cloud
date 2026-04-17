"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ProtectiveArticles } from "@/lib/validators/knight";

type ProtectiveArticlesCardProps = {
  protectiveArticles: ProtectiveArticles;
  onChange: (articles: ProtectiveArticles) => void;
  canEdit: boolean;
};

type SlotKey = "shield" | "coat" | "helm" | "plate";

const SLOTS: readonly { key: SlotKey; label: string }[] = [
  { key: "shield", label: "Shield" },
  { key: "coat", label: "Coat" },
  { key: "helm", label: "Helm" },
  { key: "plate", label: "Plate" },
];

export function ProtectiveArticlesCard({
  protectiveArticles,
  onChange,
  canEdit,
}: ProtectiveArticlesCardProps) {
  const base = SLOTS.reduce(
    (acc, { key }) => acc + (protectiveArticles[key] ? 1 : 0),
    0,
  );
  const total = base + protectiveArticles.extra;

  const patch = (p: Partial<ProtectiveArticles>) =>
    onChange({ ...protectiveArticles, ...p });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Protective Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {SLOTS.map(({ key, label }) => {
            const id = `armour-${key}`;
            const checked = protectiveArticles[key];
            return (
              <label
                key={key}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background/40 px-3 py-2"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(v) => patch({ [key]: Boolean(v) })}
                  disabled={!canEdit}
                />
                <span className="flex-1 font-heading text-sm tracking-wide">
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">+1</span>
              </label>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Label
            htmlFor="armour-extra"
            className="font-heading text-sm tracking-wide"
          >
            Extra
          </Label>
          <Input
            id="armour-extra"
            type="number"
            value={protectiveArticles.extra}
            onChange={(e) =>
              patch({ extra: Number(e.target.value) || 0 })
            }
            disabled={!canEdit}
            className="w-20 text-center tabular-nums"
          />
          <span className="text-xs text-muted-foreground">
            positive or negative
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <Label className="font-heading tracking-wide">Total Armour</Label>
          <span className="font-heading text-lg tabular-nums">{total}</span>
        </div>
        <input
          type="hidden"
          name="protectiveArticles"
          value={JSON.stringify(protectiveArticles)}
          readOnly
        />
      </CardContent>
    </Card>
  );
}
