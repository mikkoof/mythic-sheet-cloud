import { cn } from "@/lib/utils";
import type { KnightStatus } from "@/lib/validators/knight";

type StatusBannerProps = {
  status: KnightStatus;
  ultimateFate?: string | null;
};

export function StatusBanner({ status, ultimateFate }: StatusBannerProps) {
  if (status === "active") return null;

  const dead = status === "dead";
  return (
    <div
      role="status"
      className={cn(
        "rounded-sm border-2 px-4 py-3 text-sm shadow-[inset_0_0_0_2px_var(--background)]",
        dead
          ? "border-destructive/70 bg-destructive/10 text-destructive"
          : "border-accent/70 bg-accent/15 text-foreground",
      )}
    >
      <div className="font-heading text-base uppercase tracking-[0.2em]">
        {dead ? "Fallen Knight" : "Retired Knight"}
      </div>
      {ultimateFate ? (
        <p className="mt-1 italic">{ultimateFate}</p>
      ) : (
        <p className="mt-1 italic text-muted-foreground">
          {dead
            ? "No ultimate fate recorded."
            : "This Knight has laid down their arms."}
        </p>
      )}
    </div>
  );
}
