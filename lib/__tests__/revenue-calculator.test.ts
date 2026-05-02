import { describe, it, expect } from "vitest";
import { calculateRevenue, type EmployeeInput, type RevenueConfig } from "../revenue-calculator";
import { validatePayRate } from "../pay-rate-guard";

// AcmeCo illustrative sample — synthetic numbers, not a real client engagement.
// 28 employees: 14 Backend, 5 Frontend, 7 QA, 2 Power BI.
// All employees share the same fixture rates so the math stays trivially auditable:
// bill C$4.00, pay C$2.00, 162.5 hrs/mo, actual salary BDT 25,000.
// Agreed rate: 90, Sending rate: 91, Agent: 50%.

function makeEmployees(count: number, prefix: string): EmployeeInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    billRateCad: 4.0,
    payRateCad: 2.0,
    hoursPerMonth: 162.5,
    actualSalaryBdt: 25000,
  }));
}

const acmeEmployees: EmployeeInput[] = [
  ...makeEmployees(14, "be"),
  ...makeEmployees(5, "fe"),
  ...makeEmployees(7, "qa"),
  ...makeEmployees(2, "bi"),
];

const acmeConfig: RevenueConfig = {
  agreedRateBdt: 90,
  sendingRateBdt: 91,
  agentSplitPct: 0.5,
  roleRevisedEnabled: true,
  fxAdvantageEnabled: true,
};

describe("calculateRevenue — AcmeCo (28 employees, illustrative)", () => {
  const result = calculateRevenue(acmeEmployees, acmeConfig);

  it("has 28 line items", () => {
    expect(result.lineItems).toHaveLength(28);
  });

  it("total revenue = C$18,200.00", () => {
    expect(result.totalRevenueCad).toBeCloseTo(18200, 2);
  });

  it("total salary cost = C$9,100.00", () => {
    expect(result.totalSalaryCostCad).toBeCloseTo(9100, 2);
  });

  it("gross profit = C$9,100.00", () => {
    expect(result.grossProfitCad).toBeCloseTo(9100, 2);
  });

  it("agent share (50%) = C$4,550.00", () => {
    expect(result.agentShareCad).toBeCloseTo(4550, 2);
  });

  it("owner base share = C$4,550.00", () => {
    expect(result.ownerBaseShareCad).toBeCloseTo(4550, 2);
  });

  it("role revised saving = C$1,322.22", () => {
    expect(result.roleRevisedSavingCad).toBeCloseTo(1322.22, 2);
  });

  it("FX advantage = C$85.47", () => {
    // (25000/90 - 25000/91) * 28 = (277.7778 - 274.7253) * 28 = 3.0525 * 28 = 85.47
    expect(result.fxAdvantageCad).toBeCloseTo(85.47, 1);
  });

  it("owner total = C$5,957.69", () => {
    expect(result.ownerTotalCad).toBeCloseTo(5957.69, 0);
  });

  it("owner total BDT = ownerTotalCad × agreed rate", () => {
    expect(result.ownerTotalBdt).toBeCloseTo(result.ownerTotalCad * 90, 0);
  });
});

describe("calculateRevenue — per employee line item", () => {
  const result = calculateRevenue(acmeEmployees, acmeConfig);
  const item = result.lineItems[0];

  it("revenue per employee = C$650.00", () => {
    expect(item.revenueCad).toBeCloseTo(650, 2);
  });

  it("cost per employee = C$325.00", () => {
    expect(item.costCad).toBeCloseTo(325, 2);
  });

  it("profit per employee = C$325.00", () => {
    expect(item.profitCad).toBeCloseTo(325, 2);
  });

  it("role revised saving per employee = C$47.22", () => {
    // (2.00 * 162.5 * 90 - 25000) / 90 = (29250 - 25000) / 90 = 4250/90 = 47.222
    expect(item.roleRevisedSavingCad).toBeCloseTo(47.22, 1);
  });

  it("FX advantage per employee = C$3.05", () => {
    // 25000/90 - 25000/91 = 277.7778 - 274.7253 = 3.0525
    expect(item.fxAdvantageCad).toBeCloseTo(3.05, 1);
  });
});

describe("calculateRevenue — toggles", () => {
  it("role revised = 0 when disabled", () => {
    const result = calculateRevenue(acmeEmployees, {
      ...acmeConfig,
      roleRevisedEnabled: false,
    });
    expect(result.roleRevisedSavingCad).toBe(0);
    expect(result.ownerTotalCad).toBeCloseTo(4550 + 85.47, 0);
  });

  it("FX advantage = 0 when disabled", () => {
    const result = calculateRevenue(acmeEmployees, {
      ...acmeConfig,
      fxAdvantageEnabled: false,
    });
    expect(result.fxAdvantageCad).toBe(0);
    expect(result.ownerTotalCad).toBeCloseTo(4550 + 1322.22, 0);
  });

  it("both toggles off = owner gets only base share", () => {
    const result = calculateRevenue(acmeEmployees, {
      ...acmeConfig,
      roleRevisedEnabled: false,
      fxAdvantageEnabled: false,
    });
    expect(result.ownerTotalCad).toBeCloseTo(4550, 2);
  });
});

describe("calculateRevenue — no agent", () => {
  it("zero agent split means owner gets all gross profit", () => {
    const result = calculateRevenue(acmeEmployees, {
      ...acmeConfig,
      agentSplitPct: 0,
    });
    expect(result.agentShareCad).toBe(0);
    expect(result.ownerBaseShareCad).toBeCloseTo(9100, 2);
  });
});

describe("calculateRevenue — negative FX (bad market)", () => {
  it("FX advantage is negative when sending rate < agreed rate", () => {
    const result = calculateRevenue(acmeEmployees, {
      ...acmeConfig,
      sendingRateBdt: 89, // worse than agreed 90
    });
    // 25000/90 - 25000/89 = 277.78 - 280.90 = -3.12 per employee
    expect(result.lineItems[0].fxAdvantageCad).toBeLessThan(0);
    expect(result.fxAdvantageCad).toBeCloseTo(-3.1211 * 28, 0);
  });
});

describe("calculateRevenue — sending rate equals agreed rate", () => {
  it("FX advantage = 0 when rates are the same", () => {
    const result = calculateRevenue(acmeEmployees, {
      ...acmeConfig,
      sendingRateBdt: 90, // same as agreed
    });
    expect(result.fxAdvantageCad).toBeCloseTo(0, 5);
  });
});

describe("calculateRevenue — single employee", () => {
  it("works with one employee", () => {
    const result = calculateRevenue([acmeEmployees[0]], acmeConfig);
    expect(result.lineItems).toHaveLength(1);
    expect(result.totalRevenueCad).toBeCloseTo(650, 2);
    expect(result.grossProfitCad).toBeCloseTo(325, 2);
  });
});

describe("calculateRevenue — zero hours", () => {
  it("all values are zero with zero hours", () => {
    const result = calculateRevenue(
      [{ id: "test", billRateCad: 4, payRateCad: 2, hoursPerMonth: 0, actualSalaryBdt: 25000 }],
      acmeConfig
    );
    expect(result.totalRevenueCad).toBe(0);
    expect(result.grossProfitCad).toBe(0);
  });
});

// ─── Pay Rate Guard ─────────────────────────────────────────────────────────

describe("validatePayRate", () => {
  it("passes when rate is within bounds", () => {
    expect(() => validatePayRate(2.0, 3.5)).not.toThrow();
  });

  it("passes when rate equals max", () => {
    expect(() => validatePayRate(3.5, 3.5)).not.toThrow();
  });

  it("throws when rate exceeds max", () => {
    expect(() => validatePayRate(4.0, 3.5)).toThrow(
      "Pay rate C$4.00/hr exceeds the agreed maximum of C$3.50/hr."
    );
  });

  it("throws with descriptive error including both values", () => {
    expect(() => validatePayRate(5.25, 3.5)).toThrow("C$5.25/hr");
    expect(() => validatePayRate(5.25, 3.5)).toThrow("C$3.50/hr");
  });
});
