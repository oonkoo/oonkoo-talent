"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#pods", label: "Pods" },
  { href: "#contact", label: "Contact" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {l.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full"
                />
              </a>
            </li>
          ))}
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
