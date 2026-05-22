import Link from "next/link";
import Image from "next/image";

// Auth-gated routes that touch the DB; never prerender.
export const dynamic = "force-dynamic";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="ot-landing"
      className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-clip"
    >
      <header className="relative z-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image
              src="/oonkoo_talent.svg"
              alt="OonkoO Talent"
              width={28}
              height={28}
              priority
              className="transition-transform duration-300 group-hover:rotate-3"
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/80 group-hover:text-foreground transition-colors">
              OonkoO Talent
            </span>
          </Link>
          <Link
            href="/api/auth/logout"
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Sign out
          </Link>
        </div>
        <div aria-hidden className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="h-px w-full bg-foreground/10" />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10 py-14 md:py-20">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-foreground/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 lg:px-10 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            Dhaka <span className="text-muted-foreground/40">↔</span> North America
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
            Reply within 24 hr
          </p>
        </div>
      </footer>
    </div>
  );
}
