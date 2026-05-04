import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Step = {
  n: string;
  title: string;
  body: string;
  duration: string;
  cost: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Twenty-minute pod-fit call",
    body:
      "Tell us your roadmap. We sketch a pod — composition, size, timing — and tell you honestly whether it’s a fit. No NDAs, no MSAs, no procurement gauntlet.",
    duration: "20 min",
    cost: "Free",
  },
  {
    n: "02",
    title: "Shortlist in five days",
    body:
      "Three candidates per role. Portfolios, code samples, references. You interview them yourself — culture, depth, however you want — and you pick the team.",
    duration: "5 days",
    cost: "Free",
  },
  {
    n: "03",
    title: "Two-week try-out, six-month commit",
    body:
      "They ship in your repo at the standard rate. Two weeks to evaluate — cancel any day with only the hours worked billed. Past day 14, we sign a six-month engagement.",
    duration: "2 weeks",
    cost: "Cancel by day 14",
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how"
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
                how it works · onboarding
              </p>
            </div>
            <h2 className="mt-7 font-display text-[clamp(2.4rem,6.2vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground">
              <span className="block">How a pod</span>
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
                    Actually
                  </span>
                </span>{" "}
                starts.
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-3 mt-8 lg:mt-3 lg:pl-8 lg:border-l lg:border-foreground/15">
            <p className="text-[15px] leading-[1.55] text-muted-foreground">
              From the first call to a shipping pod in fifteen days. The first
              two weeks are a paid try-out — cancel any day in that window with
              only the hours worked billed. Past day 14, we sign a six-month
              engagement.
            </p>
          </div>
        </div>

        {/* ───── Timeline ───── */}
        <div className="mt-20 border-t border-foreground/15">
          {STEPS.map((step, i) => (
            <div key={step.n}>
              <article className="grid grid-cols-12 gap-x-8 gap-y-6 py-12 md:py-16">
                {/* Number */}
                <div className="col-span-12 md:col-span-2">
                  <div className="font-display text-[clamp(3rem,7.2vw,5.75rem)] leading-[0.85] tracking-[-0.04em] text-foreground tabular-nums">
                    {step.n}
                  </div>
                </div>

                {/* Title + body */}
                <div className="col-span-12 md:col-span-7 md:pl-2">
                  <h3 className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.025em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-[15.5px] leading-[1.6] text-muted-foreground">
                    {step.body}
                  </p>
                </div>

                {/* Duration / cost */}
                <div className="col-span-12 md:col-span-3 md:pl-4 md:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Duration
                  </p>
                  <p className="mt-1.5 font-display text-[22px] leading-none tracking-[-0.025em] text-foreground tabular-nums">
                    {step.duration}
                  </p>
                  <div className="mt-5 inline-flex md:hidden h-px w-12 bg-foreground/15" />
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                    Your cost
                  </p>
                  <p className="mt-1.5 font-display text-[22px] leading-none tracking-[-0.025em] text-foreground">
                    {step.cost}
                  </p>
                </div>
              </article>

              {/* Hairline divider between steps */}
              {i < STEPS.length - 1 && (
                <div className="h-px bg-foreground/15" aria-hidden />
              )}
            </div>
          ))}
        </div>

        {/* ───── Closing caption + CTA ───── */}
        <div className="mt-20 grid grid-cols-12 gap-x-8 gap-y-10 border-t border-foreground/15 pt-14">
          <div className="col-span-12 lg:col-span-8">
            <p className="font-display text-[clamp(1.6rem,2.4vw,2.05rem)] leading-[1.2] tracking-[-0.025em] text-foreground text-balance max-w-[42ch]">
              Worst case, you cancel by day 14 with just two weeks billed.
              <span className="text-muted-foreground">
                {" "}Best case, you&rsquo;ve found your engineering team for
                the next six months and beyond.
              </span>
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:flex lg:items-end lg:justify-end">
            <Link
              href="/api/auth/register?post_login_redirect_url=/auth/callback"
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[14px] font-medium tracking-[-0.005em] text-primary-foreground transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99]"
            >
              <span>Book a pod-fit call</span>
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
