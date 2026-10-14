import type { HouseholdProfile, ProgramRecommendation } from "./types";

const VERIFIED_ON = "2026-10-13";

/**
 * Purpose: Produce explainable routing recommendations for the demo's Kansas programs.
 * Function: Uses deterministic profile facts; it does not make an official eligibility decision.
 * Input/Output: HouseholdProfile in, ordered ProgramRecommendation[] out.
 */
export function evaluatePrograms(profile: HouseholdProfile): ProgramRecommendation[] {
  console.info("[BenefitBridge][eligibility] Evaluation started", {
    state: profile.state,
    programCount: 4
  });

  const commonIncomeDocuments = [
    "Photo ID",
    "Social Security numbers for applicants",
    "Recent pay stubs or proof employment ended",
    "Recent bank or income statements"
  ];

  const programs: ProgramRecommendation[] = [
    {
      id: "ks-unemployment",
      name: "Kansas Unemployment Insurance",
      shortName: "Unemployment",
      description: "Temporary, partial wage replacement for workers who lose work through no fault of their own and meet Kansas requirements.",
      status: profile.lostJob ? "act-now" : "screen",
      statusLabel: profile.lostJob ? "Act now" : "Review circumstances",
      reason: profile.lostJob
        ? "You reported a recent job loss. Kansas determines eligibility from your work and separation details."
        : "Eligibility depends on recent employment and the reason work ended.",
      nextStep: "Start a claim through the Kansas Department of Labor and provide accurate separation details.",
      documents: ["Photo ID", "Social Security number", "Employer names and dates", "Reason employment ended"],
      officialUrl: "https://www.dol.ks.gov/unemployment/overview",
      verifiedOn: VERIFIED_ON,
      priority: 1
    },
    {
      id: "ks-snap",
      name: "Kansas Food Assistance (SNAP)",
      shortName: "Food assistance",
      description: "Helps qualifying low-income households buy food through the federal SNAP program, called Food Assistance in Kansas.",
      status: "screen",
      statusLabel: "Screen recommended",
      reason: `Your reported household of ${profile.householdSize ?? "unknown size"} and recent income change warrant an official screening. Final calculations include deductions and other factors.`,
      nextStep: "Use the Kansas DCF self-service portal to complete the official application.",
      documents: [...commonIncomeDocuments, "Housing and utility costs"],
      officialUrl: "https://www.dcf.ks.gov/services/ees/Pages/Food/FoodAssistance.aspx",
      verifiedOn: VERIFIED_ON,
      priority: 2
    },
    {
      id: "kancare",
      name: "KanCare Medical Assistance",
      shortName: "Healthcare",
      description: "Kansas medical coverage with separate application pathways for children, families, pregnant people, older adults, and people with disabilities.",
      status: !profile.hasHealthCoverage || profile.hasChildren ? "screen" : "monitor",
      statusLabel: !profile.hasHealthCoverage || profile.hasChildren ? "Screen recommended" : "Keep as backup",
      reason: !profile.hasHealthCoverage
        ? "You reported having no current health coverage. KanCare has different pathways for children, families, pregnant people, older adults, and people with disabilities."
        : "You reported current coverage, but an income or household change may still affect available medical assistance.",
      nextStep: "Complete KanCare's official self-assessment or application; the state makes the final determination.",
      documents: [...commonIncomeDocuments, "Current health-insurance information", "Immigration documents if applicable"],
      officialUrl: "https://www.kancare.ks.gov/apply-now",
      verifiedOn: VERIFIED_ON,
      priority: 3
    },
    {
      id: "ks-lieap",
      name: "Kansas Low Income Energy Assistance Program",
      shortName: "Energy assistance",
      description: "A one-time yearly benefit that helps eligible households pay part of their home heating costs.",
      status: "monitor",
      statusLabel: "2026 window closed — recheck",
      reason: profile.paysHomeEnergy
        ? "You pay home-energy costs, but Kansas reports that the 2026 LIEAP application period has ended."
        : "Kansas reports that the 2026 application period has ended; you can still monitor the next window.",
      nextStep: "Save a 30-day follow-up to recheck the official page yourself. This does not monitor government announcements or send a notification.",
      documents: ["Energy account information", "Recent utility bill", ...commonIncomeDocuments],
      officialUrl: "https://www.dcf.ks.gov/services/ees/Pages/EnergyAssistance.aspx",
      verifiedOn: VERIFIED_ON,
      priority: 4
    }
  ];

  const result = programs.sort((a, b) => a.priority - b.priority);
  console.info("[BenefitBridge][eligibility] Evaluation completed", {
    recommendations: result.map(({ id, status }) => ({ id, status }))
  });
  return result;
}
