import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import BounceCards from "@/components/BounceCards";

const STATS = [
  { value: "$4–$12", unit: "/hr", label: "All-inclusive rates" },
  { value: "5", unit: "days", label: "Time to shortlist" },
  { value: "1:5", unit: "ratio", label: "Senior · junior" },
];

// Pod-faces shown as a layered photo collage in the hero's bottom-right —
// ordering is design → frontend → backend so the cursor enters the deepest
// rotation first when sweeping right.
const POD_FACES = [
  "/people/designer-1.png",
  "/people/frontend-1.png",
  "/people/backend-1.png",
];

const POD_TRANSFORMS = [
  "rotate(-9deg) translate(-110px)",
  "rotate(3deg)",
  "rotate(8deg) translate(110px)",
];

export function LandingHero() {
  return (
    <section className="ot-grain relative overflow-hidden h-screen">
      {/* ───── Background atmospherics + brand elements ───── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* BRAND: large lime triangle anchoring the upper-right.
            On cream paper this becomes the primary brand-signal. */}
        <Image
          src="/elements/lime-triangle.svg"
          alt=""
          width={620}
          height={540}
          aria-hidden
          className="absolute -top-20 -right-16 w-[420px] h-auto rotate-[14deg] opacity-80 md:w-[600px] md:-top-28 md:-right-24"
        />

        {/* BRAND: large black circle drifting in from bottom-left. Subtle on
            cream — reads as a soft shadow disc, anchors the composition. */}
        <Image
          src="/elements/black-circle.svg"
          alt=""
          width={780}
          height={780}
          aria-hidden
          className="absolute -bottom-72 -left-60 w-[560px] h-[560px] opacity-[0.07] md:w-[780px] md:h-[780px] md:-bottom-96 md:-left-80"
        />

        {/* BRAND: medium black triangle, mid-right depth element. */}
        <Image
          src="/elements/black-triangle.svg"
          alt=""
          width={300}
          height={263}
          aria-hidden
          className="absolute top-[62%] -right-12 w-[210px] h-auto rotate-[-22deg] opacity-[0.18] md:w-[300px]"
        />

        {/* BRAND: small lime circle accent, compositional rhythm above the stats row. */}
        <Image
          src="/elements/lime-circle.svg"
          alt=""
          width={140}
          height={140}
          aria-hidden
          className="hidden md:block absolute bottom-44 left-[-3rem] w-[140px] h-[140px] opacity-[0.55]"
        />

        {/* Subtle warm wash emanating from the lime triangle */}
        <div className="absolute inset-0 [background:radial-gradient(60%_45%_at_88%_8%,rgba(193,255,114,0.18),transparent_60%)]" />

        {/* Faint dot grid (now in dark ink for the cream bg), masked to a
            soft ellipse so it doesn't fight the type. */}
        <div className="absolute inset-0 opacity-[0.38] [background-image:radial-gradient(rgba(12,10,7,0.28)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,#000_15%,transparent_85%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="grid grid-cols-12 gap-x-8">
          {/* ───── Main column ───── */}
          <div className="col-span-12 lg:col-span-9">
            {/* Pre-headline kicker */}
            <div className="ot-rise flex items-center gap-3 [animation-delay:0ms]">
              <span className="relative flex size-1.5">
                <span className="ot-pulse absolute inset-0 rounded-full bg-foreground opacity-50" />
                <span className="relative size-1.5 rounded-full bg-foreground" />
              </span>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                Offshore engineering pods{" "}
                <span className="text-muted-foreground/70">·</span> built for
                small teams
              </p>
            </div>

            {/* Headline — the load-bearing moment */}
            <h1 className="mt-7 font-display text-[clamp(2.4rem,6.6vw,4.85rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground">
              <span className="ot-rise block [animation-delay:140ms]">
                An entire engineering pod.
              </span>
              <span className="ot-rise block mt-2 [animation-delay:280ms]">
                <span>The price of one </span>
                <span className="relative inline-block align-baseline whitespace-nowrap px-2 mx-0.5">
                  <span
                    aria-hidden
                    className="absolute -z-10 h-[0.62em] -skew-y-[1.2deg] bg-accent"
                  />
                  <span
                    className="relative font-handwritten text-foreground"
                    style={{
                      fontSize: "0.5em",
                      lineHeight: 0.85,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    S
                  </span>
                  <span style={{ fontSize: "1em" }}>enior</span>
                </span>
                <span> contractor.</span>
              </span>
            </h1>

            {/* Subhead */}
            <p className="ot-rise mt-8 max-w-[36rem] text-[17px] leading-[1.55] text-muted-foreground [animation-delay:480ms]">
              Hands-on junior developers, led by senior tech leads, embedded in
              your stack from{" "}
              <span className="font-medium text-foreground">$4/hr</span>.
              No agencies, no middlemen, no nine-week hires.
            </p>

            {/* CTAs */}
            <div className="ot-rise mt-10 flex flex-wrap items-center gap-2 [animation-delay:640ms]">
              <Link
                href="/api/auth/register?post_login_redirect_url=/auth/callback"
                className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-medium tracking-[-0.005em] text-primary-foreground transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99]"
              >
                <span>Start a pod</span>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                {/* Lime halo on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-accent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
                />
              </Link>
              <a
                href="#contact"
                className="group inline-flex items-center gap-1.5 px-4 py-3.5 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <span>Talk to us first</span>
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </div>

            {/* Stat row */}
            <div className="ot-rise mt-20 grid grid-cols-3 border-t border-foreground/15 [animation-delay:840ms]">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={[
                    "py-7 pr-6",
                    i > 0 ? "pl-6 border-l border-foreground/15" : "",
                  ].join(" ")}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[34px] leading-none tracking-[-0.025em] text-foreground">
                      {s.value}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
                      {s.unit}
                    </span>
                  </div>
                  <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ───── Right rail — editorial ticker (lg only) ───── */}
          <aside className="col-start-10 col-span-3 hidden lg:flex items-start justify-end pointer-events-none">
            <div className="ot-rise sticky top-32 flex flex-col items-end gap-10 pt-1 [animation-delay:1000ms]">
              {/* Date stamp */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  OonkoO Talent
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Issue 06.2026
                </span>
                <span className="mt-2 h-px w-12 bg-foreground/15" />
              </div>

              {/* Live counter — lime circle as bold brand halo behind 47 */}
              <div className="flex flex-col items-end gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Currently shipping
                </span>
                <div className="relative flex items-baseline gap-2">
                  <Image
                    src="/elements/lime-circle.svg"
                    alt=""
                    width={120}
                    height={120}
                    aria-hidden
                    className="absolute -top-3 -right-3 -z-10 w-[120px] h-[120px] opacity-90"
                  />
                  <span className="relative font-display text-[68px] leading-[0.85] tracking-[-0.04em] text-foreground">
                    47
                  </span>
                  <span className="relative flex size-1.5">
                    <span className="ot-pulse absolute inset-0 rounded-full bg-foreground opacity-50" />
                    <span className="relative size-1.5 rounded-full bg-foreground" />
                  </span>
                </div>
                <span className="text-right font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  developers across
                  <br />
                  five active pods
                </span>
              </div>

              {/* Footer micro-line */}
              <div className="flex flex-col items-end gap-1.5 pt-2">
                <span className="h-px w-12 bg-foreground/15" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Dhaka <span className="text-muted-foreground">↔</span> TORONTO
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ───── Pod faces — layered photo collage, lg+ ───── */}
      <div className="hidden lg:block absolute bottom-100 right-80 z-0">
        <BounceCards
          images={POD_FACES}
          transformStyles={POD_TRANSFORMS}
          containerWidth={460}
          containerHeight={220}
          animationDelay={1.1}
          animationStagger={0.1}
          enableHover
        />
      </div>
    </section>
  );
}
