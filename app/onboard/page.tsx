import { redirect } from "next/navigation";
import { isOwnerEmail, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import { OnboardForm } from "./onboard-form";

export default async function OnboardPage() {
  const user = await requireAuth();

  // Owner is not the audience for this form.
  if (isOwnerEmail(user.email)) {
    redirect("/dashboard");
  }

  const lead = await db.lead.findUnique({
    where: { kindeUserId: user.id },
  });

  // If they've already filled out the form, send them to the confirmation.
  if (
    lead &&
    lead.companyName &&
    lead.contactPhone &&
    lead.teamSize &&
    lead.employmentType &&
    lead.experienceLevel
  ) {
    redirect("/onboard/thank-you");
  }

  const initial = {
    companyName: lead?.companyName ?? "",
    contactName:
      lead?.contactName ??
      [user.given_name, user.family_name].filter(Boolean).join(" ").trim() ??
      "",
    contactEmail: lead?.contactEmail ?? user.email ?? "",
    contactPhone: lead?.contactPhone ?? "",
    teamSize: lead?.teamSize ?? null,
    roleBreakdown: lead?.roleBreakdown
      ? (serialize(lead.roleBreakdown) as Record<string, number>)
      : {},
    employmentType: lead?.employmentType ?? "full_time",
    experienceLevel: lead?.experienceLevel ?? "",
    message: lead?.message ?? "",
  };

  return <OnboardForm initial={initial} />;
}
