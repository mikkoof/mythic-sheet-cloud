"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IdentityCard } from "@/components/knights/identity-card";
import { StatSection } from "@/components/knights/stats-card";
import { GuardCard } from "@/components/knights/guard-card";
import { GloryRankCard } from "@/components/knights/glory-rank-card";
import { AgeSelector } from "@/components/knights/age-selector";
import { ConditionsCard } from "@/components/knights/conditions-card";
import { FeatsCard } from "@/components/knights/feats-card";
import { GambitsCard } from "@/components/knights/gambits-card";
import {
  AbilityCard,
  PassionCard,
} from "@/components/knights/ability-passion-card";
import { PropertyList } from "@/components/knights/property-list";
import { WeaponsCard } from "@/components/knights/weapons-card";
import { ProtectiveArticlesCard } from "@/components/knights/protective-articles-card";
import { OathCard } from "@/components/knights/rulebook-reference-card";
import { CompanionsPanel } from "@/components/knights/companions-panel";
import { StatusBanner } from "@/components/knights/lifecycle/status-banner";
import { StatusChanger } from "@/components/knights/lifecycle/status-changer";
import { SuccessorLink } from "@/components/knights/lifecycle/successor-link";

import {
  updateKnightAction,
  updateKnightStatusAction,
} from "@/app/campaigns/[id]/knights/actions";
import {
  createSteedAction,
  deleteSteedAction,
  updateSteedAction,
} from "@/app/campaigns/[id]/knights/[knightId]/steeds/actions";
import {
  createSquireAction,
  deleteSquireAction,
  updateSquireAction,
} from "@/app/campaigns/[id]/knights/[knightId]/squires/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { CompanionDraft } from "@/lib/validators/companion";
import type { KnightDraft, KnightStatus } from "@/lib/validators/knight";

type KnightRef = { id: string; name: string; epithet: string };
type KnightSuccessorRef = KnightRef & { status: KnightStatus };

type KnightSheetProps = {
  campaignId: string;
  knightId: string;
  playerLabel: string;
  initialDraft: KnightDraft;
  canEdit: boolean;
  status: KnightStatus;
  predecessor: KnightRef | null;
  successors: KnightSuccessorRef[];
  steeds: CompanionDraft[];
  squires: CompanionDraft[];
};

export function KnightSheet({
  campaignId,
  knightId,
  playerLabel,
  initialDraft,
  canEdit,
  status,
  predecessor,
  successors,
  steeds,
  squires,
}: KnightSheetProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const initialKey = useMemo(() => JSON.stringify(initialDraft), [initialDraft]);

  const [draft, setDraft] = useState<KnightDraft>(initialDraft);
  const [refreshOpen, setRefreshOpen] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== initialKey,
    [draft, initialKey],
  );

  const update = useCallback(
    (patch: Partial<KnightDraft>) => setDraft((d) => ({ ...d, ...patch })),
    [],
  );

  useEffect(() => {
    if (!canEdit) return;
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (isDirty) formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canEdit, isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleRefreshClick = () => {
    if (isDirty) setRefreshOpen(true);
    else router.refresh();
  };

  const confirmRefresh = () => {
    setDraft(initialDraft);
    setRefreshOpen(false);
    router.refresh();
  };

  const action = updateKnightAction.bind(null, knightId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={`/campaigns/${campaignId}`}>← Campaign</Link>
        </Button>
      </div>

      <form ref={formRef} action={action} className="space-y-6">
        <header className="sticky top-0 z-10 -mx-6 flex flex-col gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl tracking-wide text-foreground">
              {draft.name || "Unnamed Knight"}
              {draft.epithet ? (
                <span className="ml-2 font-sans text-base italic text-muted-foreground">
                  the {draft.epithet} Knight
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-muted-foreground">{playerLabel}</p>
            {canEdit ? (
              <div className="mt-2">
                <StatusChanger
                  knightId={knightId}
                  status={status}
                  updateAction={updateKnightStatusAction}
                />
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {canEdit ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefreshClick}
                >
                  Refresh
                </Button>
                <Button type="submit" disabled={!isDirty}>
                  {isDirty ? "Save" : "Saved"}
                </Button>
              </>
            ) : (
              <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Read-only
              </span>
            )}
          </div>
        </header>

        <StatusBanner status={status} ultimateFate={draft.ultimateFate} />

        <SuccessorLink
          campaignId={campaignId}
          knightId={knightId}
          status={status}
          canEdit={canEdit}
          predecessor={predecessor}
          successors={successors}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <IdentityCard
              name={draft.name}
              epithet={draft.epithet}
              ultimateFate={draft.ultimateFate}
              onChange={update}
              canEdit={canEdit}
            />
            <GloryRankCard
              glory={draft.glory}
              onChange={(glory) => update({ glory })}
              canEdit={canEdit}
            />
            <AgeSelector
              age={draft.age}
              onChange={(age) => update({ age })}
              canEdit={canEdit}
            />
            <div className="grid grid-cols-2 grid-rows-3 gap-4">
              <StatSection
                kind="vig"
                value={draft.vig}
                traits={draft.vigTraits}
                onChangeValue={(vig) => update({ vig })}
                onChangeTraits={(vigTraits) => update({ vigTraits })}
                canEdit={canEdit}
                className="col-start-1 row-start-1"
              />
              <StatSection
                kind="cla"
                value={draft.cla}
                traits={draft.claTraits}
                onChangeValue={(cla) => update({ cla })}
                onChangeTraits={(claTraits) => update({ claTraits })}
                canEdit={canEdit}
                className="col-start-1 row-start-2"
              />
              <StatSection
                kind="spi"
                value={draft.spi}
                traits={draft.spiTraits}
                onChangeValue={(spi) => update({ spi })}
                onChangeTraits={(spiTraits) => update({ spiTraits })}
                canEdit={canEdit}
                className="col-start-1 row-start-3"
              />
              <GuardCard
                guard={draft.guard}
                onChange={(guard) => update({ guard })}
                canEdit={canEdit}
                className="col-start-2 row-start-1 row-span-3"
              />
            </div>
            <ProtectiveArticlesCard
              protectiveArticles={draft.protectiveArticles}
              onChange={(protectiveArticles) =>
                update({ protectiveArticles })
              }
              canEdit={canEdit}
            />
          </div>

          <div className="space-y-6">
            <ConditionsCard
              exposed={draft.exposed}
              exhausted={draft.exhausted}
              impaired={draft.impaired}
              onChange={update}
              canEdit={canEdit}
            />
            <FeatsCard
              fatigued={draft.fatigued}
              onChange={(patch) => update(patch)}
              canEdit={canEdit}
            />
            <WeaponsCard
              weapons={draft.weapons}
              onChange={(weapons) => update({ weapons })}
              canEdit={canEdit}
            />
            <GambitsCard />
            <AbilityCard
              ability={draft.ability}
              onChange={update}
              canEdit={canEdit}
            />
            <PassionCard
              passion={draft.passion}
              onChange={update}
              canEdit={canEdit}
            />
            <PropertyList
              property={draft.property}
              onChange={(property) => update({ property })}
              canEdit={canEdit}
            />
            <OathCard />
          </div>
        </div>
      </form>

      <CompanionsPanel
        kind="steed"
        knightId={knightId}
        companions={steeds}
        canEdit={canEdit}
        createAction={createSteedAction}
        updateAction={updateSteedAction}
        deleteAction={deleteSteedAction}
      />

      <CompanionsPanel
        kind="squire"
        knightId={knightId}
        companions={squires}
        canEdit={canEdit}
        createAction={createSquireAction}
        updateAction={updateSquireAction}
        deleteAction={deleteSquireAction}
      />

      <AlertDialog open={refreshOpen} onOpenChange={setRefreshOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have local edits that haven&apos;t been saved. Refreshing
              will replace them with the latest values from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRefresh}>
              Discard and refresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
