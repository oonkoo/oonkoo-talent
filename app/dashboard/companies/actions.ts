"use server";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import { slugify } from "@/lib/slug";

export async function getCompanies() {
  const companies = await db.company.findMany({
    include: {
      agents: { where: { isActive: true }, take: 1 },
      _count: { select: { employees: { where: { status: "active" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return serialize(companies);
}

export type CompanyWithDetails = Awaited<ReturnType<typeof getCompanies>>[number];

export async function getCompany(slug: string) {
  const company = await db.company.findUnique({
    where: { slug },
    include: {
      agents: { where: { isActive: true } },
      employees: {
        where: { status: "active" },
        include: { role: true },
        orderBy: { fullName: "asc" },
      },
      rateConfigs: {
        where: { effectiveTo: null },
        include: { role: true },
        orderBy: { role: { title: "asc" } },
      },
      _count: { select: { employees: { where: { status: "active" } } } },
    },
  });
  if (!company) notFound();
  return serialize(company);
}

export type CompanyFull = Awaited<ReturnType<typeof getCompany>>;

export async function updateCompany(slug: string, data: {
  name: string;
  country: string;
  currency: string;
  contactName: string;
  contactEmail: string;
  billingAddress?: string;
  agreedRateBdt: number;
  agentEnabled: boolean;
}) {
  const newSlug = slugify(data.name);
  await db.company.update({
    where: { slug },
    data: { ...data, slug: newSlug, billingAddress: data.billingAddress || null },
  });
  revalidatePath("/dashboard/companies");
  revalidatePath(`/dashboard/companies/${slug}`);
  if (newSlug !== slug) {
    revalidatePath(`/dashboard/companies/${newSlug}`);
  }
  return { slug: newSlug };
}

export async function deleteCompany(slug: string) {
  await db.company.delete({ where: { slug } });
  revalidatePath("/dashboard/companies");
}

export async function getAgent(agentId: string) {
  const agent = await db.agent.findUnique({ where: { id: agentId } });
  if (!agent) notFound();
  return serialize(agent);
}

export async function upsertAgent(companyId: string, data: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  revenueSharePct: number;
  notes?: string;
}) {
  if (data.id) {
    await db.agent.update({
      where: { id: data.id },
      data: { name: data.name, email: data.email || null, phone: data.phone || null, revenueSharePct: data.revenueSharePct, notes: data.notes || null },
    });
    return;
  }
  await db.agent.create({
    data: { companyId, name: data.name, email: data.email || null, phone: data.phone || null, revenueSharePct: data.revenueSharePct, notes: data.notes || null },
  });
}

export async function upsertRateConfig(companyId: string, data: {
  id?: string;
  roleId: string;
  billRateCad: number;
  defaultPayRateCad: number;
  maxPayRateCad: number;
  hoursPerMonth: number;
}) {
  if (data.id) {
    await db.rateConfig.update({
      where: { id: data.id },
      data: { billRateCad: data.billRateCad, defaultPayRateCad: data.defaultPayRateCad, maxPayRateCad: data.maxPayRateCad, hoursPerMonth: data.hoursPerMonth },
    });
    return;
  }
  await db.rateConfig.create({
    data: { companyId, roleId: data.roleId, billRateCad: data.billRateCad, defaultPayRateCad: data.defaultPayRateCad, maxPayRateCad: data.maxPayRateCad, hoursPerMonth: data.hoursPerMonth, effectiveFrom: new Date() },
  });
}

export async function deleteRateConfig(id: string) {
  await db.rateConfig.delete({ where: { id } });
}

export async function getRoles() {
  return serialize(await db.employeeRole.findMany({ orderBy: { title: "asc" } }));
}
