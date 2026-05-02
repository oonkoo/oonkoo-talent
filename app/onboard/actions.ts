"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth, isOwnerEmail } from "@/lib/auth";

const employmentEnum = z.enum(["full_time", "part_time", "contract"]);
const experienceEnum = z.enum(["junior", "mid", "senior", "mixed"]);

const roleBreakdownSchema = z.record(z.string(), z.number().int().min(0));

const onboardSchema = z.object({
  companyName: z.string().trim().min(1).max(120).optional(),
  contactName: z.string().trim().min(1).max(120).optional(),
  contactEmail: z.string().trim().email().max(200).optional(),
  contactPhone: z.string().trim().min(4).max(40).optional(),
  teamSize: z.number().int().min(1).max(500).optional(),
  roleBreakdown: roleBreakdownSchema.optional(),
  employmentType: employmentEnum.optional(),
  experienceLevel: experienceEnum.optional(),
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

  if (existing) {
    await db.lead.update({
      where: { id: existing.id },
      data: parsed,
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
        roleBreakdown: parsed.roleBreakdown ?? undefined,
        employmentType: parsed.employmentType ?? null,
        experienceLevel: parsed.experienceLevel ?? null,
        message: parsed.message ?? null,
      },
    });
  }

  revalidatePath("/onboard");
  revalidatePath("/dashboard/leads");
}
