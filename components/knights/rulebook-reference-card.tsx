import { SheetSection } from "@/components/knights/sheet/sheet-section";

export function OathCard() {
  return (
    <SheetSection title="The Oath" eyebrow="Sworn To Follow">
      <ul className="space-y-1 text-center font-heading uppercase tracking-wider text-sm">
        <li>Seek the Myths</li>
        <li>Honor the Seers</li>
        <li>Protect the Realm</li>
      </ul>
      <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
        A short rest clears Fatigue. A long rest restores stats to Max. Oaths
        and Seats can heal deeper harms.
      </p>
    </SheetSection>
  );
}
