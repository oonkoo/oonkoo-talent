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
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="border-b border-border/50 bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/oonkoo_talent.svg"
              alt="OonkoO Talent"
              width={28}
              height={28}
              priority
            />
            <span className="text-sm font-medium tracking-tight">
              OonkoO Talent
            </span>
          </Link>
          <Link
            href="/api/auth/logout"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
