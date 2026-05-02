/**
 * Revenue Calculator — Pure function, no database calls, fully unit-testable.
 * Implements the exact formulas from architecture doc Section 7.
 */

export interface EmployeeInput {
  id: string;
  billRateCad: number;
  payRateCad: number;
  hoursPerMonth: number;
  actualSalaryBdt: number;
}

export interface RevenueConfig {
  agreedRateBdt: number;
  sendingRateBdt: number; // defaults to agreedRateBdt if not set
  agentSplitPct: number; // e.g. 0.50 for 50%; 0 if no agent
  roleRevisedEnabled: boolean;
  fxAdvantageEnabled: boolean;
}

export interface LineItemResult extends EmployeeInput {
  revenueCad: number;
  costCad: number;
  profitCad: number;
  roleRevisedSavingBdt: number;
  roleRevisedSavingCad: number;
  fxAdvantageCad: number;
}

export interface RevenueResult {
  lineItems: LineItemResult[];
  totalRevenueCad: number;
  totalSalaryCostCad: number;
  grossProfitCad: number;
  agentShareCad: number;
  ownerBaseShareCad: number;
  roleRevisedSavingCad: number;
  fxAdvantageCad: number;
  ownerTotalCad: number;
  ownerTotalBdt: number;
}

export function calculateRevenue(
  employees: EmployeeInput[],
  config: RevenueConfig
): RevenueResult {
  const { agreedRateBdt: ar, sendingRateBdt: sr, agentSplitPct } = config;

  const lineItems = employees.map((emp) => {
    const revenueCad = emp.billRateCad * emp.hoursPerMonth;
    const costCad = emp.payRateCad * emp.hoursPerMonth;
    const profitCad = revenueCad - costCad;

    // Role Revised: gap between billing-equivalent BDT and actual BDT paid
    const payEquivBdt = emp.payRateCad * emp.hoursPerMonth * ar;
    const roleRevisedSavingBdt = payEquivBdt - emp.actualSalaryBdt;
    const roleRevisedSavingCad = roleRevisedSavingBdt / ar;

    // FX Advantage: savings from converting at actual rate vs agreed rate
    const fxAdvantageCad =
      emp.actualSalaryBdt / ar - emp.actualSalaryBdt / sr;

    return {
      ...emp,
      revenueCad,
      costCad,
      profitCad,
      roleRevisedSavingBdt,
      roleRevisedSavingCad,
      fxAdvantageCad,
    };
  });

  const sum = (fn: (l: LineItemResult) => number) =>
    lineItems.reduce((s, l) => s + fn(l), 0);

  const totalRevenueCad = sum((l) => l.revenueCad);
  const totalSalaryCostCad = sum((l) => l.costCad);
  const grossProfitCad = totalRevenueCad - totalSalaryCostCad;
  const agentShareCad = grossProfitCad * agentSplitPct;
  const ownerBaseShareCad = grossProfitCad - agentShareCad;
  const roleRevisedSavingCad = config.roleRevisedEnabled
    ? sum((l) => l.roleRevisedSavingCad)
    : 0;
  const fxAdvantageCad = config.fxAdvantageEnabled
    ? sum((l) => l.fxAdvantageCad)
    : 0;
  const ownerTotalCad =
    ownerBaseShareCad + roleRevisedSavingCad + fxAdvantageCad;

  return {
    lineItems,
    totalRevenueCad,
    totalSalaryCostCad,
    grossProfitCad,
    agentShareCad,
    ownerBaseShareCad,
    roleRevisedSavingCad,
    fxAdvantageCad,
    ownerTotalCad,
    ownerTotalBdt: ownerTotalCad * ar,
  };
}
