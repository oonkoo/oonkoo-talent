import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const POD_FACES = [
  "/people/designer-1.png",
  "/people/frontend-1.png",
  "/people/backend-1.png",
  "/people/frontend-2.png",
  "/people/backend-2.png",
  "/people/business-1.png",
];

type PodTier = {
  name: string;
  seniors: number;
  juniors: number;
  designers: number;
  hourly: string;
  monthly: string;
  use: string;
  featured?: boolean;
};

const POD_TIERS: PodTier[] = [
  {
    name: "Starter",
    seniors: 1,
    juniors: 3,
    designers: 0,
    hourly: "$22–$30",
    monthly: "$3.5K–$4.8K",
    use: "MVP sprint, single squad — when you already have the tech depth and just need throughput.",
  },
  {
    name: "Standard",
    seniors: 1,
    juniors: 5,
    designers: 0,
    hourly: "$30–$42",
    monthly: "$4.8K–$6.7K",
    use: "Full-time embedded squad, sustained roadmap — our most-chosen shape.",
    featured: true,
  },
  {
    name: "Scale",
    seniors: 1,
    juniors: 7,
    designers: 1,
    hourly: "$42–$58",
    monthly: "$6.7K–$9.3K",
    use: "Multi-stream delivery with a dedicated design pipeline alongside.",
  },
];

const ROLE_RATES = [
  { role: "Full-stack developer", junior: "$4–$6", mid: "$6–$9", senior: "$9–$12" },
  { role: "BI / Data engineer", junior: "$5–$7", mid: "$7–$10", senior: "$10–$12" },
  { role: "Product designer", junior: "$4–$6", mid: "$6–$8", senior: "$8–$11" },
];

function PodDots({ seniors, juniors, designers }: { seniors: number; juniors: number; designers: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: seniors }).map((_, i) => (
        <span
          key={`s-${i}`}
          className="size-2.5 rounded-full bg-accent ring-1 ring-foreground/10"
        />
      ))}
      {Array.from({ length: juniors }).map((_, i) => (
        <span key={`j-${i}`} className="size-2 rounded-full bg-foreground" />
      ))}
      {Array.from({ length: designers }).map((_, i) => (
        <span key={`d-${i}`} className="size-2 rounded-full border border-foreground" />
      ))}
    </div>
  );
}

export function LandingPricing() {
  return (
    <section
      id="pricing"
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
                pricing · as of 06.2026
              </p>
            </div>
            <h2 className="mt-7 font-display text-[clamp(2.4rem,6.2vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground">
              <span className="block">An engineering pod,</span>
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
                    Priced
                  </span>
                </span>{" "}
                like a salary.
              </span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-3 mt-8 lg:mt-3 lg:pl-8 lg:border-l lg:border-foreground/15">
            <p className="text-[15px] leading-[1.55] text-muted-foreground">
              No platform fee. No markup tiers. No enterprise procurement gauntlet. Three pod sizes, one rate card,
              and the underlying per-role numbers underneath in case you&rsquo;d rather mix your own.
            </p>
          </div>
        </div>

        {/* ───── Anti-anchor: $80 vs $30 ───── */}
        <div className="mt-20 grid grid-cols-12 gap-x-8 border-t border-foreground/15 pt-14">
          <div className="col-span-12 md:col-span-6 md:pr-10 md:border-r md:border-foreground/15">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              What the marketplace charges
            </p>
            <p className="mt-5 font-display tracking-[-0.04em] text-muted-foreground/70">
              <span className="text-[64px] leading-none">$80</span>
              <span className="text-[28px] tracking-normal text-muted-foreground/50">
                /hr
              </span>
            </p>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.5] text-muted-foreground">
              For one senior contractor on a Toptal-tier marketplace. You get a person. Not a team, not a bench, not a roadmap.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 md:pl-10 mt-12 md:mt-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground">
              What an OonkoO pod costs
            </p>
            <p className="mt-5 font-display tracking-[-0.04em] text-foreground">
              <span className="text-[88px] leading-[0.9]">$30</span>
              <span className="text-[28px] tracking-normal text-muted-foreground">
                /hr
              </span>
            </p>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.5] text-foreground">
              For an entire six-person Standard pod. All-in.{" "}
              <span className="text-muted-foreground">
                A senior architect, plus five hands-on builders, embedded in your stack.
              </span>
            </p>
          </div>
        </div>

        {/* ───── Pod tiers ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Pod tiers · all-inclusive rates
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70 hidden md:block">
              ◆ senior &nbsp; · &nbsp; ● juniors &nbsp; · &nbsp; ○ business
            </p>
          </div>

          <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-12">
            {POD_TIERS.map((tier, i) => (
              <article
                key={tier.name}
                className={[
                  "col-span-12 md:col-span-4 flex flex-col gap-5",
                  i > 0 ? "md:pl-8 md:border-l md:border-foreground/10" : "",
                ].join(" ")}
              >
                {/* Tier name + featured tag */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-display text-[40px] leading-none tracking-[-0.025em] text-foreground">
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <span className="relative inline-block px-1.5 py-0.5">
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 -skew-y-[1.5deg] bg-accent"
                      />
                      <span className="relative font-mono text-[9.5px] uppercase tracking-[0.22em] text-foreground">
                        most chosen
                      </span>
                    </span>
                  )}
                </div>

                {/* Composition row */}
                <div className="flex flex-col gap-2">
                  <PodDots
                    seniors={tier.seniors}
                    juniors={tier.juniors}
                    designers={tier.designers}
                  />
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {tier.seniors} senior lead
                    {tier.seniors > 1 ? "s" : ""} · {tier.juniors} junior
                    {tier.juniors > 1 ? "s" : ""}
                    {tier.designers > 0 &&
                      ` · ${tier.designers} designer${tier.designers > 1 ? "s" : ""}`}
                  </p>
                </div>

                {/* Price band */}
                <div>
                  <p className="font-display tracking-[-0.03em] text-foreground">
                    <span className="text-[44px] leading-none">{tier.hourly}</span>
                    <span className="text-[18px] tracking-normal text-muted-foreground/70 ml-1">
                      /hr
                    </span>
                  </p>
                  <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
                    {tier.monthly} per month, all-in
                  </p>
                </div>

                {/* Use line */}
                <p className="text-[14.5px] leading-[1.55] text-muted-foreground">
                  {tier.use}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ───── Per-role rate card ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <div className="grid grid-cols-12 gap-x-8 gap-y-8">
            <div className="col-span-12 md:col-span-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Per-role rates
              </p>
              <p className="mt-4 max-w-[28ch] text-[15px] leading-[1.55] text-muted-foreground">
                Same all-inclusive numbers, unbundled — for when you&rsquo;d rather hire a single role or build a pod we haven&rsquo;t shaped yet.
              </p>
              <p className="mt-3 max-w-[28ch] text-[14px] leading-[1.55] text-muted-foreground/70">
                Our specialty is the{" "}
                <span className="text-foreground">junior column</span> — hands-on, vetted, shipping production code today.
              </p>
            </div>

            <div className="col-span-12 md:col-span-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-foreground/15">
                    <th className="pb-4 pr-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70 font-normal">
                      Role
                    </th>
                    <th className="pb-4 px-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground font-normal text-right">
                      <span className="relative inline-block">
                        <span
                          aria-hidden
                          className="absolute -bottom-1 inset-x-0 h-[2px] bg-accent"
                        />
                        Junior
                      </span>
                    </th>
                    <th className="pb-4 px-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70 font-normal text-right">
                      Mid
                    </th>
                    <th className="pb-4 pl-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70 font-normal text-right">
                      Senior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROLE_RATES.map((row, i) => (
                    <tr
                      key={row.role}
                      className={
                        i < ROLE_RATES.length - 1
                          ? "border-b border-foreground/10"
                          : ""
                      }
                    >
                      <td className="py-5 pr-3 text-[15px] text-foreground">
                        {row.role}
                      </td>
                      <td className="py-5 px-3 font-display text-[20px] tracking-[-0.02em] text-foreground text-right tabular-nums">
                        {row.junior}
                        <span className="font-sans text-[11px] tracking-normal text-muted-foreground/60 ml-1">
                          /hr
                        </span>
                      </td>
                      <td className="py-5 px-3 font-display text-[20px] tracking-[-0.02em] text-foreground/80 text-right tabular-nums">
                        {row.mid}
                        <span className="font-sans text-[11px] tracking-normal text-muted-foreground/60 ml-1">
                          /hr
                        </span>
                      </td>
                      <td className="py-5 pl-3 font-display text-[20px] tracking-[-0.02em] text-foreground/80 text-right tabular-nums">
                        {row.senior}
                        <span className="font-sans text-[11px] tracking-normal text-muted-foreground/60 ml-1">
                          /hr
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ───── Pod-faces marquee — auto-scroll, left-to-right ───── */}
        <div className="mt-24 border-t border-foreground/15 pt-12">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Pod members · From Dhaka
            </p>
            <p className="hidden md:block font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/50">
              Hover to pause
            </p>
          </div>

          <div className="mt-8 relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="ot-marquee-right flex w-max items-center gap-4">
              {[...POD_FACES, ...POD_FACES].map((src, i) => {
                const isDuplicate = i >= POD_FACES.length;
                return (
                  <div
                    key={i}
                    className="relative size-[200px] shrink-0"
                    aria-hidden={isDuplicate}
                  >
                    <Image
                      src={src}
                      alt={isDuplicate ? "" : `Pod member ${i + 1}`}
                      fill
                      sizes="180px"
                      className="object-contain"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ───── Footer caption + CTA ───── */}
        <div className="mt-12 grid grid-cols-12 gap-x-8 gap-y-10 border-t border-foreground/15 pt-14">
          <div className="col-span-12 lg:col-span-8">
            <p className="font-display text-[clamp(1.6rem,2.4vw,2.05rem)] leading-[1.2] tracking-[-0.025em] text-foreground text-balance max-w-[40ch]">
              That&rsquo;s the entire pricing page.
              <span className="text-muted-foreground">
                {" "}No platform fee, no markup tiers, no enterprise procurement.
                The price you see is the price the team gets.
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
