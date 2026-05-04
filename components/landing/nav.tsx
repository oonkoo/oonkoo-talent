"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#pods", label: "Pods" },
  { href: "#vetting", label: "Vetting" },
  { href: "#contact", label: "Contact" },
];

const SECTION_IDS = LINKS.map((l) => l.href.slice(1));

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sticky-bg threshold
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy — observe each section, highlight the topmost one whose
  // top has crossed into the upper-middle band of the viewport. We
  // maintain a Set of currently-intersecting ids and pick the first
  // (in document order) on every change.
  useEffect(() => {
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const topmost = SECTION_IDS.find((id) => visible.has(id)) ?? null;
        setActiveId(topmost);
      },
      {
        // "Active zone" is roughly the top third of the viewport — section
        // becomes active when its leading edge crosses ~20% from the top
        // and stays active until it scrolls past ~40% from the top.
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      },
    );

    const observed: Element[] = [];
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }

    return () => {
      for (const el of observed) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="OonkoO Talent — home"
        >
          <span className="relative flex size-32 items-center justify-center">
            <Image
              src="/oonkoo_talent.svg"
              alt=""
              width={44}
              height={44}
              priority
              className="size-full transition-transform duration-500 group-hover:rotate-[8deg]"
            />
          </span>
        </Link>

        {/* Center links */}
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => {
            const active = activeId === l.href.slice(1);
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "group relative font-mono text-[11.5px] uppercase tracking-[0.18em] transition-colors duration-200",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* End CTA */}
        <Link
          href="/api/auth/register?post_login_redirect_url=/auth/callback"
          className="group inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-secondary px-4 py-1.5 text-[12.5px] font-medium tracking-[-0.005em] text-foreground transition-all duration-300 hover:border-accent hover:bg-primary hover:text-accent"
        >
          <span>Start a pod</span>
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </nav>
    </header>
  );
}
