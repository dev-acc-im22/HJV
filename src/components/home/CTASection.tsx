"use client";

import { Heart, UserPlus, ArrowLeft } from "lucide-react";

interface CTASectionProps {
  onNavigate?: (page: string) => void;
}

// Predefined floating hearts for background decoration
const floatingHearts = [
  { left: '5%', top: '15%', size: 20, delay: 0 },
  { left: '15%', top: '45%', size: 24, delay: 0.3 },
  { left: '25%', top: '75%', size: 18, delay: 0.6 },
  { left: '35%', top: '25%', size: 22, delay: 0.9 },
  { left: '45%', top: '55%', size: 26, delay: 1.2 },
  { left: '55%', top: '85%', size: 20, delay: 1.5 },
  { left: '65%', top: '35%', size: 24, delay: 1.8 },
  { left: '75%', top: '65%', size: 18, delay: 2.1 },
  { left: '85%', top: '20%', size: 22, delay: 2.4 },
  { left: '95%', top: '50%', size: 26, delay: 2.7 },
  { left: '10%', top: '90%', size: 20, delay: 3 },
  { left: '20%', top: '10%', size: 24, delay: 3.3 },
  { left: '30%', top: '60%', size: 18, delay: 3.6 },
  { left: '40%', top: '30%', size: 22, delay: 3.9 },
  { left: '50%', top: '70%', size: 26, delay: 4.2 },
  { left: '60%', top: '5%', size: 20, delay: 4.5 },
  { left: '70%', top: '95%', size: 24, delay: 4.8 },
  { left: '80%', top: '40%', size: 18, delay: 5.1 },
  { left: '90%', top: '80%', size: 22, delay: 5.4 },
  { left: '50%', top: '50%', size: 30, delay: 5.7 },
];

export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-r from-[#5D0F3A] via-[#880E4F] to-[#C2185B] relative overflow-hidden">
      {/* Decorative floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingHearts.map((heart, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: heart.left,
              top: heart.top,
              animationDelay: `${heart.delay}s`,
            }}
          >
            <Heart size={heart.size} className="text-white fill-white" />
          </div>
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Heart size={28} className="text-white sm:size-8 md:size-10" fill="currentColor" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
          Ready to Find Your Soulmate?
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[#FFE4E1] mb-6 sm:mb-8 px-2 sm:px-4 max-w-2xl mx-auto">
          Register now and start your journey to finding the perfect life partner. Your happily ever after begins today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
          <button
            onClick={() => onNavigate?.("register")}
            className="relative group bg-white text-[#880E4F] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg hover:bg-[#FCE4EC] transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 min-h-[44px] overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#880E4F]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <UserPlus size={18} className="sm:size-5" />
            Register Free
            <ArrowLeft size={16} className="rotate-180 sm:size-4 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigate?.("login")}
            className="relative group border-2 border-white text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <ArrowLeft size={16} className="rotate-180 sm:size-4" />
            Login
          </button>
        </div>

        {/* Trust note */}
        <p className="mt-6 sm:mt-8 text-[#FFE4E1]/80 text-xs sm:text-sm flex items-center justify-center gap-2">
          <Heart size={12} className="sm:size-3.5 fill-current" />
          Trusted by over 5 million registered users
          <Heart size={12} className="sm:size-3.5 fill-current" />
        </p>
      </div>
    </section>
  );
}

export default CTASection;
