import { redirect } from "next/navigation";
import { isOwnerEmail, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Post-Kinde routing. The landing-page CTA sends users here with
 * post_login_redirect_url=/auth/callback. We resolve the user and forward
 * them to the right place based on their state.
 *
 * Owner → /dashboard
 * Non-owner with completed onboard form → /onboard/thank-you
 *                       with a converted lead → linked company portal (future)
 *                       otherwise → /onboard
 * No matching lead yet → /onboard
 */
export default async function AuthCallbackPage() {
  const user = await requireAuth();

  if (isOwnerEmail(user.email)) {
    redirect("/dashboard");
  }

  const lead = await db.lead.findUnique({
    where: { kindeUserId: user.id },
    include: { convertedCompany: { select: { slug: true } } },
  });

  if (!lead) {
    redirect("/onboard");
  }

  if (lead.convertedCompany) {
    // Future-state company portal lives at /[slug]; for v1 we acknowledge
    // the conversion and send them through the thank-you screen.
    redirect("/onboard/thank-you");
  }

  const onboardComplete =
    !!lead.companyName &&
    !!lead.contactName &&
    !!lead.contactPhone &&
    !!lead.teamSize &&
    !!lead.employmentType &&
    !!lead.experienceLevel;

  redirect(onboardComplete ? "/onboard/thank-you" : "/onboard");
}
