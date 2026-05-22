"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "@/components/CountUp";

type RoleId = "dev" | "designer" | "bi" | "qa";

type Role = {
  id: RoleId;
  name: string;
  /** Offset applied to the base year-rate ladder (Devs are baseline = 0). */
  modifier: number;
  /** Short hint shown under the role name. */
  hint: string;
};

// Devs are the baseline. Designers and QA are -$1, BI is +$1.
const ROLES: Role[] = [
  { id: "dev", name: "Developers", modifier: 0, hint: "Full-stack, frontend, backend" },
  { id: "designer", name: "Designers", modifier: -1, hint: "Product / UX · a bit less" },
  { id: "bi", name: "BI engineers", modifier: 1, hint: "Data + dashboards · a bit more" },
  { id: "qa", name: "QA engineers", modifier: -1, hint: "Manual + automation · a bit less" },
];

const CONTRACTS = [
  { id: "6mo" as const, label: "6 months", months: 6 },
  { id: "1yr" as const, label: "1 year", months: 12 },
  { id: "3yr" as const, label: "3 years", months: 36 },
];

const FULL_TIME_HOURS_PER_MONTH = 162.5;
const PART_TIME_HOURS_PER_MONTH = 81.25;
const MAX_COUNT = 20;
const MIN_YEARS = 1;
const MAX_YEARS = 10;

type EmploymentType = "full_time" | "part_time" | "contract";
type ExperienceLevel = "junior" | "mid" | "senior" | "mixed";

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

// null = no monthly cadence (contract = project-scoped). Full-time is the
// default preview so the panel reads sensibly on first paint.
function monthlyHoursFor(emp: EmploymentType): number | null {
  if (emp === "part_time") return PART_TIME_HOURS_PER_MONTH;
  if (emp === "contract") return null;
  return FULL_TIME_HOURS_PER_MONTH;
}

// Year-by-year rate ladder for Developers (baseline). Other roles offset.
//   1 yr → $4   ┐
//   2 yr → $5   ┘ Junior   (1–2 yr)
//   3 yr → $8   ┐
//   4 yr → $9   │ Mid       (3–5 yr)
//   5 yr → $10  ┘
//   6 yr → $11  ┐
//   7 yr → $12  │ Senior    (6+ yr)
//   8 yr → $13  │
//   9 yr → $14  │
//   10+ yr → $15
const RATE_BY_YEAR: Record<number, number> = {
  1: 4,
  2: 5,
  3: 8,
  4: 9,
  5: 10,
  6: 11,
  7: 12,
  8: 13,
  9: 14,
  10: 15,
};

function rateForRole(years: number, modifier: number): number {
  const clamped = Math.max(MIN_YEARS, Math.min(MAX_YEARS, years));
  const base = RATE_BY_YEAR[clamped] ?? 4;
  return Math.max(1, base + modifier);
}

type Tier = "Junior" | "Mid" | "Senior";

function tierForYears(years: number): Tier {
  if (years <= 2) return "Junior";
  if (years <= 5) return "Mid";
  return "Senior";
}

type ContractId = (typeof CONTRACTS)[number]["id"];
type RoleState = { years: number; count: number };
type State = Record<RoleId, RoleState>;

const INITIAL: State = {
  dev: { years: 5, count: 5 },
  designer: { years: 3, count: 0 },
  bi: { years: 5, count: 0 },
  qa: { years: 2, count: 0 },
};

export function PodCalculator() {
  const [state, setState] = useState<State>(INITIAL);
  const [contractId, setContractId] = useState<ContractId>("1yr");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("full_time");
  const [experienceOverride, setExperienceOverride] =
    useState<ExperienceLevel | null>(null);

  const contract =
    CONTRACTS.find((c) => c.id === contractId) ?? CONTRACTS[1];

  const isContract = employmentType === "contract";
  const isPartTime = employmentType === "part_time";
  const weekLabel = isPartTime ? "20 hr/wk" : "40 hr/wk";

  const totals = useMemo(() => {
    let teamSize = 0;
    let hourlyRate = 0;
    for (const role of ROLES) {
      const s = state[role.id];
      const r = rateForRole(s.years, role.modifier);
      teamSize += s.count;
      hourlyRate += s.count * r;
    }
    const monthlyHours = monthlyHoursFor(employmentType);
    const monthlyCost =
      monthlyHours !== null ? Math.round(hourlyRate * monthlyHours) : null;
    const totalCost =
      monthlyCost !== null ? monthlyCost * contract.months : null;
    return {
      teamSize,
      hourlyRate: Math.round(hourlyRate),
      monthlyCost,
      totalCost,
      monthlyHours,
    };
  }, [state, contract.months, employmentType]);

  const derivedExperience: ExperienceLevel | null = useMemo(() => {
    const tiers = new Set<string>();
    for (const role of ROLES) {
      const s = state[role.id];
      if (s.count <= 0) continue;
      tiers.add(tierForYears(s.years).toLowerCase());
    }
    if (tiers.size === 0) return null;
    if (tiers.size > 1) return "mixed";
    return [...tiers][0] as ExperienceLevel;
  }, [state]);

  const effectiveExperience = experienceOverride ?? derivedExperience;

  function adjustYears(roleId: RoleId, delta: number) {
    setState((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        years: Math.max(
          MIN_YEARS,
          Math.min(MAX_YEARS, prev[roleId].years + delta),
        ),
      },
    }));
  }

  function adjustCount(roleId: RoleId, delta: number) {
    setState((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        count: Math.max(0, Math.min(MAX_COUNT, prev[roleId].count + delta)),
      },
    }));
  }

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-12">
      {/* ───── Inputs (left) ───── */}
      <div className="col-span-12 lg:col-span-7">
        {/* Header row */}
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

        {/* Role rows */}
        {ROLES.map((role) => {
          const s = state[role.id];
          const rate = rateForRole(s.years, role.modifier);
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
                <YearStepper
                  value={s.years}
                  onAdjust={(d) => adjustYears(role.id, d)}
                  ariaLabel={`Years experience ${role.name}`}
                />
                <TierBadge years={s.years} />
              </div>
              <div className="col-span-6 md:col-span-4 flex items-center justify-center md:justify-start">
                <Counter
                  value={s.count}
                  onAdjust={(d) => adjustCount(role.id, d)}
                  ariaLabel={`Count ${role.name}`}
                />
              </div>
            </div>
          );
        })}

        {/* Employment shape */}
        <div className="mt-10 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Employment shape
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {EMPLOYMENT.map((opt) => {
              const active = employmentType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmploymentType(opt.value)}
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

        {/* Contract length toggle — hidden for project-scoped engagements */}
        {!isContract && (
          <div className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Contract length
            </p>
            <div className="flex items-baseline gap-7">
              {CONTRACTS.map((c) => {
                const active = contractId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setContractId(c.id)}
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

        {/* Experience level — auto-derived from per-role years, overridable */}
        <div className="mt-10 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Experience level
            </p>
            {derivedExperience && experienceOverride === null && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                auto from your picks
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE.map((opt) => {
              const active = effectiveExperience === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExperienceOverride(opt.value)}
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
            {experienceOverride !== null && (
              <button
                type="button"
                onClick={() => setExperienceOverride(null)}
                className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───── Output (right) — animated via CountUp ───── */}
      <div className="col-span-12 lg:col-span-5 lg:pl-8 lg:border-l lg:border-foreground/15">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Pod totals · indicative
        </p>

        <div className="mt-7 space-y-7">
          <Stat label="Team size" value={totals.teamSize} />
          <Stat
            label="Hourly rate · all-in"
            value={totals.hourlyRate}
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
                label={`Monthly cost · ${weekLabel}`}
                value={totals.monthlyCost ?? 0}
                prefix="$"
                withSeparator
              />
              <Stat
                label={`Total over ${contract.label}`}
                value={totals.totalCost ?? 0}
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
              Year-by-year rate ladder at {totals.monthlyHours} billable hours/month ·{" "}
              {weekLabel}.{" "}
              <span className="text-foreground">
                Each 8-hour day, 7 are billed; the 1-hour lunch is on us.
              </span>{" "}
              Final scope and exact rate confirmed on the pod-fit call.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function TierBadge({ years }: { years: number }) {
  const tier = tierForYears(years);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] rounded-full font-mono text-[9px] uppercase tracking-[0.22em] transition-colors duration-200",
        tier === "Junior" && "bg-foreground/[0.06] text-muted-foreground",
        tier === "Mid" && "bg-foreground/10 text-foreground/85",
        tier === "Senior" && "bg-accent/40 text-foreground",
      )}
    >
      {tier}
    </span>
  );
}

function YearStepper({
  value,
  onAdjust,
  ariaLabel,
}: {
  value: number;
  onAdjust: (delta: number) => void;
  ariaLabel: string;
}) {
  const isCap = value === MAX_YEARS;
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onAdjust(-1)}
        disabled={value <= MIN_YEARS}
        className="size-7 rounded-full border border-foreground/20 hover:border-foreground/50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="size-3" />
      </button>
      <span className="flex items-baseline gap-1 min-w-[3.5ch] justify-center">
        <span className="font-display text-[20px] leading-none tracking-[-0.02em] tabular-nums text-foreground">
          {value}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">
          {isCap ? "yr+" : "yr"}
        </span>
      </span>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={value >= MAX_YEARS}
        className="size-7 rounded-full border border-foreground/20 hover:border-foreground/50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}

function Counter({
  value,
  onAdjust,
  ariaLabel,
}: {
  value: number;
  onAdjust: (delta: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onAdjust(-1)}
        disabled={value === 0}
        className="size-7 rounded-full border border-foreground/20 hover:border-foreground/50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="size-3" />
      </button>
      <span className="font-display text-[20px] leading-none tracking-[-0.02em] tabular-nums w-6 text-center text-foreground">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={value >= MAX_COUNT}
        className="size-7 rounded-full border border-foreground/20 hover:border-foreground/50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="size-3" />
      </button>
    </div>
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
