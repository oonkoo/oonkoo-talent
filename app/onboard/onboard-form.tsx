"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "@/components/CountUp";
import { upsertLeadFromOnboard, type OnboardInput } from "./actions";

type ExperienceLevel = "junior" | "mid" | "senior" | "mixed";
type EmploymentType = "full_time" | "part_time" | "contract";

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

// ───────────────────────────────────────────────────────────────────────────
// Role + rate ladder mirrors the landing PodCalculator. Devs are baseline; the
// modifier shifts the per-year rate. Years drives the experience tier shown in
// the right rail and the auto-derived `experienceLevel` we send to the server.
// ───────────────────────────────────────────────────────────────────────────

type RoleId = "dev" | "designer" | "bi" | "qa";

const ROLES: { id: RoleId; name: string; hint: string; modifier: number }[] = [
  { id: "dev", name: "Developers", hint: "Full-stack · frontend · backend", modifier: 0 },
  { id: "designer", name: "Designers", hint: "Product / UX · a bit less", modifier: -1 },
  { id: "bi", name: "BI engineers", hint: "Data + dashboards · a bit more", modifier: 1 },
  { id: "qa", name: "QA engineers", hint: "Manual + automation · a bit less", modifier: -1 },
];

const RATE_BY_YEAR: Record<number, number> = {
  1: 4, 2: 5, 3: 8, 4: 9, 5: 10, 6: 11, 7: 12, 8: 13, 9: 14, 10: 15,
};
const FULL_TIME_HOURS_PER_MONTH = 162.5;
const PART_TIME_HOURS_PER_MONTH = 81.25;
const MIN_YEARS = 1;
const MAX_YEARS = 10;
const MAX_COUNT = 20;

// null = no monthly cadence (contract = project-scoped). Falls back to
// full-time when the user hasn't picked yet, so the totals panel previews
// something sensible on first paint.
function monthlyHoursFor(emp: string): number | null {
  if (emp === "part_time") return PART_TIME_HOURS_PER_MONTH;
  if (emp === "contract") return null;
  return FULL_TIME_HOURS_PER_MONTH;
}

function rateForRole(years: number, modifier: number): number {
  const clamped = Math.max(MIN_YEARS, Math.min(MAX_YEARS, years));
  return Math.max(1, (RATE_BY_YEAR[clamped] ?? 4) + modifier);
}

function tierForYears(years: number): "junior" | "mid" | "senior" {
  if (years <= 2) return "junior";
  if (years <= 5) return "mid";
  return "senior";
}

const EMPLOYMENT: { value: EmploymentType; label: string; sub: string }[] = [
  { value: "full_time", label: "Full-time", sub: "Embedded · 40 hr / wk" },
  { value: "part_time", label: "Part-time", sub: "20 hr / wk or hourly" },
  { value: "contract", label: "Contract", sub: "Project-scoped" },
];

const EXPERIENCE: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "mixed", label: "Mixed" },
];

const CONTRACTS = [
  { id: "6mo", label: "6 months", months: 6 },
  { id: "1yr", label: "1 year", months: 12 },
  { id: "3yr", label: "3 years", months: 36 },
] as const;
type ContractId = (typeof CONTRACTS)[number]["id"];

const STEPS = [
  { n: 1, label: "Who you are" },
  { n: 2, label: "Your pod" },
  { n: 3, label: "Anything else" },
] as const;

// ───────────────────────────────────────────────────────────────────────────

export function OnboardForm({ initial }: { initial: FormState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormState>(initial);

  // Per-role years — local UI state only. Used to compute the indicative rate
  // and to auto-derive the experience level we submit.
  const [yearsByRole, setYearsByRole] = useState<Record<RoleId, number>>({
    dev: 1, designer: 1, bi: 1, qa: 1,
  });

  // Has the user manually picked an experience level? If not, we keep it
  // synced with the auto-derived tier from yearsByRole.
  const [experienceOverridden, setExperienceOverridden] = useState(
    Boolean(initial.experienceLevel),
  );

  // Contract length — local UI only, used to project total cost. Not part of
  // the onboard schema; we surface it to the team as context in the message.
  const [contractId, setContractId] = useState<ContractId>("1yr");
  const contract =
    CONTRACTS.find((c) => c.id === contractId) ?? CONTRACTS[1];

  const totalTeamSize = useMemo(
    () =>
      Object.values(data.roleBreakdown).reduce(
        (sum, n) => sum + (Number.isFinite(n) ? n : 0),
        0,
      ),
    [data.roleBreakdown],
  );

  const totals = useMemo(() => {
    let hourly = 0;
    for (const role of ROLES) {
      const count = data.roleBreakdown[role.id] ?? 0;
      if (count <= 0) continue;
      hourly += count * rateForRole(yearsByRole[role.id], role.modifier);
    }
    const monthlyHours = monthlyHoursFor(data.employmentType);
    const monthly =
      monthlyHours !== null ? Math.round(hourly * monthlyHours) : null;
    const total = monthly !== null ? monthly * contract.months : null;
    return {
      hourly: Math.round(hourly),
      monthly,
      total,
      monthlyHours,
    };
  }, [data.roleBreakdown, yearsByRole, data.employmentType, contract.months]);

  const isContract = data.employmentType === "contract";
  const isPartTime = data.employmentType === "part_time";
  const weekLabel = isPartTime ? "20 hr/wk" : "40 hr/wk";

  const derivedExperience: ExperienceLevel | null = useMemo(() => {
    const tiers = new Set<string>();
    for (const role of ROLES) {
      const count = data.roleBreakdown[role.id] ?? 0;
      if (count <= 0) continue;
      tiers.add(tierForYears(yearsByRole[role.id]));
    }
    if (tiers.size === 0) return null;
    if (tiers.size > 1) return "mixed";
    return [...tiers][0] as ExperienceLevel;
  }, [data.roleBreakdown, yearsByRole]);

  const effectiveExperience: ExperienceLevel | null =
    experienceOverridden && data.experienceLevel
      ? (data.experienceLevel as ExperienceLevel)
      : derivedExperience;

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setRoleCount(role: RoleId, delta: number) {
    setData((d) => {
      const current = d.roleBreakdown[role] ?? 0;
      const next = Math.max(0, Math.min(MAX_COUNT, current + delta));
      const map = { ...d.roleBreakdown };
      if (next <= 0) delete map[role];
      else map[role] = next;
      return { ...d, roleBreakdown: map };
    });
  }

  function adjustYears(role: RoleId, delta: number) {
    setYearsByRole((prev) => ({
      ...prev,
      [role]: Math.max(MIN_YEARS, Math.min(MAX_YEARS, prev[role] + delta)),
    }));
  }

  function validateStep1(): string | null {
    if (!data.companyName.trim()) return "Company name is required.";
    if (!data.contactName.trim()) return "Your name is required.";
    if (!data.contactEmail.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail))
      return "That email looks off — double-check it?";
    if (!data.contactPhone.trim()) return "Phone number is required.";
    return null;
  }

  function validateStep2(): string | null {
    if (totalTeamSize < 1) return "Add at least one role to your pod.";
    if (!data.employmentType) return "Pick an employment shape.";
    if (!effectiveExperience) return "Set experience for at least one role.";
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
    // Per-role spec with derived rate + tier, captured at submit time so the
    // owner can see exactly what the prospect was looking at.
    const podSpec = ROLES.flatMap((role) => {
      const count = data.roleBreakdown[role.id] ?? 0;
      if (count <= 0) return [];
      const years = yearsByRole[role.id];
      return [
        {
          id: role.id,
          name: role.name,
          count,
          years,
          tier: tierForYears(years),
          hourlyRateCad: rateForRole(years, role.modifier),
        },
      ];
    });

    return {
      teamSize: totalTeamSize,
      roleBreakdown: data.roleBreakdown,
      podSpec,
      employmentType: data.employmentType as OnboardInput["employmentType"],
      experienceLevel: (effectiveExperience ??
        "mixed") as OnboardInput["experienceLevel"],
      contractLength: contractId,
      contractMonths: contract.months,
      quoteHourlyCad: totals.hourly,
      quoteMonthlyCad: totals.monthly,
      quoteTotalCad: totals.total,
    };
  }

  function step3Payload(): OnboardInput {
    return { message: data.message.trim() || undefined };
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

  function goNext() {
    if (step === 1) {
      const validation = validateStep1();
      if (validation) {
        setError(validation);
        return;
      }
      startTransition(async () => {
        const ok = await save(step1Payload());
        if (ok) setStep(2);
      });
      return;
    }

    if (step === 2) {
      const validation = validateStep2();
      if (validation) {
        setError(validation);
        return;
      }
      // Step 2 doesn't persist on its own — if it did, the server-side
      // redirect to /thank-you would fire (all required fields would be set)
      // and the user would never see step 3. We commit step 2's fields
      // together with step 3 at final submit.
      if (effectiveExperience) {
        patch("experienceLevel", effectiveExperience);
      }
      setError(null);
      setStep(3);
    }
  }

  function submit() {
    startTransition(async () => {
      const ok = await save({
        ...step2Payload(),
        ...step3Payload(),
      });
      if (ok) router.push("/onboard/thank-you");
    });
  }

  return (
    <div className="space-y-10 md:space-y-12">
      {step !== 2 && (
        <header className="grid grid-cols-12 gap-x-8 gap-y-10 items-center">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="ot-rise font-display text-[clamp(2.2rem,5.5vw,4.25rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground [animation-delay:140ms]">
              Let&rsquo;s scope your{" "}
              <span className="relative inline-block align-baseline whitespace-nowrap px-2 mx-0.5">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[0.18em] -z-10 h-[0.62em] -skew-y-[1.2deg] bg-accent"
                />
                <span
                  className="relative font-handwritten text-foreground"
                  style={{
                    fontSize: "1.05em",
                    lineHeight: 0.85,
                    letterSpacing: "-0.01em",
                  }}
                >
                  pod
                </span>
              </span>
              .
            </h1>
          </div>

          <aside className="hidden lg:flex col-span-4 justify-end">
            <div className="ot-rise relative flex flex-col items-end gap-3 pt-2 [animation-delay:420ms]">
              <Image
                src="/elements/lime-circle.svg"
                alt=""
                width={96}
                height={96}
                aria-hidden
                className="absolute -top-4 -right-4 -z-10 w-[96px] h-[96px] opacity-90"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Time to shortlist
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[56px] leading-[0.85] tracking-[-0.04em] text-foreground">
                  5
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                  days
                </span>
              </div>
              <span className="h-px w-12 bg-foreground/15" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                From submit to faces
              </span>
            </div>
          </aside>
        </header>
      )}

      <Stepper current={step} />

      <div className="ot-rise [animation-delay:120ms]">
        {step === 1 && (
          <StepShell
            kicker="01 · who you are"
            title="About your company"
            subtitle="Who are we talking to, and which company are you?"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              <LineField label="Company" htmlFor="companyName">
                <input
                  id="companyName"
                  className="ot-line-input"
                  value={data.companyName}
                  onChange={(e) => patch("companyName", e.target.value)}
                  placeholder="Acme Inc."
                  disabled={pending}
                  autoComplete="organization"
                />
              </LineField>
              <LineField label="Your name" htmlFor="contactName">
                <input
                  id="contactName"
                  className="ot-line-input"
                  value={data.contactName}
                  onChange={(e) => patch("contactName", e.target.value)}
                  placeholder="Jane Doe"
                  disabled={pending}
                  autoComplete="name"
                />
              </LineField>
              <LineField label="Email" htmlFor="contactEmail">
                <input
                  id="contactEmail"
                  type="email"
                  className="ot-line-input"
                  value={data.contactEmail}
                  onChange={(e) => patch("contactEmail", e.target.value)}
                  placeholder="jane@acme.com"
                  disabled={pending}
                  autoComplete="email"
                />
              </LineField>
              <LineField label="Phone" htmlFor="contactPhone">
                <input
                  id="contactPhone"
                  type="tel"
                  className="ot-line-input"
                  value={data.contactPhone}
                  onChange={(e) => patch("contactPhone", e.target.value)}
                  placeholder="+1 555 123 4567"
                  disabled={pending}
                  autoComplete="tel"
                />
              </LineField>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            kicker="02 · your pod"
            title="What does your team look like?"
            subtitle="Dial in the role mix and experience. We'll come back with a roster, not a quote."
          >
            <div className="grid grid-cols-12 gap-x-8 gap-y-10">
              {/* ─── Role rows (left, span-7) ─── */}
              <div className="col-span-12 lg:col-span-7">
                {/* Header */}
                <div className="grid grid-cols-12 gap-x-3 pb-3 border-b border-foreground/15">
                  <div className="hidden md:block md:col-span-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Role
                  </div>
                  <div className="col-span-6 md:col-span-4 text-center md:text-left font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Years exp
                  </div>
                  <div className="col-span-6 md:col-span-4 text-center md:text-left font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Count
                  </div>
                </div>

                {ROLES.map((role) => {
                  const years = yearsByRole[role.id];
                  const count = data.roleBreakdown[role.id] ?? 0;
                  const rate = rateForRole(years, role.modifier);
                  return (
                    <div
                      key={role.id}
                      className="grid grid-cols-12 items-center gap-x-3 gap-y-3 py-5 border-b border-foreground/10"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <p className="font-display text-[18px] leading-tight tracking-[-0.02em] text-foreground">
                          {role.name}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 tabular-nums">
                          ${rate}/hr · per person
                        </p>
                      </div>
                      <div className="col-span-6 md:col-span-4 flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
                        <Stepper2
                          value={years}
                          min={MIN_YEARS}
                          max={MAX_YEARS}
                          suffix={years === MAX_YEARS ? "yr+" : "yr"}
                          onAdjust={(d) => adjustYears(role.id, d)}
                          ariaLabel={`Years ${role.name}`}
                          disabled={pending}
                        />
                        <TierBadge years={years} dimmed={count === 0} />
                      </div>
                      <div className="col-span-6 md:col-span-4 flex items-center justify-center md:justify-start">
                        <Stepper2
                          value={count}
                          min={0}
                          max={MAX_COUNT}
                          onAdjust={(d) => setRoleCount(role.id, d)}
                          ariaLabel={`Count ${role.name}`}
                          disabled={pending}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Employment + Experience picks */}
                <div className="mt-10 space-y-7">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                      Employment shape
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {EMPLOYMENT.map((opt) => {
                        const active = data.employmentType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => patch("employmentType", opt.value)}
                            disabled={pending}
                            className={cn(
                              "text-left rounded-md border px-4 py-3 transition-all duration-200",
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-foreground/15 hover:border-foreground/40 bg-transparent text-foreground",
                            )}
                          >
                            <p className="font-display text-[15px] leading-tight tracking-[-0.01em]">
                              {opt.label}
                            </p>
                            <p
                              className={cn(
                                "mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em]",
                                active
                                  ? "text-background/70"
                                  : "text-muted-foreground/70",
                              )}
                            >
                              {opt.sub}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!isContract && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        Contract length
                      </p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-7 gap-y-2">
                        {CONTRACTS.map((c) => {
                          const active = contractId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setContractId(c.id)}
                              disabled={pending}
                              className={cn(
                                "relative pb-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-200",
                                active
                                  ? "text-foreground"
                                  : "text-muted-foreground/70 hover:text-foreground",
                              )}
                            >
                              {c.label}
                              {active && (
                                <span
                                  aria-hidden
                                  className="absolute -bottom-px inset-x-0 h-[2px] bg-accent"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        Experience level
                      </p>
                      {derivedExperience && !experienceOverridden && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                          auto from your picks
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {EXPERIENCE.map((opt) => {
                        const active = effectiveExperience === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setExperienceOverridden(true);
                              patch("experienceLevel", opt.value);
                            }}
                            disabled={pending}
                            className={cn(
                              "rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all duration-200",
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-foreground/20 hover:border-foreground/50 text-foreground/80",
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      {experienceOverridden && (
                        <button
                          type="button"
                          onClick={() => {
                            setExperienceOverridden(false);
                            patch("experienceLevel", "");
                          }}
                          className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                          reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Totals rail (right, span-5) ─── */}
              <aside className="col-span-12 lg:col-span-5 lg:pl-8 lg:border-l lg:border-foreground/15">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Pod totals · indicative
                </p>
                <div className="mt-7 space-y-7">
                  <Stat label="Team size" value={totalTeamSize} />
                  <Stat
                    label="All-in hourly"
                    value={totals.hourly}
                    prefix="$"
                    suffix="/hr"
                  />

                  {isContract ? (
                    <div className="rounded-md border border-foreground/15 bg-foreground/[0.03] px-4 py-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        Engagement
                      </p>
                      <p className="mt-2 font-display text-[clamp(1.5rem,2.8vw,2.1rem)] leading-none tracking-[-0.03em] text-foreground">
                        Project-scoped
                      </p>
                      <p className="mt-3 text-[13px] leading-[1.55] text-muted-foreground">
                        Total depends on scope and duration. We&rsquo;ll lock the
                        number on the pod-fit call.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Stat
                        label={`Monthly · ${weekLabel}`}
                        value={totals.monthly ?? 0}
                        prefix="$"
                        withSeparator
                      />
                      <Stat
                        label={`Total over ${contract.label}`}
                        value={totals.total ?? 0}
                        prefix="$"
                        withSeparator
                        highlight
                      />
                    </>
                  )}

                  {effectiveExperience && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                        Experience read
                      </p>
                      <p className="mt-2 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-none tracking-[-0.03em] text-foreground capitalize">
                        {effectiveExperience === "mixed"
                          ? "Mixed seniorities"
                          : effectiveExperience}
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-9 max-w-[40ch] text-[13px] leading-[1.55] text-muted-foreground/70">
                  {isContract ? (
                    <>
                      Rates priced per hour.{" "}
                      <span className="text-foreground">
                        We&rsquo;ll scope hours and milestones with you before kick-off.
                      </span>{" "}
                      Final rate confirmed on the pod-fit call.
                    </>
                  ) : (
                    <>
                      Rate ladder at {totals.monthlyHours} billable hrs/month ·{" "}
                      {weekLabel}.{" "}
                      <span className="text-foreground">
                        Each 8-hr day, 7 are billed; the lunch hour is on us.
                      </span>{" "}
                      Final scope and rate confirmed on the pod-fit call.
                    </>
                  )}
                </p>
              </aside>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            kicker="03 · anything else"
            title="What should we know before we call?"
            subtitle="Stack, deadlines, ambitions — whatever helps us scope the right pod."
          >
            <LineField label="Short message (optional)" htmlFor="message">
              <textarea
                id="message"
                rows={6}
                className="ot-line-input resize-none"
                value={data.message}
                onChange={(e) => patch("message", e.target.value)}
                placeholder="We're a seed-stage SaaS — looking to build out a Next.js + Postgres app. Need to ship MVP in 8 weeks."
                disabled={pending}
              />
            </LineField>
          </StepShell>
        )}
      </div>

      {error && (
        <p className="ot-rise font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
          {error}
        </p>
      )}

      {/* Footer actions */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-y-4 pt-7",
          step === 2 && "border-t border-foreground/10",
        )}
      >
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || pending}
          className="group inline-flex items-center gap-1.5 px-1 py-2 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-4">
          <p className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            Step {step} of {STEPS.length}
          </p>
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={pending}
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-medium tracking-[-0.005em] text-primary-foreground transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-accent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-medium tracking-[-0.005em] text-primary-foreground transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <span>Send to the team</span>
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-accent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <ol className="ot-rise flex flex-wrap items-center gap-x-4 gap-y-2">
      {STEPS.map((s, i) => {
        const active = s.n === current;
        const done = s.n < current;
        return (
          <li key={s.n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full font-mono text-[10px] tabular-nums transition-colors",
                  active && "bg-foreground text-background",
                  done && "bg-foreground/10 text-foreground",
                  !active && !done && "bg-transparent border border-foreground/20 text-muted-foreground/70",
                )}
              >
                {String(s.n).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.22em]",
                  active ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="h-px w-8 bg-foreground/15" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground/70">
          {kicker}
        </p>
        <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] tracking-[-0.025em] text-foreground text-balance max-w-[26ch]">
          {title}
        </h2>
        <p className="max-w-[52ch] text-[15px] leading-[1.6] text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

function LineField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Stepper2({
  value,
  min,
  max,
  suffix,
  onAdjust,
  ariaLabel,
  disabled,
}: {
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onAdjust: (delta: number) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onAdjust(-1)}
        disabled={disabled || value <= min}
        className="size-7 rounded-full border border-foreground/20 hover:border-foreground/50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="size-3" />
      </button>
      <span className="flex items-baseline gap-1 min-w-[3.5ch] justify-center">
        <span className="font-display text-[20px] leading-none tracking-[-0.02em] tabular-nums text-foreground">
          {value}
        </span>
        {suffix && (
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">
            {suffix}
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={disabled || value >= max}
        className="size-7 rounded-full border border-foreground/20 hover:border-foreground/50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}

function TierBadge({ years, dimmed }: { years: number; dimmed?: boolean }) {
  const tier = tierForYears(years);
  const tierLabel = tier === "junior" ? "Junior" : tier === "mid" ? "Mid" : "Senior";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] rounded-full bg-accent text-black font-mono text-[9px] font-medium uppercase tracking-[0.22em] transition-opacity duration-200",
        dimmed && "opacity-40",
      )}
    >
      {tierLabel}
    </span>
  );
}

function Stat({
  label,
  value,
  prefix = "",
  suffix = "",
  withSeparator = false,
  highlight = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  withSeparator?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display tracking-[-0.035em] tabular-nums leading-none text-foreground",
          highlight
            ? "text-[clamp(2rem,4.2vw,3.25rem)]"
            : "text-[clamp(1.5rem,2.8vw,2.1rem)]",
        )}
      >
        {prefix}
        <CountUp
          to={value}
          duration={0.6}
          separator={withSeparator ? "," : ""}
        />
        {suffix}
      </p>
    </div>
  );
}
