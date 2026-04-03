"use client";

import { Edit3, Search, HeartHandshake } from "lucide-react";

const steps = [
  { step: "1", icon: Edit3, title: "Create Profile", desc: "Sign up and create your detailed profile in minutes. Add photos, preferences, and more." },
  { step: "2", icon: Search, title: "Find Matches", desc: "Search and get AI-powered personalized matches based on your preferences." },
  { step: "3", icon: HeartHandshake, title: "Connect", desc: "Send interests, chat with matches, and find your perfect life partner." },
];

export function HowItWorksSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16">
          <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            How It Works
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Three Simple Steps</h2>
          <p className="text-sm sm:text-base md:text-lg text-[#5D0F3A] max-w-2xl mx-auto px-2">
            Find your perfect life partner in three easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {steps.map((feature, i) => (
            <div key={i} className="relative group">
              {/* Glowing hover effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-[1.5rem] sm:rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative p-5 sm:p-6 md:p-7 lg:p-8 bg-white rounded-[1.5rem] sm:rounded-[2rem] border-[0.5px] border-[#F8BBD9]/50 hover:border-[#C2185B]/30 hover:shadow-[0_20px_60px_-15px_rgba(136,14,79,0.3)] transition-all duration-500 text-center group-hover:-translate-y-1">
                {/* Step Pill */}
                <div className="flex justify-center mb-4 sm:mb-5">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-lg">
                    <span className="font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider">Step {feature.step}</span>
                  </div>
                </div>
                {/* Icon Container */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 bg-[#FCE4EC] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon size={28} className="sm:size-8 md:size-9 lg:size-8 text-[#C2185B]" />
                </div>
                {/* Title */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#4A0E25] mb-1.5 sm:mb-2">{feature.title}</h3>
                {/* Description */}
                <p className="text-xs sm:text-sm md:text-base text-[#5D0F3A]">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
