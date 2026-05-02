import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  UserPlus,
  MailPlus,
  Briefcase,
  GraduationCap,
  Users,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLead } from "../actions";
import {
  AddNoteForm,
  LeadConvertDialog,
  LeadStatusSelect,
} from "./lead-actions";

const EMPLOYMENT_LABEL: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
};

const EXPERIENCE_LABEL: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  mixed: "Mixed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRoleBreakdown(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => typeof v === "number" && v > 0,
  );
  if (entries.length === 0) return null;
  return entries.map(([role, count]) => `${count} × ${role}`).join(" · ");
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);

  const isConverted = !!lead.convertedCompanyId && !!lead.convertedCompany;
  const isSignup = lead.source === "SIGNUP";
  const roleSummary = formatRoleBreakdown(lead.roleBreakdown);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/leads">
          <ArrowLeft className="mr-1 size-4" />
          All leads
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {lead.contactName}
            </h2>
            <Badge variant="outline" className="font-normal">
              {isSignup ? (
                <UserPlus className="mr-1 size-3" />
              ) : (
                <MailPlus className="mr-1 size-3" />
              )}
              {isSignup ? "Signup" : "Contact form"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {lead.companyName ?? "No company name"} · received{" "}
            {formatDate(lead.createdAt as unknown as string)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LeadStatusSelect
            leadId={lead.id}
            current={lead.status}
            disabled={isConverted}
          />
          {!isConverted && lead.companyName && (
            <LeadConvertDialog leadId={lead.id} companyName={lead.companyName} />
          )}
        </div>
      </div>

      {isConverted && lead.convertedCompany && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-emerald-700" />
              <span>
                Converted to{" "}
                <span className="font-medium">{lead.convertedCompany.name}</span>
                {lead.convertedAt && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatDate(lead.convertedAt as unknown as string)}
                  </span>
                )}
              </span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/companies/${lead.convertedCompany.slug}`}>
                Open company
                <ExternalLink className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lead details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Section title="Contact">
              <Field icon={Mail} label="Email">
                <a
                  href={`mailto:${lead.contactEmail}`}
                  className="hover:underline"
                >
                  {lead.contactEmail}
                </a>
              </Field>
              <Field icon={Phone} label="Phone">
                {lead.contactPhone ?? <Empty />}
              </Field>
              <Field icon={Building2} label="Company">
                {lead.companyName ?? <Empty />}
              </Field>
            </Section>

            {(lead.teamSize || roleSummary || lead.employmentType || lead.experienceLevel) && (
              <>
                <Separator />
                <Section title="What they need">
                  <Field icon={Users} label="Team size">
                    {lead.teamSize ? (
                      <span className="tabular-nums">{lead.teamSize}</span>
                    ) : (
                      <Empty />
                    )}
                  </Field>
                  <Field icon={Users} label="Roles">
                    {roleSummary ?? <Empty />}
                  </Field>
                  <Field icon={Briefcase} label="Employment">
                    {lead.employmentType
                      ? EMPLOYMENT_LABEL[lead.employmentType] ?? lead.employmentType
                      : <Empty />}
                  </Field>
                  <Field icon={GraduationCap} label="Experience">
                    {lead.experienceLevel
                      ? EXPERIENCE_LABEL[lead.experienceLevel] ?? lead.experienceLevel
                      : <Empty />}
                  </Field>
                </Section>
              </>
            )}

            {lead.message && (
              <>
                <Separator />
                <Section title="Message">
                  <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
                </Section>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddNoteForm leadId={lead.id} />

            {lead.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {lead.notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-md border border-border/50 bg-muted/30 p-3 text-sm"
                  >
                    <p className="whitespace-pre-wrap">{note.body}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(note.createdAt as unknown as string)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

function Empty() {
  return <span className="text-muted-foreground">—</span>;
}
