import { z } from "zod";

export const companySchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(1, "Company name is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required").default("CAD"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  billingAddress: z.string().optional(),

  // Step 2: Contract
  agreedRateBdt: z.coerce
    .number({ error: "Must be a positive number" })
    .positive("Rate must be positive"),

  // Step 3: Agent
  agentEnabled: z.boolean().default(false),
  agentName: z.string().optional(),
  agentEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  agentPhone: z.string().optional(),
  agentRevenueSharePct: z.coerce.number().min(0).max(100).optional(),
  agentNotes: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export const step1Schema = companySchema.pick({
  name: true,
  country: true,
  currency: true,
  contactName: true,
  contactEmail: true,
  billingAddress: true,
});

export const step2Schema = companySchema.pick({
  agreedRateBdt: true,
});

export const step3Schema = companySchema
  .pick({
    agentEnabled: true,
    agentName: true,
    agentEmail: true,
    agentPhone: true,
    agentRevenueSharePct: true,
    agentNotes: true,
  })
  .refine(
    (data) => !data.agentEnabled || (data.agentName && data.agentName.length > 0),
    { message: "Agent name is required when agent is enabled", path: ["agentName"] }
  )
  .refine(
    (data) =>
      !data.agentEnabled ||
      (data.agentRevenueSharePct !== undefined && data.agentRevenueSharePct > 0),
    {
      message: "Revenue share is required when agent is enabled",
      path: ["agentRevenueSharePct"],
    }
  );
