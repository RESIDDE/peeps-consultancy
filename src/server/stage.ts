import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { applications, candidates, placements, verificationChecks } from "@/db/schema";
import { computeStage, stageLabel, type CheckRecord, type StageEvidence } from "@/lib/quality";
import { SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { logActivity } from "./activity";

export async function loadEvidence(candidateId: string): Promise<StageEvidence | null> {
  const [c] = await db
    .select({ consentAt: candidates.consentAt, classification: candidates.classification })
    .from(candidates)
    .where(eq(candidates.id, candidateId));
  if (!c) return null;

  const [checks, shortlisted, placed] = await Promise.all([
    db
      .select({ type: verificationChecks.type, status: verificationChecks.status, notes: verificationChecks.notes })
      .from(verificationChecks)
      .where(eq(verificationChecks.candidateId, candidateId)),
    db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.candidateId, candidateId), inArray(applications.stage, SHORTLISTED_OR_LATER)))
      .limit(1),
    db.select({ id: placements.id }).from(placements).where(eq(placements.candidateId, candidateId)).limit(1),
  ]);

  return {
    consented: !!c.consentAt,
    checks: checks as CheckRecord[],
    classification: c.classification,
    shortlisted: shortlisted.length > 0,
    placed: placed.length > 0,
  };
}

/**
 * Re-derive a candidate's ladder stage from evidence. Called after every
 * check, assessment, classification, pipeline move or placement.
 */
export async function recomputeStage(candidateId: string, actorId?: string | null) {
  const ev = await loadEvidence(candidateId);
  if (!ev) return null;
  const next = computeStage(ev);
  const [current] = await db
    .select({ stage: candidates.stage })
    .from(candidates)
    .where(eq(candidates.id, candidateId));
  if (current && current.stage !== next) {
    await db.update(candidates).set({ stage: next }).where(eq(candidates.id, candidateId));
    await logActivity(
      actorId,
      "candidate",
      candidateId,
      "stage_changed",
      `${stageLabel(current.stage)} → ${stageLabel(next)}`,
    );
  }
  return next;
}
