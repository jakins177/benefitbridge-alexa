/**
 * Purpose: Verify the public BenefitBridge MCP contract without a network dependency.
 * Function: Connects the official MCP client and server through an in-memory transport pair.
 * Inputs/Outputs: Tool requests in, asserted structured MCP results out.
 */
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CaseState } from "../lib/types";
import { createBenefitBridgeMcpServer } from "./server";
import { MemoryCaseRepository } from "../persistence/case-repository";
import { MemoryReminderScheduler } from "../reminders/reminder-scheduler";

describe("BenefitBridge MCP server", () => {
  let client: Client;
  let server: ReturnType<typeof createBenefitBridgeMcpServer>;
  let repository: MemoryCaseRepository;

  beforeEach(async () => {
    console.info("[BenefitBridge][mcp-test] Connecting in-memory client");
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    repository = new MemoryCaseRepository();
    server = createBenefitBridgeMcpServer(
      repository,
      new MemoryReminderScheduler(() => new Date("2026-10-01T04:00:00.000Z"))
    );
    client = new Client({ name: "benefitbridge-test", version: "1.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  afterEach(async () => {
    await Promise.all([client.close(), server.close()]);
    console.info("[BenefitBridge][mcp-test] Connection closed");
  });

  it("publishes the complete tool surface", async () => {
    const { tools } = await client.listTools();
    expect(tools.map(({ name }) => name)).toEqual([
      "benefitbridge_start_case",
      "benefitbridge_apply_intake_answer",
      "benefitbridge_evaluate_programs",
      "benefitbridge_get_program",
      "benefitbridge_set_task_status",
      "benefitbridge_set_reminder",
      "benefitbridge_get_case",
      "benefitbridge_interpret_intake",
      "benefitbridge_explain_plan"
    ]);
  });

  it("executes the canonical intake and progress workflow", async () => {
    const started = await client.callTool({ name: "benefitbridge_start_case", arguments: {} });
    let caseState = (started.structuredContent as { case: CaseState }).case;

    for (const answer of ["lost-job", "3", "yes", "1200", "no", "yes"]) {
      const result = await client.callTool({
        name: "benefitbridge_apply_intake_answer",
        arguments: { case: caseState, answer }
      });
      expect(result.isError).not.toBe(true);
      caseState = (result.structuredContent as { case: CaseState }).case;
    }

    expect(caseState.step).toBe("complete");
    expect(caseState.recommendations).toHaveLength(4);
    expect(caseState.recommendations[0].id).toBe("ks-unemployment");

    const taskResult = await client.callTool({
      name: "benefitbridge_set_task_status",
      arguments: { case: caseState, taskId: "ks-unemployment", completed: true }
    });
    caseState = (taskResult.structuredContent as { case: CaseState }).case;
    expect(caseState.completedTasks).toContain("ks-unemployment");

    const reminderResult = await client.callTool({
      name: "benefitbridge_set_reminder",
      arguments: { case: caseState, enabled: true }
    });
    caseState = (reminderResult.structuredContent as { case: CaseState }).case;
    expect(caseState.reminderEnabled).toBe(true);
    expect(caseState.reminderScheduledAt).toBe("2026-10-31T04:00:00.000Z");

    const restored = await client.callTool({
      name: "benefitbridge_get_case",
      arguments: { caseId: caseState.id }
    });
    expect((restored.structuredContent as { case: CaseState }).case.reminderEnabled).toBe(true);

    const interpretation = await client.callTool({
      name: "benefitbridge_interpret_intake",
      arguments: { step: "household", utterance: "There are three people" }
    });
    expect(interpretation.structuredContent).toMatchObject({ answer: "3", source: "deterministic" });

    const explanation = await client.callTool({
      name: "benefitbridge_explain_plan",
      arguments: { case: caseState }
    });
    expect(explanation.structuredContent).toMatchObject({ source: "deterministic" });
  });

  it("returns a tool error for an invalid step-specific answer", async () => {
    const started = await client.callTool({ name: "benefitbridge_start_case", arguments: {} });
    const initial = (started.structuredContent as { case: CaseState }).case;
    const crisisAnswered = await client.callTool({
      name: "benefitbridge_apply_intake_answer",
      arguments: { case: initial, answer: "lost-job" }
    });
    const householdStep = (crisisAnswered.structuredContent as { case: CaseState }).case;

    const invalid = await client.callTool({
      name: "benefitbridge_apply_intake_answer",
      arguments: { case: householdStep, answer: "many" }
    });

    expect(invalid.isError).toBe(true);
    expect(invalid.content[0]).toMatchObject({ type: "text" });
  });
  it("rejects forged and stale intake records", async () => {
    const result = await client.callTool({ name: "benefitbridge_start_case", arguments: {} });
    const initial = (result.structuredContent as {case: CaseState}).case;
    const first = await client.callTool({name:"benefitbridge_apply_intake_answer",arguments:{case:initial,answer:"lost-job"}});
    expect(first.isError).not.toBe(true);
    const stale = await client.callTool({name:"benefitbridge_apply_intake_answer",arguments:{case:initial,answer:"lost-job"}});
    expect(stale.isError).toBe(true);
    const forged = await client.callTool({name:"benefitbridge_apply_intake_answer",arguments:{case:{...initial,id:"not-a-case"},answer:"lost-job"}});
    expect(forged.isError).toBe(true);
  });

});
