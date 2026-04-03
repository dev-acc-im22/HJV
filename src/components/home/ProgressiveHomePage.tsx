"use client";

import { Suspense, lazy } from "react";
import { HeroSection } from "./HeroSection";
import { 
  SectionSkeleton,
  TrustBadgesSkeleton,
  SuccessStoriesSkeleton,
  FeaturesSkeleton, 
  CTASkeleton 
} from "@/components/ui/skeletons";

// Lazy load below-the-fold sections
const HowItWorksSection = lazy(() => 
  import("./HowItWorksSection").then(mod => ({ default: mod.HowItWorksSection }))
);

const TrustBadgesSection = lazy(() => 
  import("./TrustBadgesSection").then(mod => ({ default: mod.TrustBadgesSection }))
);

const SuccessStoriesSection = lazy(() => 
  import("./SuccessStoriesSection").then(mod => ({ default: mod.SuccessStoriesSection }))
);

const FeaturesSection = lazy(() => 
  import("./FeaturesSection").then(mod => ({ default: mod.FeaturesSection }))
);

const CTASection = lazy(() => 
  import("./CTASection").then(mod => ({ default: mod.CTASection }))
);

interface ProgressiveHomePageProps {
  onNavigate: (page: string) => void;
}

export function ProgressiveHomePage({ onNavigate }: ProgressiveHomePageProps) {
  return (
    <main className="min-h-screen bg-[#FFF0F5]">
      {/* Hero - Loads immediately (above the fold) */}
      <HeroSection onNavigate={onNavigate} />
      
      {/* Below the fold - Lazy loaded progressively */}
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
      </Suspense>
      
      <Suspense fallback={<TrustBadgesSkeleton />}>
        <TrustBadgesSection />
      </Suspense>
      
      <Suspense fallback={<SuccessStoriesSkeleton />}>
        <SuccessStoriesSection />
      </Suspense>
      
      <Suspense fallback={<FeaturesSkeleton />}>
        <FeaturesSection onNavigate={onNavigate} />
      </Suspense>
      
      <Suspense fallback={<CTASkeleton />}>
        <CTASection onNavigate={onNavigate} />
      </Suspense>
    </main>
  );
}

export default ProgressiveHomePage;
