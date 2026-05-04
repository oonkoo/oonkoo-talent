import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PodCalculator } from "./pod-calculator";

type EngagementMode = {
  n: string;
  name: string;
  tag?: string;
  composition: string;
  body: string;
  bestFor: string;
  price: string;
  priceLabel: string;
  featured?: boolean;
};

const MODES: EngagementMode[] = [
  {
    n: "01",
    name: "Pod",
    tag: "Default",
    composition: "1 senior lead + 4–6 hands-on juniors",
    body:
      "A slice of your roadmap, owned end-to-end. The lead architects, juniors ship, and the team attends your standups like an extension of your engineering org. Best price-per-output by a wide margin.",
    bestFor:
      "Companies who need sustained throughput on a real roadmap — not just a one-off hire.",
    price: "$22–$58",
    priceLabel: "/hr · all-in",
    featured: true,
  },
  {
    n: "02",
    name: "Single hire",
    composition: "One role · full-time or part-time",
    body:
      "When you already have a tech lead in-house and just need to add a hands-on dev, BI engineer, or designer. Same vetting pipeline, same quality bar — minus the senior-lead overhead.",
    bestFor:
      "Teams with strong tech leadership who need a force-multiplier hire, not a managed pod.",
    price: "$4–$12",
    priceLabel: "/hr · per role",
  },
  {
    n: "03",
    name: "White-label",
    tag: "Agency",
    composition: "We run the pod · you run the relationship",
    body:
      "For software agencies reselling delivery. We staff the team in your colors — your domain emails, your branding, your client-facing relationship. NDA-default, IP transfer baked into every contract.",
    bestFor:
      "Agencies who want to scale delivery without scaling headcount, and without risking attribution to the offshore team.",
    price: "Custom",
    priceLabel: "volume-based",
  },
];

export function LandingPods() {
  return (
    <section
      id="pods"
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
                pods · what fits your team
              </p>
            </div>
            <h2 className="mt-7 font-display text-[clamp(2.4rem,6.2vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground">
              <span className="block">Three ways to</span>
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
                    Embed
                  </span>
                </span>
                .
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-3 mt-8 lg:mt-3 lg:pl-8 lg:border-l lg:border-foreground/15">
            <p className="text-[15px] leading-[1.55] text-muted-foreground">
              Three engagement shapes — pod, single hire, white-label. Same
              vetting bar, same rate card, same senior-lead promise. Pick
              what your team actually needs.
            </p>
          </div>
        </div>

        {/* ───── Mode rows ───── */}
        <div className="mt-20 border-t border-foreground/15">
          {MODES.map((mode, i) => (
            <article
              key={mode.n}
              className={[
                "grid grid-cols-12 gap-x-8 gap-y-6 py-12 md:py-14",
                i < MODES.length - 1 ? "border-b border-foreground/15" : "",
              ].join(" ")}
            >
              {/* LEFT — number + name + tag + composition */}
              <div className="col-span-12 md:col-span-4">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70 tabular-nums">
                  {mode.n}
                </p>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-[clamp(1.8rem,3.2vw,2.5rem)] leading-none tracking-[-0.025em] text-foreground">
                    {mode.name}
                  </h3>
                  {mode.tag && (
                    <span className="relative inline-block px-1.5 py-0.5">
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 -skew-y-[1.5deg] bg-accent"
                      />
                      <span className="relative font-mono text-[9.5px] uppercase tracking-[0.22em] text-foreground">
                        {mode.tag}
                      </span>
                    </span>
                  )}
                </div>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {mode.composition}
                </p>
              </div>

              {/* CENTER — description + best-for */}
              <div className="col-span-12 md:col-span-5 md:pl-2">
                <p className="text-[15.5px] leading-[1.6] text-muted-foreground max-w-[46ch]">
                  {mode.body}
                </p>
                <p className="mt-5 max-w-[42ch] text-[14px] leading-[1.55] text-foreground">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 mr-2">
                    Best for:
                  </span>
                  {mode.bestFor}
                </p>
              </div>

              {/* RIGHT — price band */}
              <div className="col-span-12 md:col-span-3 md:pl-4 md:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Price band
                </p>
                <p className="mt-2 font-display tracking-[-0.04em] text-foreground">
                  <span className="text-[clamp(2rem,3.6vw,2.75rem)] leading-none tabular-nums">
                    {mode.price}
                  </span>
                </p>
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  {mode.priceLabel}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* ───── Pod calculator — interactive ballpark ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Pod calculator · ballpark
            </p>
            <p className="hidden md:block font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/50">
              Adjust counts, pick a length
            </p>
          </div>

          <div className="mt-10">
            <PodCalculator />
          </div>
        </div>

        {/* ───── Closing caption + CTA ───── */}
        <div className="mt-20 grid grid-cols-12 gap-x-8 gap-y-10 border-t border-foreground/15 pt-14">
          <div className="col-span-12 lg:col-span-8">
            <p className="font-display text-[clamp(1.6rem,2.4vw,2.05rem)] leading-[1.2] tracking-[-0.025em] text-foreground text-balance max-w-[46ch]">
              Same vetting bar. Same senior-lead promise.
              <span className="text-muted-foreground">
                {" "}Whichever shape you pick, we spin it up inside the same
                fifteen-day window.
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
