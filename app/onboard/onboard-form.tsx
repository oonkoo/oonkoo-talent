"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertLeadFromOnboard, type OnboardInput } from "./actions";

type FormState = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  teamSize: number | null;
  roleBreakdown: Record<string, number>;
  employmentType: string;
  experienceLevel: string;
  message: string;
};

const ROLE_DEFS = [
  { key: "fullstack", label: "Full-stack developers" },
  { key: "bi", label: "BI / Data engineers" },
  { key: "design", label: "Designers" },
] as const;

const EMPLOYMENT = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
];

const EXPERIENCE = [
  { value: "junior", label: "Junior / Fresh-grad" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "mixed", label: "Mixed (we'll discuss)" },
];

export function OnboardForm({ initial }: { initial: FormState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormState>(initial);

  const totalTeamSize = useMemo(
    () =>
      Object.values(data.roleBreakdown).reduce(
        (sum, n) => sum + (Number.isFinite(n) ? n : 0),
        0,
      ),
    [data.roleBreakdown],
  );

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setRoleCount(role: string, count: number) {
    setData((d) => {
      const next = { ...d.roleBreakdown };
      if (count <= 0) delete next[role];
      else next[role] = count;
      return { ...d, roleBreakdown: next };
    });
  }

  function validateStep1(): string | null {
    if (!data.companyName.trim()) return "Company name is required.";
    if (!data.contactName.trim()) return "Contact name is required.";
    if (!data.contactEmail.trim()) return "Contact email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail))
      return "Please enter a valid email.";
    if (!data.contactPhone.trim()) return "Phone number is required.";
    return null;
  }

  function validateStep2(): string | null {
    if (totalTeamSize < 1) return "Add at least one role to the team.";
    if (!data.employmentType) return "Pick an employment type.";
    if (!data.experienceLevel) return "Pick an experience level.";
    return null;
  }

  function step1Payload(): OnboardInput {
    return {
      companyName: data.companyName.trim(),
      contactName: data.contactName.trim(),
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone.trim(),
    };
  }

  function step2Payload(): OnboardInput {
    return {
      teamSize: totalTeamSize,
      roleBreakdown: data.roleBreakdown,
      employmentType: data.employmentType as OnboardInput["employmentType"],
      experienceLevel: data.experienceLevel as OnboardInput["experienceLevel"],
    };
  }

  function step3Payload(): OnboardInput {
    return {
      message: data.message.trim() || undefined,
    };
  }

  async function save(payload: OnboardInput) {
    try {
      await upsertLeadFromOnboard(payload);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    }
  }

  function next() {
    let validation: string | null = null;
    let payload: OnboardInput | null = null;
    if (step === 1) {
      validation = validateStep1();
      payload = step1Payload();
    } else if (step === 2) {
      validation = validateStep2();
      payload = step2Payload();
    }
    if (validation) {
      setError(validation);
      return;
    }
    if (payload) {
      startTransition(async () => {
        const ok = await save(payload!);
        if (ok) setStep((s) => s + 1);
      });
    } else {
      setStep((s) => s + 1);
    }
  }

  function submit() {
    startTransition(async () => {
      const ok = await save(step3Payload());
      if (ok) router.push("/onboard/thank-you");
    });
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <Stepper current={step} />

        {step === 1 && (
          <div className="space-y-4">
            <FormHeading
              title="About your company"
              subtitle="Who are we talking to and which company are you?"
            />
            <Field label="Company name" htmlFor="companyName">
              <Input
                id="companyName"
                value={data.companyName}
                onChange={(e) => patch("companyName", e.target.value)}
                placeholder="Acme Inc."
                disabled={pending}
              />
            </Field>
            <Field label="Your name" htmlFor="contactName">
              <Input
                id="contactName"
                value={data.contactName}
                onChange={(e) => patch("contactName", e.target.value)}
                placeholder="Jane Doe"
                disabled={pending}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="contactEmail">
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) => patch("contactEmail", e.target.value)}
                  placeholder="jane@acme.com"
                  disabled={pending}
                />
              </Field>
              <Field label="Phone" htmlFor="contactPhone">
                <Input
                  id="contactPhone"
                  type="tel"
                  value={data.contactPhone}
                  onChange={(e) => patch("contactPhone", e.target.value)}
                  placeholder="+1 555 123 4567"
                  disabled={pending}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <FormHeading
              title="What does your team look like?"
              subtitle="How many of each role and at what level."
            />

            <div className="space-y-3">
              <Label>Team composition</Label>
              <div className="space-y-2">
                {ROLE_DEFS.map((role) => (
                  <div
                    key={role.key}
                    className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
                  >
                    <span className="text-sm">{role.label}</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20 text-right tabular-nums"
                      value={data.roleBreakdown[role.key] ?? ""}
                      onChange={(e) =>
                        setRoleCount(role.key, Number(e.target.value) || 0)
                      }
                      disabled={pending}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium tabular-nums">
                    {totalTeamSize}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Employment type" htmlFor="employmentType">
                <Select
                  value={data.employmentType}
                  onValueChange={(v) => patch("employmentType", v)}
                  disabled={pending}
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Pick one…" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Experience level" htmlFor="experienceLevel">
                <Select
                  value={data.experienceLevel}
                  onValueChange={(v) => patch("experienceLevel", v)}
                  disabled={pending}
                >
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Pick one…" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <FormHeading
              title="Anything else we should know?"
              subtitle="Stack, deadlines, ambitions — whatever helps us scope the right pod."
            />
            <Field label="Short message (optional)" htmlFor="message">
              <Textarea
                id="message"
                value={data.message}
                onChange={(e) => patch("message", e.target.value)}
                rows={6}
                placeholder="We're a seed-stage SaaS — looking to build out a Next.js + Postgres app. Need to ship MVP in 8 weeks."
                disabled={pending}
              />
            </Field>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || pending}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={next} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Next"
              )}
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs">
      {[1, 2, 3].map((n) => {
        const active = n === current;
        const done = n < current;
        return (
          <li key={n} className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full border text-xs tabular-nums ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : done
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                    : "border-border text-muted-foreground"
              }`}
            >
              {n}
            </span>
            {n < 3 && <span className="h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function FormHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
