"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import {
  calculateRevenue,
  type EmployeeInput,
  type RevenueConfig,
} from "@/lib/revenue-calculator";

export async function getInvoices() {
  const invoices = await db.invoiceBatch.findMany({
    include: {
      company: { select: { name: true, slug: true } },
      agent: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return serialize(invoices);
}

export type InvoiceWithDetails = Awaited<ReturnType<typeof getInvoices>>[number];

export async function getInvoice(id: string) {
  const invoice = await db.invoiceBatch.findUnique({
    where: { id },
    include: {
      company: { select: { name: true, slug: true, currency: true } },
      agent: { select: { name: true } },
      lineItems: {
        include: {
          employee: { select: { fullName: true } },
          role: { select: { title: true } },
        },
        orderBy: { role: { title: "asc" } },
      },
    },
  });
  if (!invoice) notFound();
  return serialize(invoice);
}

export type InvoiceFull = Awaited<ReturnType<typeof getInvoice>>;

export async function getCompaniesForInvoice(agentOnly?: boolean) {
  const companies = await db.company.findMany({
    where: {
      isActive: true,
      ...(agentOnly ? { agentEnabled: true } : {}),
    },
    include: {
      agents: { where: { isActive: true }, take: 1 },
      employees: {
        where: { status: "active" },
        select: { id: true, fullName: true, roleId: true, payRateCad: true, actualSalaryBdt: true },
      },
      rateConfigs: {
        where: { effectiveTo: null },
        include: { role: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return serialize(companies);
}

export type InvoiceCompany = Awaited<ReturnType<typeof getCompaniesForInvoice>>[number];

export async function generateCompanyInvoice(data: {
  companyId: string;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  scope: "all" | "by_role" | "individual";
  lineItems: {
    employeeId: string;
    roleId: string;
    billRateCad: number;
    payRateCad: number;
    hours: number;
    actualSalaryBdt: number;
  }[];
  agreedRateBdt: number;
  sendingRateBdt: number;
  agentId?: string;
  agentSharePct?: number;
}) {
  const employees: EmployeeInput[] = data.lineItems.map((li) => ({
    id: li.employeeId,
    billRateCad: li.billRateCad,
    payRateCad: li.payRateCad,
    hoursPerMonth: li.hours,
    actualSalaryBdt: li.actualSalaryBdt,
  }));

  const config: RevenueConfig = {
    agreedRateBdt: data.agreedRateBdt,
    sendingRateBdt: data.sendingRateBdt || data.agreedRateBdt,
    agentSplitPct: (data.agentSharePct ?? 0) / 100,
    roleRevisedEnabled: true,
    fxAdvantageEnabled: data.sendingRateBdt !== data.agreedRateBdt,
  };

  const result = calculateRevenue(employees, config);

  const batch = await db.invoiceBatch.create({
    data: {
      companyId: data.companyId,
      agentId: data.agentId || null,
      periodYear: data.periodYear,
      periodMonth: data.periodMonth,
      periodLabel: data.periodLabel,
      invoiceType: "company",
      companyInvoiceScope: data.scope,
      agreedRateBdt: data.agreedRateBdt,
      sendingRateBdt: data.sendingRateBdt || data.agreedRateBdt,
      totalHours: employees.reduce((s, e) => s + e.hoursPerMonth, 0),
      totalRevenueCad: result.totalRevenueCad,
      totalSalaryCostCad: result.totalSalaryCostCad,
      grossProfitCad: result.grossProfitCad,
      agentSharePct: data.agentSharePct ?? null,
      agentShareCad: result.agentShareCad || null,
      ownerBaseShareCad: result.ownerBaseShareCad,
      ownerRoleRevisedSavingCad: result.roleRevisedSavingCad,
      ownerFxAdvantageCad: result.fxAdvantageCad,
      ownerTotalCad: result.ownerTotalCad,
      totalRevenueBdt: result.totalRevenueCad * data.agreedRateBdt,
      grossProfitBdt: result.grossProfitCad * data.agreedRateBdt,
      ownerTotalBdt: result.ownerTotalBdt,
      lineItems: {
        create: result.lineItems.map((li) => {
          const orig = data.lineItems.find((o) => o.employeeId === li.id)!;
          return {
            employeeId: li.id,
            roleId: orig.roleId,
            billRateCad: li.billRateCad,
            payRateCad: li.payRateCad,
            hours: li.hoursPerMonth,
            revenueCad: li.revenueCad,
            costCad: li.costCad,
            profitCad: li.profitCad,
            actualSalaryBdt: li.actualSalaryBdt,
            roleRevisedSavingBdt: li.roleRevisedSavingBdt,
            roleRevisedSavingCad: li.roleRevisedSavingCad,
            fxAdvantageCad: li.fxAdvantageCad,
          };
        }),
      },
    },
  });

  redirect(`/dashboard/invoices/${batch.id}`);
}

export async function generateAgentInvoice(data: {
  companyId: string;
  agentId: string;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  agreedRateBdt: number;
  agentSharePct: number;
  lineItems: {
    employeeId: string;
    roleId: string;
    billRateCad: number;
    payRateCad: number;
    hours: number;
    actualSalaryBdt: number;
  }[];
}) {
  const employees: EmployeeInput[] = data.lineItems.map((li) => ({
    id: li.employeeId,
    billRateCad: li.billRateCad,
    payRateCad: li.payRateCad,
    hoursPerMonth: li.hours,
    actualSalaryBdt: li.actualSalaryBdt,
  }));

  const config: RevenueConfig = {
    agreedRateBdt: data.agreedRateBdt,
    sendingRateBdt: data.agreedRateBdt,
    agentSplitPct: data.agentSharePct / 100,
    roleRevisedEnabled: false,
    fxAdvantageEnabled: false,
  };

  const result = calculateRevenue(employees, config);

  const batch = await db.invoiceBatch.create({
    data: {
      companyId: data.companyId,
      agentId: data.agentId,
      periodYear: data.periodYear,
      periodMonth: data.periodMonth,
      periodLabel: data.periodLabel,
      invoiceType: "agent",
      agreedRateBdt: data.agreedRateBdt,
      sendingRateBdt: data.agreedRateBdt,
      totalHours: employees.reduce((s, e) => s + e.hoursPerMonth, 0),
      totalRevenueCad: result.totalRevenueCad,
      totalSalaryCostCad: result.totalSalaryCostCad,
      grossProfitCad: result.grossProfitCad,
      agentSharePct: data.agentSharePct,
      agentShareCad: result.agentShareCad,
      ownerBaseShareCad: result.ownerBaseShareCad,
      ownerRoleRevisedSavingCad: 0,
      ownerFxAdvantageCad: 0,
      ownerTotalCad: result.ownerBaseShareCad,
      totalRevenueBdt: result.totalRevenueCad * data.agreedRateBdt,
      grossProfitBdt: result.grossProfitCad * data.agreedRateBdt,
      ownerTotalBdt: result.ownerBaseShareCad * data.agreedRateBdt,
      lineItems: {
        create: result.lineItems.map((li) => {
          const orig = data.lineItems.find((o) => o.employeeId === li.id)!;
          return {
            employeeId: li.id,
            roleId: orig.roleId,
            billRateCad: li.billRateCad,
            payRateCad: li.payRateCad,
            hours: li.hoursPerMonth,
            revenueCad: li.revenueCad,
            costCad: li.costCad,
            profitCad: li.profitCad,
            actualSalaryBdt: li.actualSalaryBdt,
            roleRevisedSavingBdt: li.roleRevisedSavingBdt,
            roleRevisedSavingCad: li.roleRevisedSavingCad,
            fxAdvantageCad: li.fxAdvantageCad,
          };
        }),
      },
    },
  });

  redirect(`/dashboard/invoices/${batch.id}`);
}

export async function finalizeInvoice(id: string) {
  await db.invoiceBatch.update({
    where: { id },
    data: { status: "finalized", finalizedAt: new Date() },
  });
}

export async function markDownloaded(id: string) {
  await db.invoiceBatch.update({
    where: { id },
    data: { status: "downloaded", downloadedAt: new Date() },
  });
}

export async function saveOwnerReportPreferences(id: string, data: {
  roleRevisedEnabled: boolean;
  fxAdvantageEnabled: boolean;
  sendingRateBdt: number;
}) {
  const invoice = await db.invoiceBatch.findUnique({
    where: { id },
    include: { lineItems: true },
  });
  if (!invoice) return;

  // Recalculate with new preferences
  const employees = invoice.lineItems.map((li) => ({
    id: li.employeeId,
    billRateCad: Number(li.billRateCad),
    payRateCad: Number(li.payRateCad),
    hoursPerMonth: Number(li.hours),
    actualSalaryBdt: Number(li.actualSalaryBdt),
  }));

  const result = calculateRevenue(employees, {
    agreedRateBdt: Number(invoice.agreedRateBdt),
    sendingRateBdt: data.sendingRateBdt,
    agentSplitPct: Number(invoice.agentSharePct ?? 0) / 100,
    roleRevisedEnabled: data.roleRevisedEnabled,
    fxAdvantageEnabled: data.fxAdvantageEnabled,
  });

  await db.invoiceBatch.update({
    where: { id },
    data: {
      roleRevisedEnabled: data.roleRevisedEnabled,
      fxAdvantageEnabled: data.fxAdvantageEnabled,
      sendingRateBdt: data.sendingRateBdt,
      ownerRoleRevisedSavingCad: result.roleRevisedSavingCad,
      ownerFxAdvantageCad: result.fxAdvantageCad,
      ownerTotalCad: result.ownerTotalCad,
      ownerTotalBdt: result.ownerTotalBdt,
    },
  });
}
