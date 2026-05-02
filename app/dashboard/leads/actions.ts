"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import { requireOwner } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import { LeadStatus } from "@/lib/generated/prisma/enums";

export async function getLeads() {
  await requireOwner();
  const leads = await db.lead.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { notes: true } },
      convertedCompany: { select: { slug: true, name: true } },
    },
  });
  return serialize(leads);
}

export type LeadListItem = Awaited<ReturnType<typeof getLeads>>[number];

export async function getLead(id: string) {
  await requireOwner();
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      convertedCompany: { select: { slug: true, name: true } },
    },
  });
  if (!lead) notFound();
  return serialize(lead);
}

export type LeadFull = Awaited<ReturnType<typeof getLead>>;

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireOwner();
  await db.lead.update({ where: { id }, data: { status } });
  revalidatePath(`/dashboard/leads/${id}`);
  revalidatePath("/dashboard/leads");
}

export async function addLeadNote(id: string, body: string) {
  await requireOwner();
  const trimmed = body.trim();
  if (!trimmed) return;
  await db.leadNote.create({ data: { leadId: id, body: trimmed } });
  revalidatePath(`/dashboard/leads/${id}`);
}

export async function convertLeadToCompany(
  id: string,
  input: {
    country: string;
    agreedRateBdt: number;
    billingAddress?: string;
  },
) {
  await requireOwner();
  const lead = await db.lead.findUniqueOrThrow({ where: { id } });

  if (!lead.companyName) {
    throw new Error("Lead has no company name; cannot convert.");
  }
  if (lead.convertedCompanyId) {
    throw new Error("Lead is already converted.");
  }

  const slug = await generateUniqueSlug(lead.companyName);

  const company = await db.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        name: lead.companyName!,
        slug,
        country: input.country,
        contactName: lead.contactName,
        contactEmail: lead.contactEmail,
        agreedRateBdt: input.agreedRateBdt,
        billingAddress: input.billingAddress?.trim() || null,
      },
    });
    await tx.lead.update({
      where: { id },
      data: {
        status: "CONVERTED",
        convertedCompanyId: created.id,
        convertedAt: new Date(),
      },
    });
    return created;
  });

  revalidatePath(`/dashboard/leads/${id}`);
  revalidatePath("/dashboard/leads");
  redirect(`/dashboard/companies/${company.slug}`);
}
