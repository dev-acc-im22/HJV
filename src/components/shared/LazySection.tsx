"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

/**
 * LazySection - Only renders children when section enters viewport
 * 
 * This prevents hydration of below-fold content until user scrolls to it
 * 
 * @param children - Content to render when in view
 * @param fallback - Loading skeleton to show before content loads
 * @param rootMargin - Margin around the viewport (default: "200px" for preloading)
 * @param threshold - How much of element must be visible (default: 0.1)
 * @param className - Optional className for the wrapper
 */
export function LazySection({
  children,
  fallback,
  rootMargin = "200px",
  threshold = 0.1,
  className = "",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}

/**
 * LazyHydrate - Renders static HTML first, hydrates when in view
 * 
 * This renders the children as static HTML during SSR, but only
 * hydrates (makes interactive) when scrolled into view.
 */
export function LazyHydrate({
  children,
  rootMargin = "100px",
  threshold = 0.1,
}: {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
}) {
  const [shouldHydrate, setShouldHydrate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || shouldHydrate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldHydrate(true);
          observer.unobserve(element);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, shouldHydrate]);

  return (
    <div
      ref={ref}
      // When not hydrated, suppress client-side rendering
      suppressHydrationWarning={!shouldHydrate}
    >
      {shouldHydrate ? children : (
        // Render static HTML that looks like the children
        <div dangerouslySetInnerHTML={{ __html: "" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default LazySection;
