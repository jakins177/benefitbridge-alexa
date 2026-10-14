/**
 * Purpose: Verify deterministic local reminder scheduling.
 * Function: Exercises the offline scheduler used by MCP tests and development.
 * Inputs/Outputs: Case IDs in, stable timestamps and cancellation behavior out.
 */
import { describe, expect, it } from "vitest";
import { MemoryReminderScheduler } from "./reminder-scheduler";

describe("MemoryReminderScheduler", () => {
  it("schedules a follow-up check 30 days ahead", async () => {
    const scheduler = new MemoryReminderScheduler(() => new Date("2026-10-01T04:00:15.000Z"));
    await expect(scheduler.schedule("BB-TEST")).resolves.toBe("2026-10-31T04:00:00.000Z");
    await expect(scheduler.cancel("BB-TEST")).resolves.toBeUndefined();
  });
});
