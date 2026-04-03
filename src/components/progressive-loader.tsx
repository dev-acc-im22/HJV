"use client";

import { Suspense, lazy, ComponentType, useState, useEffect, memo } from "react";
import { 
  HomePageSkeleton, 
  DashboardSkeleton, 
  SearchSkeleton, 
  MessagesSkeleton, 
  ProfileSkeleton, 
  PageSkeleton,
  HeroSkeleton,
  TrustBadgesSkeleton,
  SuccessStoriesSkeleton,
  FeaturesSkeleton,
  CTASkeleton
} from "./loading-skeletons";

// Loading wrapper with fade-in animation
function LoadingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-6xl mb-4">😔</div>
      <h2 className="text-xl font-semibold text-[#4A0E25] mb-2">Something went wrong</h2>
      <p className="text-gray-600 text-center mb-4">{error.message}</p>
      {retry && (
        <button 
          onClick={retry}
          className="px-6 py-2 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Higher-order component for lazy loading with retry
function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  Skeleton: ComponentType
) {
  const LazyComponent = lazy(importFn);
  
  return function ProgressiveComponent(props: P) {
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const retry = () => {
      setError(null);
      setRetryCount(prev => prev + 1);
    };

    if (error) {
      return <ErrorFallback error={error} retry={retry} />;
    }

    return (
      <Suspense fallback={<Skeleton />}>
        <LazyComponent {...props} key={retryCount} />
      </Suspense>
    );
  };
}

// Progressive loading wrapper that delays non-critical content
export function ProgressiveSection({ 
  children, 
  delay = 0,
  Skeleton,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number;
  Skeleton?: ComponentType;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(delay === 0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }
  }, [isVisible]);

  if (!isVisible && Skeleton) {
    return <Skeleton />;
  }

  return (
    <div 
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}

// Intersection Observer based lazy loading for below-fold content
export function LazySection({ 
  children, 
  Skeleton,
  rootMargin = "100px",
  threshold = 0.1,
  className = ""
}: { 
  children: React.ReactNode; 
  Skeleton: ComponentType;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useState<HTMLDivElement | null>(null)[0];
  const [sectionRef, setSectionRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = sectionRef;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [sectionRef, rootMargin, threshold]);

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      // Small delay for smooth transition
      const timer = setTimeout(() => setHasLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasLoaded]);

  return (
    <div ref={setSectionRef} className={className}>
      {hasLoaded ? (
        <div className="animate-fadeIn">
          {children}
        </div>
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

// Staggered loading for multiple items
export function StaggeredLoad({ 
  items, 
  renderItem,
  staggerDelay = 100,
  Skeleton,
  skeletonCount
}: { 
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  staggerDelay?: number;
  Skeleton: ComponentType<{ index?: number }>;
  skeletonCount: number;
}) {
  const [loadedItems, setLoadedItems] = useState<number[]>([]);

  useEffect(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        setLoadedItems(prev => [...prev, index]);
      }, index * staggerDelay);
    });
  }, [items, staggerDelay]);

  return (
    <>
      {items.map((item, index) => (
        loadedItems.includes(index) ? (
          <div key={index} className="animate-fadeIn">
            {renderItem(item, index)}
          </div>
        ) : (
          <Skeleton key={index} index={index} />
        )
      ))}
    </>
  );
}

// Export skeleton components for use elsewhere
export {
  HomePageSkeleton,
  DashboardSkeleton,
  SearchSkeleton,
  MessagesSkeleton,
  ProfileSkeleton,
  PageSkeleton,
  HeroSkeleton,
  TrustBadgesSkeleton,
  SuccessStoriesSkeleton,
  FeaturesSkeleton,
  CTASkeleton
};
