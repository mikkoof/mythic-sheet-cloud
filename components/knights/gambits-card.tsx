import { SheetSection } from "@/components/knights/sheet/sheet-section";

const GAMBITS: { name: string; body: string; onTheirNextTurn?: boolean }[] = [
  { name: "Bolster", body: "for +1 total damage" },
  {
    name: "Move",
    body: "after the attack, even if you otherwise couldn't",
  },
  { name: "Repel", body: "a foe away from you" },
  { name: "Stop", body: "a foe from moving", onTheirNextTurn: true },
  { name: "Impair", body: "a foe's weapon", onTheirNextTurn: true },
  { name: "Trap", body: "a foe's shield", onTheirNextTurn: true },
  { name: "Dismount", body: "a foe (+D6 damage)" },
];

export function GambitsCard() {
  return (
    <SheetSection title="Gambits">
      <p className="text-xs text-muted-foreground">
        Spend an Attack die of 4+ to perform a Gambit:
      </p>
      <ul className="mt-2 space-y-1">
        {GAMBITS.map((g) => (
          <li
            key={g.name}
            className="rounded-sm bg-muted/40 px-2 py-1 text-sm"
          >
            <span className="font-heading uppercase tracking-wide">
              {g.name}
            </span>{" "}
            <span className="text-muted-foreground">
              {g.body}
              {g.onTheirNextTurn ? <span aria-hidden>*</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1 text-[11px] leading-snug text-muted-foreground">
        <p>
          <span aria-hidden>*</span>On their next turn
        </p>
        <p>
          All but <span className="font-heading">Bolster</span> and{" "}
          <span className="font-heading">Move</span> allow a VIG save to resist
        </p>
        <p>
          A die of 8+ is a <span className="font-heading">Strong Gambit</span>,
          denying a save or inflicting a greater effect
        </p>
      </div>
    </SheetSection>
  );
}
