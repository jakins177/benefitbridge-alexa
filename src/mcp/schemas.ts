/**
 * Purpose: Define the public MCP contract for BenefitBridge.
 * Function: Validates every structured input and output exchanged with MCP clients.
 * Inputs/Outputs: Zod schemas and inferred JSON-safe objects.
 */
import { z } from "zod";

export const intakeStepSchema = z.enum([
  "crisis",
  "household",
  "children",
  "income",
  "coverage",
  "energy",
  "complete"
]);

export const householdProfileSchema = z.object({
  state: z.literal("KS"),
  lostJob: z.boolean(),
  householdSize: z.number().int().min(1).max(20).optional(),
  hasChildren: z.boolean().optional(),
  monthlyGrossIncome: z.number().int().nonnegative().max(1_000_000).optional(),
  hasHealthCoverage: z.boolean().optional(),
  paysHomeEnergy: z.boolean().optional()
});

export const programRecommendationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["act-now", "screen", "monitor"]),
  statusLabel: z.string().min(1),
  reason: z.string().min(1),
  nextStep: z.string().min(1),
  documents: z.array(z.string().min(1)),
  officialUrl: z.url(),
  verifiedOn: z.iso.date(),
  priority: z.number().int().positive()
});

export const caseStateSchema = z.object({
  id: z.string().min(1),
  step: intakeStepSchema,
  profile: householdProfileSchema,
  recommendations: z.array(programRecommendationSchema),
  completedTasks: z.array(z.string().min(1)),
  reminderEnabled: z.boolean(),
  reminderScheduledAt: z.iso.datetime().optional(),
  reminderDue: z.boolean().optional(),
  updatedAt: z.iso.datetime()
});

export const caseOutputSchema = z.object({ case: caseStateSchema });
export const recommendationsOutputSchema = z.object({
  recommendations: z.array(programRecommendationSchema),
  disclaimer: z.string().min(1)
});
export const programOutputSchema = z.object({ program: programRecommendationSchema });
export const intakeInterpretationOutputSchema = z.object({
  answer: z.string().min(1),
  explanation: z.string().min(1),
  source: z.enum(["bedrock", "deterministic"])
});
export const planExplanationOutputSchema = z.object({
  explanation: z.string().min(1),
  source: z.enum(["bedrock", "deterministic"]),
  disclaimer: z.string().min(1)
});
