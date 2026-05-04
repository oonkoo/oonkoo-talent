import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Globe3D } from "@/components/ui/3d-globe";

// Where the work happens. Dhaka is origin; arcs run to a representative
// set of NA cities where pods currently embed. Tweak this list as the
// active-pods footprint changes.
const DHAKA = { lat: 23.8103, lng: 90.4125 };
const NA_DESTINATIONS = [
  { lat: 43.6532, lng: -79.3832 }, // Toronto
  { lat: 40.7128, lng: -74.006 }, // New York
  { lat: 42.3601, lng: -71.0589 }, // Boston
  { lat: 30.2672, lng: -97.7431 }, // Austin
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: 47.6062, lng: -122.3321 }, // Seattle
];
const GLOBE_ARCS = NA_DESTINATIONS.map((dst) => ({
  start: DHAKA,
  end: dst,
}));
const GLOBE_MARKERS = [
  {
    lat: DHAKA.lat,
    lng: DHAKA.lng,
    src: "/oonkoo_talent.svg",
    label: "Dhaka, Bangladesh",
    size: 36,
  },
];

const STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Postgres",
  "Prisma",
  "Tailwind",
  "Python",
  "Power BI",
  "Node",
  "Django",
  "GraphQL",
  "tRPC",
];

const OUTPUT = [
  {
    n: "200+",
    label: "Components shipped",
    detail: "in production code, this quarter",
  },
  {
    n: "12",
    label: "BI dashboards",
    detail: "live in client orgs, refreshed daily",
  },
  {
    n: "47",
    label: "PRs merged",
    detail: "across active pods, last week alone",
  },
];

export function LandingVetting() {
  return (
    <section
      id="vetting"
      className="relative border-t border-foreground/10 bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
        {/* ───── Section header ───── */}
        <div className="grid grid-cols-12 gap-x-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="flex items-center gap-2.5">
              <Image
                src="/elements/lime-triangle.svg"
                alt=""
                width={14}
                height={12}
                aria-hidden
                className="rotate-90 opacity-95"
              />
              <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                vetting · the bar
              </p>
            </div>
            <h2 className="mt-7 font-display text-[clamp(2.4rem,6.2vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground">
              <span className="block">How a $4 dev</span>
              <span className="block mt-2">
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
                    Ships
                  </span>
                </span>
                .
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-3 mt-8 lg:mt-3 lg:pl-8 lg:border-l lg:border-foreground/15">
            <p className="text-[15px] leading-[1.55] text-muted-foreground">
              The pod model only works if the developers in it actually ship.
              Here&rsquo;s how we filter, gate, and lead the team you&rsquo;d
              hire — every layer above the price.
            </p>
          </div>
        </div>

        {/* ───── Funnel: applied → interviewed → hired ───── */}
        <div className="mt-20 border-t border-foreground/15 pt-14">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Vetting funnel · last quarter
            </p>
            <p className="hidden md:block font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/50">
              juniors and senior leads, combined
            </p>
          </div>

          <div className="mt-10 grid grid-cols-12 items-end gap-x-4 gap-y-10">
            {/* Applied */}
            <div className="col-span-12 md:col-span-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Applied
              </p>
              <p className="mt-3 font-display tracking-[-0.04em] text-foreground/70">
                <span className="text-[clamp(3rem,5.6vw,4.5rem)] leading-none tabular-nums">
                  1,500
                </span>
              </p>
              <p className="mt-3 max-w-[26ch] text-[13.5px] leading-[1.5] text-muted-foreground">
                Inbound applicants — referrals, networks, public posts.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex md:col-span-1 items-center justify-center pb-10">
              <span aria-hidden className="font-mono text-[28px] text-foreground/30">
                →
              </span>
            </div>

            {/* Interviewed */}
            <div className="col-span-12 md:col-span-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Interviewed
              </p>
              <p className="mt-3 font-display tracking-[-0.04em] text-foreground/85">
                <span className="text-[clamp(3rem,5.8vw,5rem)] leading-none tabular-nums">
                  80
                </span>
              </p>
              <p className="mt-3 max-w-[26ch] text-[13.5px] leading-[1.5] text-muted-foreground">
                Pair-coding rounds, take-homes reviewed by a senior lead.
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex md:col-span-1 items-center justify-center pb-10">
              <span aria-hidden className="font-mono text-[28px] text-foreground/30">
                →
              </span>
            </div>

            {/* Hired */}
            <div className="col-span-12 md:col-span-3 relative">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground">
                Hired
              </p>
              <p className="mt-3 font-display tracking-[-0.04em] text-foreground">
                <span className="text-[clamp(3.5rem,7vw,6rem)] leading-none tabular-nums">
                  12
                </span>
              </p>
              <p className="mt-3 max-w-[26ch] text-[13.5px] leading-[1.5] text-foreground">
                <span className="font-medium">1 in 125 applicants</span>
                <span className="text-muted-foreground">
                  {" "}— and a paid two-week trial after that.
                </span>
              </p>

              {/* OonkoO signature — decorative seal of approval next to the
                  Hired number; semi-transparent so it reads as a watermark
                  not a button. */}
              <Image
                src="/oonkoo_talent.svg"
                alt=""
                width={120}
                height={120}
                aria-hidden
                className="hidden md:block pointer-events-none select-none absolute right-2 lg:right-25 top-0 size-20 lg:size-24"
              />
            </div>
          </div>
        </div>

        {/* ───── The senior-lead promise ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <div className="grid grid-cols-12 gap-x-8 gap-y-10">
            <div className="col-span-12 md:col-span-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
                The senior-lead promise
              </p>
              <p className="mt-5 font-display text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1.15] tracking-[-0.025em] text-foreground text-balance max-w-[22ch]">
                Every pull request is read by a senior before it merges.
              </p>
              <div className="mt-8 flex items-baseline gap-3">
                <span className="font-display text-[44px] leading-none tracking-[-0.03em] text-foreground tabular-nums">
                  100%
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
                  of PRs reviewed
                  <br />
                  before merge
                </span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7 md:pl-8 md:border-l md:border-foreground/15">
              <p className="text-[16px] leading-[1.65] text-muted-foreground">
                Our senior-tech-leads have shipped to Series-A startups and
                public-company codebases — full-stack, infra, BI, the lot. On
                every pod, the lead architects the work, reviews every PR, runs
                weekly code-quality reviews, and unblocks juniors before they
                stall.
              </p>
              <p className="mt-5 text-[16px] leading-[1.65] text-muted-foreground">
                The juniors get throughput volume. The seniors get final say on
                what merges.{" "}
                <span className="text-foreground">
                  No code reaches production without a lead&rsquo;s approval —
                  ever.
                </span>{" "}
                That&rsquo;s the gate that lets us put a $4 number on the page
                and still mean it.
              </p>
            </div>
          </div>
        </div>

        {/* ───── Stack signals ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
            What we ship in · representative stack
          </p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-3">
            {STACK.map((tech, i) => (
              <span
                key={tech}
                className="font-mono text-[12.5px] uppercase tracking-[0.18em] text-foreground/85"
              >
                {tech}
                {i < STACK.length - 1 && (
                  <span aria-hidden className="ml-5 text-muted-foreground/40">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-6 text-[14px] leading-[1.55] text-muted-foreground/70 max-w-[60ch]">
            Not an exhaustive list — and not a requirement. If your stack
            isn&rsquo;t here, ask us. Most pods spin up on stacks the lead
            already knows; the rest, they ramp into in week one.
          </p>
        </div>

        {/* ───── Production output stats — paired with Dhaka→NA globe ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              What pods are shipping right now
            </p>
            <p className="hidden lg:block font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/50">
              Dhaka → North America
            </p>
          </div>

          <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-10 items-center">
            {/* Stats column — LEFT */}
            <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
              {OUTPUT.map((stat, i) => (
                <div
                  key={stat.label}
                  className={[
                    "flex flex-col md:flex-row items-center gap-4 md:gap-8 py-7",
                    i < OUTPUT.length - 1
                      ? "border-b border-foreground/10"
                      : "",
                  ].join(" ")}
                >
                  <div className="md:w-[28%] flex justify-center md:justify-start shrink-0">
                    <p className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-none tracking-[-0.035em] text-foreground tabular-nums">
                      {stat.n}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center text-center gap-2">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground">
                      {stat.label}
                    </p>
                    <p className="max-w-[36ch] text-[14.5px] leading-[1.55] text-muted-foreground">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Globe column — RIGHT */}
            <div className="col-span-12 lg:col-span-5">
              <Globe3D
                markers={GLOBE_MARKERS}
                arcs={GLOBE_ARCS}
                config={{
                  autoRotateSpeed: 0.5,
                  showAtmosphere: true,
                  atmosphereColor: "#c1ff72",
                  atmosphereIntensity: 0.35,
                  atmosphereBlur: 3,
                  ambientIntensity: 0.7,
                  pointLightIntensity: 1.6,
                  arcColor: "#c1ff72",
                  arcThickness: 0.014,
                  arcOpacity: 0.95,
                }}
                className="h-[360px] md:h-[420px] lg:h-[440px] w-full"
              />
              <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Toronto · NYC · Boston · Austin · SF · Seattle
              </p>
            </div>
          </div>
        </div>

        {/* ───── Closing caption + CTA ───── */}
        <div className="mt-20 grid grid-cols-12 gap-x-8 gap-y-10 border-t border-foreground/15 pt-14">
          <div className="col-span-12 lg:col-span-8">
            <p className="font-display text-[clamp(1.6rem,2.4vw,2.05rem)] leading-[1.2] tracking-[-0.025em] text-foreground text-balance max-w-[42ch]">
              The bar above is what makes the price below sustainable.
              <span className="text-muted-foreground">
                {" "}Cheap is the rate. Vetted, senior-led, production-shipping
                — that&rsquo;s the team.
              </span>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:flex lg:items-end lg:justify-end">
            <Link
              href="/api/auth/register?post_login_redirect_url=/auth/callback"
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-medium tracking-[-0.005em] text-primary-foreground transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99]"
            >
              <span>Start a pod</span>
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-accent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
