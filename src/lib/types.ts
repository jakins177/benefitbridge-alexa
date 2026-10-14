export type IntakeStep =
  | "crisis"
  | "household"
  | "children"
  | "income"
  | "coverage"
  | "energy"
  | "complete";

export interface HouseholdProfile {
  state: "KS";
  lostJob: boolean;
  householdSize?: number;
  hasChildren?: boolean;
  monthlyGrossIncome?: number;
  hasHealthCoverage?: boolean;
  paysHomeEnergy?: boolean;
}

export type ProgramStatus = "act-now" | "screen" | "monitor";

export interface ProgramRecommendation {
  id: string;
  name: string;
  shortName: string;
  description: string;
  status: ProgramStatus;
  statusLabel: string;
  reason: string;
  nextStep: string;
  documents: string[];
  officialUrl: string;
  verifiedOn: string;
  priority: number;
}

export interface CaseState {
  id: string;
  step: IntakeStep;
  profile: HouseholdProfile;
  recommendations: ProgramRecommendation[];
  completedTasks: string[];
  reminderEnabled: boolean;
  reminderScheduledAt?: string;
  reminderDue?: boolean;
  updatedAt: string;
}
