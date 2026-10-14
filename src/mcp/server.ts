/**
 * Purpose: Expose BenefitBridge's verified case workflow through MCP.
 * Function: Registers deterministic tools for intake, routing, progress, and reminders.
 * Inputs/Outputs: Validated MCP tool arguments in, text plus structured JSON results out.
 */
import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";
import { applyAnswer, createCase } from "../lib/case";
import { setReminderStatus, setTaskStatus } from "../lib/case-actions";
import { evaluatePrograms } from "../lib/programs";
import type { CaseState } from "../lib/types";
import { getCaseRepository, type CaseRepository } from "../persistence/case-repository";
import { getReminderScheduler, type ReminderScheduler } from "../reminders/reminder-scheduler";
import { getConversationAssistant, type ConversationAssistant } from "../ai/conversation-assistant";
import {
  caseOutputSchema,
  caseStateSchema,
  householdProfileSchema,
  intakeInterpretationOutputSchema,
  intakeStepSchema,
  planExplanationOutputSchema,
  programOutputSchema,
  recommendationsOutputSchema
} from "./schemas";

export const BENEFITBRIDGE_MCP_NAME = "benefitbridge-alexa";
export const BENEFITBRIDGE_MCP_VERSION = "0.2.0";
export const BENEFITBRIDGE_DISCLAIMER =
  "Preliminary guidance only. Government agencies make final eligibility decisions; verify details at the linked official source.";

function success<T extends Record<string, unknown>>(message: string, value: T): CallToolResult {
  return { content: [{ type: "text", text: message }], structuredContent: value };
}

function errorResult(operation: string, error: unknown): CallToolResult {
  const detail = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[BenefitBridge][mcp] ${operation} failed`, { detail, stack });
  return {
    isError: true,
    content: [{ type: "text", text: `${operation} failed: ${detail}` }]
  };
}

export function createBenefitBridgeMcpServer(
  repository: CaseRepository = getCaseRepository(),
  reminderScheduler: ReminderScheduler = getReminderScheduler(),
  conversationAssistant: ConversationAssistant = getConversationAssistant()
): McpServer {
  console.info("[BenefitBridge][mcp] Creating per-request MCP server");
  const server = new McpServer(
    { name: BENEFITBRIDGE_MCP_NAME, version: BENEFITBRIDGE_MCP_VERSION },
    {
      instructions:
        "Use these tools to build a Kansas job-loss recovery plan. Never claim official eligibility. Preserve official links and the disclaimer."
    }
  );

  server.registerTool(
    "benefitbridge_start_case",
    {
      title: "Start BenefitBridge case",
      description: "Create a new anonymous Kansas benefit-navigation case.",
      inputSchema: z.object({}),
      outputSchema: caseOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false }
    },
    async () => {
      try {
        const caseState = createCase();
        await repository.save(caseState);
        console.info("[BenefitBridge][mcp] Case started", { caseId: caseState.id, persistence: repository.mode });
        return success("A new anonymous BenefitBridge case is ready.", { case: caseState });
      } catch (error) {
        return errorResult("Start case", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_apply_intake_answer",
    {
      title: "Apply intake answer",
      description: "Apply one answer to the current intake step and return the updated case.",
      inputSchema: z.object({ case: caseStateSchema, answer: z.string().trim().min(1).max(200) }),
      outputSchema: caseOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false }
    },
    async ({ case: current, answer }) => {
      try {
        const normalized = answer.toLowerCase();
        const persisted = await repository.get(current.id);
        if (!persisted) throw new Error("Case not found. Start a new demo case.");
        if (current.step !== persisted.step || current.updatedAt !== persisted.updatedAt) throw new Error("Case changed. Resume before retrying.");
        const updated = applyAnswer(persisted, normalized);
        await repository.save(updated);
        console.info("[BenefitBridge][mcp] Intake answer applied", {
          caseId: updated.id,
          nextStep: updated.step
        });
        return success(`Answer saved. The next intake step is ${updated.step}.`, { case: updated });
      } catch (error) {
        return errorResult("Apply intake answer", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_evaluate_programs",
    {
      title: "Evaluate benefit programs",
      description: "Run deterministic routing for the supported Kansas programs. This is not an eligibility decision.",
      inputSchema: z.object({ profile: householdProfileSchema }),
      outputSchema: recommendationsOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ profile }) => {
      try {
        const recommendations = evaluatePrograms(profile);
        return success(
          `Found ${recommendations.length} official program paths. ${BENEFITBRIDGE_DISCLAIMER}`,
          { recommendations, disclaimer: BENEFITBRIDGE_DISCLAIMER }
        );
      } catch (error) {
        return errorResult("Evaluate programs", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_get_program",
    {
      title: "Get official program details",
      description: "Return one supported program recommendation with its official source and verification date.",
      inputSchema: z.object({
        profile: householdProfileSchema,
        programId: z.enum(["ks-unemployment", "ks-snap", "kancare", "ks-lieap"])
      }),
      outputSchema: programOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ profile, programId }) => {
      try {
        const program = evaluatePrograms(profile).find(({ id }) => id === programId);
        if (!program) throw new Error(`Program not found: ${programId}`);
        return success(`${program.name}: ${program.nextStep}`, { program });
      } catch (error) {
        return errorResult("Get program", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_set_task_status",
    {
      title: "Update action-plan progress",
      description: "Mark one recommended action started/completed or return it to pending.",
      inputSchema: z.object({
        case: caseStateSchema,
        taskId: z.string().min(1),
        completed: z.boolean()
      }),
      outputSchema: caseOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true }
    },
    async ({ case: current, taskId, completed }) => {
      try {
        const persisted = await repository.get(current.id);
        if (!persisted) throw new Error("Case not found. Start a new demo case.");
        const updated = setTaskStatus(persisted, taskId, completed);
        await repository.save(updated);
        return success(`Action ${taskId} is now ${completed ? "complete" : "pending"}.`, { case: updated });
      } catch (error) {
        return errorResult("Set task status", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_set_reminder",
    {
      title: "Update LIEAP reminder",
      description: "Enable or disable a fixed 30-day follow-up to manually recheck LIEAP. No automatic window monitoring or outbound notification.",
      inputSchema: z.object({ case: caseStateSchema, enabled: z.boolean() }),
      outputSchema: caseOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true }
    },
    async ({ case: current, enabled }) => {
      try {
        const persisted = await repository.get(current.id);
        if (!persisted) throw new Error("Case not found. Start a new demo case.");
        const changed = setReminderStatus(persisted, enabled);
        const reminderScheduledAt = enabled
          ? (persisted.reminderEnabled && persisted.reminderScheduledAt ? persisted.reminderScheduledAt : await reminderScheduler.schedule(changed.id))
          : undefined;
        if (!enabled) await reminderScheduler.cancel(changed.id);
        const updated: CaseState = {
          ...changed,
          reminderScheduledAt,
          reminderDue: false
        };
        await repository.save(updated);
        return success(
          enabled
            ? `The LIEAP follow-up check is scheduled for ${reminderScheduledAt}.`
            : "The LIEAP reminder is now disabled.",
          { case: updated }
        );
      } catch (error) {
        return errorResult("Set reminder", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_get_case",
    {
      title: "Resume BenefitBridge case",
      description: "Restore a previously saved anonymous case by its case ID.",
      inputSchema: z.object({ caseId: z.string().trim().min(1).max(100) }),
      outputSchema: caseOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ caseId }) => {
      try {
        const caseState = await repository.get(caseId);
        if (!caseState) throw new Error(`Case not found: ${caseId}`);
        return success(`Case ${caseId} restored.`, { case: caseState });
      } catch (error) {
        return errorResult("Get case", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_interpret_intake",
    {
      title: "Interpret a natural-language intake answer",
      description: "Normalize a spoken or typed answer for one intake step. This language layer does not determine eligibility.",
      inputSchema: z.object({ step: intakeStepSchema, utterance: z.string().trim().min(1).max(500) }),
      outputSchema: intakeInterpretationOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ step, utterance }) => {
      try {
        const interpreted = await conversationAssistant.interpret(step, utterance);
        return success(interpreted.explanation, { ...interpreted });
      } catch (error) {
        return errorResult("Interpret intake", error);
      }
    }
  );

  server.registerTool(
    "benefitbridge_explain_plan",
    {
      title: "Explain a recovery plan",
      description: "Explain deterministic program recommendations in plain language without adding eligibility claims.",
      inputSchema: z.object({ case: caseStateSchema }),
      outputSchema: planExplanationOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ case: current }) => {
      try {
        const persisted = await repository.get(current.id);
        if (!persisted) throw new Error("Case not found. Start a new demo case.");
        const result = await conversationAssistant.explain((persisted ?? current).recommendations);
        return success(result.explanation, { ...result, disclaimer: BENEFITBRIDGE_DISCLAIMER });
      } catch (error) {
        return errorResult("Explain plan", error);
      }
    }
  );

  console.info("[BenefitBridge][mcp] Tool registration completed", { toolCount: 9, persistence: repository.mode });
  return server;
}
