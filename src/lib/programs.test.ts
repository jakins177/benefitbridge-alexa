import { describe, expect, it } from "vitest";
import { evaluatePrograms } from "./programs";

describe("evaluatePrograms", () => {
  it("prioritizes unemployment after a job loss", () => {
    const result = evaluatePrograms({ state: "KS", lostJob: true, householdSize: 3, hasChildren: true, monthlyGrossIncome: 1200, hasHealthCoverage: false, paysHomeEnergy: true });
    expect(result[0].id).toBe("ks-unemployment");
    expect(result[0].status).toBe("act-now");
  });

  it("never presents closed LIEAP as currently open", () => {
    const result = evaluatePrograms({ state: "KS", lostJob: true, householdSize: 1, hasChildren: false, monthlyGrossIncome: 0, hasHealthCoverage: false, paysHomeEnergy: true });
    const lieap = result.find((program) => program.id === "ks-lieap");
    expect(lieap?.status).toBe("monitor");
    expect(lieap?.statusLabel).toContain("closed");
  });

  it("routes uninsured households to a KanCare screening", () => {
    const result = evaluatePrograms({ state: "KS", lostJob: true, householdSize: 2, hasChildren: false, monthlyGrossIncome: 2000, hasHealthCoverage: false, paysHomeEnergy: false });
    expect(result.find((program) => program.id === "kancare")?.status).toBe("screen");
  });
});
