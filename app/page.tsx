import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";

export default function HomePage() {
  return (
    <div data-theme="ot-landing" className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
      </main>
    </div>
  );
}
