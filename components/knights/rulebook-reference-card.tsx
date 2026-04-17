import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PANELS = [
  {
    title: "Feats",
    body:
      "Attempt a heroic effort tied to your Knight's stat. Describe the feat, roll the appropriate stat — a pass carries the action.",
  },
  {
    title: "Gambits",
    body:
      "Spend Spirit to bend a roll: gain a re-roll, boost your die, or disrupt an enemy. The GM weighs the fiction.",
  },
  {
    title: "Recovery",
    body:
      "A short rest clears Fatigue. A long rest restores stats to Max. Oaths and Seats can heal deeper harms.",
  },
  {
    title: "Oath",
    body:
      "Your Knight's sacred vow. Breaking it drains Spirit and Glory; fulfilling it earns Glory.",
  },
];

export function RulebookReferenceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Rulebook Reference
        </CardTitle>
        <CardDescription>
          Short reminders — see the Mythic Bastionland rulebook for the full
          rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {PANELS.map((p) => (
          <div
            key={p.title}
            className="rounded-md border border-border bg-muted/40 p-3"
          >
            <h3 className="font-heading text-sm tracking-wide">{p.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
