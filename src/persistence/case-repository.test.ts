/**
 * Purpose: Verify the local persistence adapter used by tests and offline development.
 * Function: Exercises missing reads, defensive copies, and record replacement.
 * Inputs/Outputs: Sample CaseState objects in, repository behavior assertions out.
 */
import { describe, expect, it } from "vitest";
import { createCase } from "../lib/case";
import { MemoryCaseRepository } from "./case-repository";

describe("MemoryCaseRepository", () => {
  it("returns null for an unknown case", async () => {
    const repository = new MemoryCaseRepository();
    await expect(repository.get("BB-MISSING")).resolves.toBeNull();
  });

  it("saves defensive copies and replaces the current record", async () => {
    const repository = new MemoryCaseRepository();
    const caseState = createCase();
    await repository.save(caseState);

    caseState.profile.lostJob = true;
    expect((await repository.get(caseState.id))?.profile.lostJob).toBe(false);

    const updated = { ...caseState, reminderEnabled: true, updatedAt: new Date(Date.now() + 1).toISOString() };
    await repository.save(updated);
    expect((await repository.get(caseState.id))?.reminderEnabled).toBe(true);
  });
});
