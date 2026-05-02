"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { companySchema, type CompanyFormValues } from "./schema";

export async function createCompany(values: CompanyFormValues) {
  const parsed = companySchema.parse(values);
  const slug = slugify(parsed.name);

  const company = await db.company.create({
    data: {
      name: parsed.name,
      slug,
      country: parsed.country,
      currency: parsed.currency,
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      billingAddress: parsed.billingAddress || null,
      agreedRateBdt: parsed.agreedRateBdt,
      agentEnabled: parsed.agentEnabled,
    },
  });

  if (parsed.agentEnabled && parsed.agentName) {
    await db.agent.create({
      data: {
        companyId: company.id,
        name: parsed.agentName,
        email: parsed.agentEmail || null,
        phone: parsed.agentPhone || null,
        revenueSharePct: parsed.agentRevenueSharePct ?? 0,
        notes: parsed.agentNotes || null,
      },
    });
  }

  redirect(`/dashboard/companies/${company.slug}`);
}
