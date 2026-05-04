import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingVetting } from "@/components/landing/vetting";
import { LandingPods } from "@/components/landing/pods";
import { LandingFinalCTA } from "@/components/landing/final-cta";

export default function HomePage() {
  return (
    <div data-theme="ot-landing" className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingPods />
        <LandingVetting />
        <LandingFinalCTA />
      </main>
    </div>
  );
}
