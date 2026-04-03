"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";

const successStories = [
  { 
    id: 1,
    names: "Priya & Rahul", 
    location: "Mumbai", 
    story: "We found each other on Happy Jodi Vibes and it was love at first sight. Thank you for bringing us together!",
    married: "Married in Dec 2023"
  },
  { 
    id: 2,
    names: "Sneha & Vikram", 
    location: "Delhi", 
    story: "The compatibility matching was spot on. We are now happily married for 2 years!",
    married: "Married in Feb 2023"
  },
  { 
    id: 3,
    names: "Anjali & Arjun", 
    location: "Bangalore", 
    story: "The best decision we made was joining Happy Jodi Vibes. The verified profiles gave us confidence.",
    married: "Married in May 2023"
  },
  { 
    id: 4,
    names: "Neha & Karan", 
    location: "Hyderabad", 
    story: "Never thought I'd find my soulmate online, but Happy Jodi Vibes proved me wrong. Forever grateful!",
    married: "Married in Aug 2023"
  },
  { 
    id: 5,
    names: "Pooja & Amit", 
    location: "Chennai", 
    story: "The AI matching was incredible - we were 94% compatible and it showed in our conversations!",
    married: "Married in Nov 2023"
  },
  { 
    id: 6,
    names: "Meera & Siddharth", 
    location: "Pune", 
    story: "From the first message to our wedding day, everything felt perfect. Thank you Happy Jodi Vibes!",
    married: "Married in Jan 2024"
  },
];

export function SuccessStoriesSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % successStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16">
          <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Success Stories
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Real Couples, Real Stories</h2>
          <p className="text-sm sm:text-base md:text-lg text-[#5D0F3A]">See how Happy Jodi Vibes brought people together</p>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => scrollCarousel('left')}
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          >
            <ChevronLeft size={18} className="text-[#880E4F] sm:size-5" />
          </button>
          <div className="flex gap-1.5 sm:gap-2">
            {successStories.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`h-2 rounded-full transition-all ${
                  currentTestimonial === i ? 'w-5 sm:w-6 bg-[#C2185B]' : 'w-2 bg-[#F8BBD9]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => scrollCarousel('right')}
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          >
            <ChevronRight size={18} className="text-[#880E4F] sm:size-5" />
          </button>
        </div>

        {/* Stories Carousel */}
        <div 
          ref={carouselRef}
          className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-8 overflow-x-auto scrollbar-hide pb-4 -mx-4 sm:mx-0 px-4 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {successStories.map((story, i) => (
            <div 
              key={story.id}
              className={`group flex-shrink-0 w-72 sm:w-80 md:w-96 bg-white rounded-2xl sm:rounded-3xl transition-all duration-300 ease-out ${
                currentTestimonial === i 
                  ? 'ring-2 ring-[#C2185B] shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] scale-[1.02]' 
                  : 'shadow-[0_8px_30px_-12px_rgba(136,14,79,0.15)] hover:shadow-[0_16px_40px_-12px_rgba(136,14,79,0.25)] hover:scale-[1.01]'
              }`}
            >
              {/* Card Top Decoration */}
              <div className="relative h-1.5 sm:h-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-t-2xl sm:rounded-t-3xl"></div>
              
              {/* Card Content */}
              <div className="p-4 sm:p-5 md:p-6 lg:p-8 relative">
                {/* Decorative Quote Icon */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-[#880E4F] sm:size-10 md:size-12">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>

                {/* Avatar */}
                <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
                  <div className="relative">
                    {/* Outer ring decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] rounded-full scale-[1.15] opacity-60"></div>
                    
                    {/* Avatar */}
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center text-white text-base sm:text-lg md:text-xl font-bold shadow-lg ring-3 sm:ring-4 ring-white">
                      {story.names.split(' & ')[0][0]} & {story.names.split(' & ')[1][0]}
                    </div>
                    
                    {/* Heart badge */}
                    <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md ring-1 sm:ring-2 ring-white group-hover:scale-110 transition-transform duration-300">
                      <Heart size={10} className="text-white fill-white sm:size-3 md:size-3.5" />
                    </div>
                  </div>
                </div>

                {/* Couple Names */}
                <h3 className="font-bold text-[#4A0E25] text-center text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2 tracking-wide">
                  {story.names}
                </h3>
                
                {/* Location & Marriage Date */}
                <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 mb-3 sm:mb-4 md:mb-5 px-1 sm:px-2">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[#C2185B] text-xs sm:text-sm whitespace-nowrap">
                    <Heart size={12} className="sm:size-3.5" />
                    <span className="font-medium">{story.location}</span>
                  </div>
                  <div className="w-1 h-1 bg-[#F8BBD9] rounded-full hidden sm:block"></div>
                  <div className="text-[#880E4F] text-xs sm:text-sm whitespace-nowrap">
                    {story.married}
                  </div>
                </div>

                {/* Story */}
                <p className="text-gray-600 text-center text-xs sm:text-sm md:text-base leading-relaxed px-1 sm:px-2 mb-3 sm:mb-4 md:mb-5">
                  &ldquo;{story.story}&rdquo;
                </p>

                {/* Verified Badge */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#AD1457] bg-[#FCE4EC]/50 rounded-full py-2 sm:py-2.5 px-3 sm:px-5 group-hover:bg-[#FCE4EC] transition-colors duration-300 whitespace-nowrap">
                  <BadgeCheck size={12} className="text-[#880E4F] flex-shrink-0 sm:size-3.5" />
                  <span className="font-medium">Verified Happy Couple</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SuccessStoriesSection;
