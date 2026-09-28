import type { CaseState, HouseholdProfile, IntakeStep } from "./types";
import { evaluatePrograms } from "./programs";

export const STORAGE_KEY = "benefitbridge-demo-case-v1";

export function createCase(): CaseState {
  console.info("[BenefitBridge][case] Creating a new demo case");
  return {
    id: `BB-${Date.now().toString(36).toUpperCase()}`,
    step: "crisis",
    profile: { state: "KS", lostJob: false },
    recommendations: [],
    completedTasks: [],
    reminderEnabled: false,
    updatedAt: new Date().toISOString()
  };
}

export function applyAnswer(current: CaseState, answer: string): CaseState {
  console.info("[BenefitBridge][case] Applying intake answer", {
    caseId: current.id,
    step: current.step,
    answer
  });

  const profile: HouseholdProfile = { ...current.profile };
  let nextStep: IntakeStep = current.step;

  switch (current.step) {
    case "crisis":
      profile.lostJob = true;
      nextStep = "household";
      break;
    case "household":
      profile.householdSize = Number.parseInt(answer, 10);
      nextStep = "children";
      break;
    case "children":
      profile.hasChildren = answer === "yes";
      nextStep = "income";
      break;
    case "income":
      profile.monthlyGrossIncome = Number.parseInt(answer.replace(/[^0-9]/g, ""), 10) || 0;
      nextStep = "coverage";
      break;
    case "coverage":
      profile.hasHealthCoverage = answer === "yes";
      nextStep = "energy";
      break;
    case "energy":
      profile.paysHomeEnergy = answer === "yes";
      nextStep = "complete";
      break;
    case "complete":
      break;
  }

  const updated: CaseState = {
    ...current,
    profile,
    step: nextStep,
    recommendations: nextStep === "complete" ? evaluatePrograms(profile) : current.recommendations,
    updatedAt: new Date().toISOString()
  };
  console.info("[BenefitBridge][case] Intake answer applied", { caseId: updated.id, nextStep });
  return updated;
}

export function promptFor(step: IntakeStep): string {
  const prompts: Record<IntakeStep, string> = {
    crisis: "Tell me what changed. I can help if you lost a job or income.",
    household: "I’m sorry you’re dealing with this. Including yourself, how many people live in your household?",
    children: "Are any children under 19 part of your household?",
    income: "About how much gross income does the household expect this month? An estimate is okay.",
    coverage: "Does everyone in the household currently have health coverage?",
    energy: "Are you responsible for paying the home heating or energy bill?",
    complete: "Your recovery plan is ready. I found actions you can take now and one program to monitor."
  };
  return prompts[step];
}

export function choicesFor(step: IntakeStep): Array<{ label: string; value: string }> {
  const choices: Partial<Record<IntakeStep, Array<{ label: string; value: string }>>> = {
    crisis: [{ label: "I lost my job yesterday", value: "lost-job" }],
    household: [1, 2, 3, 4, 5].map((value) => ({ label: String(value), value: String(value) })),
    children: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
    income: [
      { label: "$0", value: "0" },
      { label: "$1,200", value: "1200" },
      { label: "$2,000", value: "2000" },
      { label: "$3,000", value: "3000" }
    ],
    coverage: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
    energy: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]
  };
  return choices[step] ?? [];
}
