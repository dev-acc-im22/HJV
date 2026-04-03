"use client";

import { cn } from "@/lib/utils";

// Base skeleton component
export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-[#FCE4EC] via-[#FFF0F5] to-[#FCE4EC] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#C2185B]">
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center py-12">
        {/* Logo */}
        <Skeleton className="w-20 h-20 mx-auto mb-12 rounded-2xl" />
        
        {/* Title */}
        <Skeleton className="h-16 w-96 mx-auto mb-4" />
        <Skeleton className="h-12 w-72 mx-auto mb-8" />
        
        {/* Subtitle */}
        <Skeleton className="h-6 w-[500px] mx-auto mb-14" />
        
        {/* Search Widget */}
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </section>
  );
}

// Trust Badges Skeleton
export function TrustBadgesSkeleton() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature Cards Skeleton
export function FeaturesSkeleton() {
  return (
    <section className="py-16 bg-gradient-to-b from-white via-[#FFF8FA] to-[#FFF0F5]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <Skeleton className="h-8 w-40 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

// Success Stories Skeleton
export function SuccessStoriesSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <Skeleton className="h-8 w-40 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-10 w-72 mx-auto mb-3" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        
        {/* Carousel */}
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-96 flex-shrink-0 rounded-3xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Skeleton
export function CTASkeleton() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#5D0F3A] via-[#880E4F] to-[#C2185B]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Skeleton className="h-10 w-72 mx-auto mb-4 bg-white/20" />
        <Skeleton className="h-6 w-96 mx-auto mb-8 bg-white/20" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-14 w-40 rounded-xl bg-white/20" />
          <Skeleton className="h-14 w-32 rounded-xl bg-white/20" />
        </div>
      </div>
    </section>
  );
}

// Generic Section Skeleton
export function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("py-12", className)}>
      <div className="max-w-6xl mx-auto px-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// Card Grid Skeleton
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-2xl" />
      ))}
    </div>
  );
}
