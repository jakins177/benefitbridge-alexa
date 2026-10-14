/**
 * Purpose: Apply auditable user actions to a BenefitBridge case.
 * Function: Updates task-completion and reminder state without mutating the input.
 * Inputs/Outputs: A CaseState plus an action in, an updated CaseState out.
 */
import type { CaseState } from "./types";

export function setTaskStatus(current: CaseState, taskId: string, completed: boolean): CaseState {
  console.info("[BenefitBridge][case-action] Setting task status", {
    caseId: current.id,
    taskId,
    completed
  });

  if (!current.recommendations.some(({ id }) => id === taskId)) {
    throw new Error(`Unknown recommendation task: ${taskId}`);
  }

  const completedTasks = new Set(current.completedTasks);
  if (completed) completedTasks.add(taskId);
  else completedTasks.delete(taskId);

  return {
    ...current,
    completedTasks: [...completedTasks],
    updatedAt: new Date().toISOString()
  };
}

export function setReminderStatus(current: CaseState, enabled: boolean): CaseState {
  console.info("[BenefitBridge][case-action] Setting reminder status", {
    caseId: current.id,
    enabled
  });

  if (enabled && !current.recommendations.some(({ id }) => id === "ks-lieap")) {
    throw new Error("The LIEAP recommendation must exist before its reminder can be enabled.");
  }

  return {
    ...current,
    reminderEnabled: enabled,
    reminderScheduledAt: enabled ? current.reminderScheduledAt : undefined,
    reminderDue: false,
    updatedAt: new Date().toISOString()
  };
}
