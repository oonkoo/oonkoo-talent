import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import { isOwnerEmail, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function OnboardThankYouPage() {
  const user = await requireAuth();

  if (isOwnerEmail(user.email)) {
    redirect("/dashboard");
  }

  // If they bounced here without a lead, send them through the form.
  const lead = await db.lead.findUnique({
    where: { kindeUserId: user.id },
    select: { contactName: true, companyName: true },
  });

  if (!lead) {
    redirect("/onboard");
  }

  const firstName = lead.contactName?.split(" ")[0] ?? "there";

  return (
    <Card>
      <CardContent className="space-y-5 p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-6 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Thanks, {firstName}.
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve got your details
            {lead.companyName ? ` for ${lead.companyName}` : ""}. Someone from
            the OonkoO Talent team will reach out within 24 hours to walk you
            through the next steps and propose a pod that fits.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
