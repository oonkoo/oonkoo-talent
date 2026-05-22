"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireAuth, isOwnerEmail } from "@/lib/auth";

const employmentEnum = z.enum(["full_time", "part_time", "contract"]);
const experienceEnum = z.enum(["junior", "mid", "senior", "mixed"]);
const tierEnum = z.enum(["junior", "mid", "senior"]);
const contractLengthEnum = z.enum(["6mo", "1yr", "3yr"]);

const roleBreakdownSchema = z.record(z.string(), z.number().int().min(0));

const podSpecRoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  count: z.number().int().min(0).max(50),
  years: z.number().int().min(1).max(10),
  tier: tierEnum,
  hourlyRateCad: z.number().min(0).max(10_000),
});

const onboardSchema = z.object({
  companyName: z.string().trim().min(1).max(120).optional(),
  contactName: z.string().trim().min(1).max(120).optional(),
  contactEmail: z.string().trim().email().max(200).optional(),
  contactPhone: z.string().trim().min(4).max(40).optional(),
  teamSize: z.number().int().min(1).max(500).optional(),
  roleBreakdown: roleBreakdownSchema.optional(),
  podSpec: z.array(podSpecRoleSchema).optional(),
  employmentType: employmentEnum.optional(),
  experienceLevel: experienceEnum.optional(),
  contractLength: contractLengthEnum.optional(),
  contractMonths: z.number().int().min(1).max(120).optional(),
  quoteHourlyCad: z.number().min(0).max(1_000_000).optional(),
  quoteMonthlyCad: z.number().min(0).max(100_000_000).nullable().optional(),
  quoteTotalCad: z.number().min(0).max(1_000_000_000).nullable().optional(),
  message: z.string().trim().max(2000).optional(),
});

export type OnboardInput = z.infer<typeof onboardSchema>;

/**
 * Idempotent upsert keyed on the Kinde user id. Each step of the multi-step
 * form calls this with the fields it owns; missing fields are left untouched
 * on update. On first call, creates a Lead with source=SIGNUP and prefills
 * the contact email from Kinde when not supplied.
 *
 * Refuses to run for the owner — the owner has no business filling out
 * an onboarding form. Returns void; the client navigates after success.
 */
export async function upsertLeadFromOnboard(input: OnboardInput): Promise<void> {
  const user = await requireAuth();

  if (isOwnerEmail(user.email)) {
    throw new Error("Owner cannot submit the onboarding form.");
  }

  const parsed = onboardSchema.parse(input);

  const existing = await db.lead.findUnique({
    where: { kindeUserId: user.id },
    select: { id: true },
  });

  const fallbackName =
    [user.given_name, user.family_name].filter(Boolean).join(" ").trim() ||
    user.email?.split("@")[0] ||
    "Unknown";

  // JSON fields need an explicit cast through Prisma.InputJsonValue.
  const podSpec =
    parsed.podSpec !== undefined
      ? (parsed.podSpec as unknown as Prisma.InputJsonValue)
      : undefined;
  const roleBreakdown =
    parsed.roleBreakdown !== undefined
      ? (parsed.roleBreakdown as unknown as Prisma.InputJsonValue)
      : undefined;

  if (existing) {
    await db.lead.update({
      where: { id: existing.id },
      data: {
        ...parsed,
        podSpec,
        roleBreakdown,
      },
    });
  } else {
    await db.lead.create({
      data: {
        source: "SIGNUP",
        status: "NEW",
        kindeUserId: user.id,
        contactName: parsed.contactName ?? fallbackName,
        contactEmail: parsed.contactEmail ?? user.email ?? "unknown@unknown",
        contactPhone: parsed.contactPhone ?? null,
        companyName: parsed.companyName ?? null,
        teamSize: parsed.teamSize ?? null,
        roleBreakdown: roleBreakdown ?? undefined,
        podSpec: podSpec ?? undefined,
        employmentType: parsed.employmentType ?? null,
        experienceLevel: parsed.experienceLevel ?? null,
        contractLength: parsed.contractLength ?? null,
        contractMonths: parsed.contractMonths ?? null,
        quoteHourlyCad: parsed.quoteHourlyCad ?? null,
        quoteMonthlyCad: parsed.quoteMonthlyCad ?? null,
        quoteTotalCad: parsed.quoteTotalCad ?? null,
        message: parsed.message ?? null,
      },
    });
  }

  revalidatePath("/onboard");
  revalidatePath("/dashboard/leads");
}
