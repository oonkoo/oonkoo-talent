import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "./contact-form";

export function LandingFinalCTA() {
  return (
    <section
      id="contact"
      className="relative border-t border-foreground/10 bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
        {/* ───── Section header — headline left, square team image right ───── */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-10 items-center">
          <div className="col-span-12 lg:col-span-7">
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
                start · your move
              </p>
            </div>
            <h2 className="mt-7 font-display text-[clamp(2.4rem,7vw,5.5rem)] font-normal leading-[1.05] tracking-[-0.035em] text-balance text-foreground">
              <span className="block">Time to</span>
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
                    Run
                  </span>
                </span>
                .
              </span>
            </h2>
          </div>

          {/* Square team image — native aspect, lime track typographically
              rhymes with the lime highlighter behind the cursive "Run". */}
          <div className="col-span-12 lg:col-span-5 relative aspect-square w-full overflow-hidden">
            <Image
              src="/people/team.png"
              alt="OonkoO Talent — the team in motion"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* ───── Two-path conversion ───── */}
        <div className="mt-20 md:mt-24 grid grid-cols-12 gap-x-8 gap-y-14 border-t border-foreground/15 pt-14">
          {/* LEFT — Sign up / "Start a pod" */}
          <div className="col-span-12 lg:col-span-5 lg:pr-8 lg:border-r lg:border-foreground/15 flex flex-col">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Path 01 · ready now
            </p>
            <h3 className="mt-5 font-display text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.15] tracking-[-0.025em] text-foreground text-balance max-w-[18ch]">
              Start a pod.
            </h3>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.6] text-muted-foreground">
              Sign up, scope your roadmap on a 20-minute call, get a
              shortlist in five days. The two-week trial is on us — keep
              the code either way.
            </p>

            <ul className="mt-7 space-y-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/80">
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-1 rounded-full bg-foreground/60" />
                <span>15 days from call to shipping</span>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-1 rounded-full bg-foreground/60" />
                <span>2-week try-out · cancel anytime</span>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-1 rounded-full bg-foreground/60" />
                <span>6-month commit, then 30-day notice</span>
              </li>
            </ul>

            <div className="mt-auto pt-10">
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

          {/* RIGHT — Drop a note / contact form */}
          <div className="col-span-12 lg:col-span-7 lg:pl-8">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Path 02 · still figuring it out
            </p>
            <h3 className="mt-5 font-display text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.15] tracking-[-0.025em] text-foreground text-balance max-w-[24ch]">
              Drop a note. We&rsquo;ll write back.
            </h3>
            <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.6] text-muted-foreground">
              Not ready to sign up but have a question? Send the line and
              we&rsquo;ll respond inside a day. No pitch, no autoresponder
              chain — just the answer.
            </p>

            <div className="mt-9">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
