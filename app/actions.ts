"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(120).optional(),
  message: z.string().trim().min(1).max(2000),
});

export type ContactFormInput = z.infer<typeof contactSchema>;

export async function createLeadFromContact(input: ContactFormInput): Promise<void> {
  const parsed = contactSchema.parse({
    ...input,
    company: input.company?.trim() || undefined,
  });

  await db.lead.create({
    data: {
      source: "CONTACT_FORM",
      status: "NEW",
      contactName: parsed.name,
      contactEmail: parsed.email,
      companyName: parsed.company ?? null,
      message: parsed.message,
    },
  });

  revalidatePath("/dashboard/leads");
}
