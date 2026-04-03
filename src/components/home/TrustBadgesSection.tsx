"use client";

import { BadgeCheck, Lock, Sparkles, Crown, MessageCircle, Filter } from "lucide-react";

const badges = [
  { icon: BadgeCheck, title: "Verified Profiles", desc: "100% verified profiles with ID & photo verification" },
  { icon: Lock, title: "100% Privacy", desc: "End-to-end encryption for all your data" },
  { icon: Sparkles, title: "AI Matching", desc: "Smart compatibility algorithm for best matches" },
  { icon: Crown, title: "Premium Quality", desc: "High-quality profiles from educated professionals" },
  { icon: MessageCircle, title: "Instant Chat", desc: "Real-time messaging with accepted matches" },
  { icon: Filter, title: "Smart Filters", desc: "Advanced search by caste, education, location" },
];

export function TrustBadgesSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-[#FFF0F5] to-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16">
          <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Why Choose Us
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Trusted by Millions</h2>
          <p className="text-sm sm:text-base md:text-lg text-[#5D0F3A]">Features that make us India&apos;s favorite matrimony platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="relative group">
              {/* Glowing hover effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-xl sm:rounded-2xl border-[0.5px] border-[#F8BBD9]/50 p-3 sm:p-4 md:p-5 lg:p-6 hover:border-[#C2185B]/30 hover:shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-[#FCE4EC] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <badge.icon size={20} className="sm:size-5 md:size-6 text-[#C2185B]" />
                </div>
                <h3 className="font-bold text-[#4A0E25] mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">{badge.title}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-[#5D0F3A]">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBadgesSection;
