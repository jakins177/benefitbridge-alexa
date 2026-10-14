/**
 * Purpose: Verify BenefitBridge's offline language fallback.
 * Function: Tests natural-language normalization and grounded plan explanation.
 * Inputs/Outputs: User-like utterances and recommendations in, constrained results out.
 */
import { describe, expect, it } from "vitest";
import { evaluatePrograms } from "../lib/programs";
import { DeterministicConversationAssistant } from "./conversation-assistant";

describe("DeterministicConversationAssistant", () => {
  const assistant = new DeterministicConversationAssistant();

  it("normalizes natural household, income, and negative answers", async () => {
    await expect(assistant.interpret("household", "There are three of us")).resolves.toMatchObject({ answer: "3" });
    await expect(assistant.interpret("income", "About $1,200 this month")).resolves.toMatchObject({ answer: "1200" });
    await expect(assistant.interpret("coverage", "No, we don't have coverage")).resolves.toMatchObject({ answer: "no" });
  });

  it("explains only programs already selected by deterministic rules", async () => {
    const recommendations = evaluatePrograms({
      state: "KS", lostJob: true, householdSize: 3, hasChildren: true,
      monthlyGrossIncome: 1200, hasHealthCoverage: false, paysHomeEnergy: true
    });
    const result = await assistant.explain(recommendations);
    expect(result.explanation).toContain("Unemployment");
    expect(result.explanation).toContain("not eligibility decisions");
    expect(result.source).toBe("deterministic");
  });
});
