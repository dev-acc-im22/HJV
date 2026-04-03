"use client";

import { useState } from "react";
import { 
  Heart, HeartHandshake, Search, Sparkles, UserPlus, ArrowRight,
  ChevronDown, BadgeCheck, Award, Users, TrendingUp
} from "lucide-react";

interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

// Predefined floating elements to avoid hydration mismatch
const floatingHearts = [
  { left: '10%', top: '20%', size: 28, delay: 0, duration: 5 },
  { left: '25%', top: '60%', size: 24, delay: 0.5, duration: 6 },
  { left: '40%', top: '30%', size: 32, delay: 1, duration: 4.5 },
  { left: '55%', top: '70%', size: 22, delay: 1.5, duration: 5.5 },
  { left: '70%', top: '15%', size: 30, delay: 2, duration: 6.5 },
  { left: '85%', top: '50%', size: 26, delay: 2.5, duration: 5 },
  { left: '15%', top: '80%', size: 20, delay: 3, duration: 4 },
  { left: '30%', top: '10%', size: 35, delay: 3.5, duration: 5.5 },
  { left: '60%', top: '45%', size: 25, delay: 4, duration: 6 },
  { left: '75%', top: '85%', size: 28, delay: 4.5, duration: 4.5 },
  { left: '90%', top: '25%', size: 22, delay: 5, duration: 5.5 },
  { left: '5%', top: '55%', size: 30, delay: 5.5, duration: 6 },
];

const floatingCircles = [
  { left: '5%', top: '10%', size: 60, delay: 0 },
  { left: '20%', top: '40%', size: 80, delay: 0.7 },
  { left: '35%', top: '75%', size: 50, delay: 1.4 },
  { left: '50%', top: '20%', size: 70, delay: 2.1 },
  { left: '65%', top: '60%', size: 55, delay: 2.8 },
  { left: '80%', top: '35%', size: 75, delay: 3.5 },
  { left: '95%', top: '70%', size: 65, delay: 4.2 },
  { left: '45%', top: '90%', size: 45, delay: 4.9 },
];

const trustBadges = [
  { icon: BadgeCheck, value: "5M+", label: "Verified Profiles", gradient: "from-[#880E4F] to-[#C2185B]" },
  { icon: Heart, value: "2M+", label: "Successful Matches", gradient: "from-[#AD1457] to-[#EC407A]" },
  { icon: Award, value: "15+", label: "Years of Service", gradient: "from-[#C2185B] to-[#F06292]" },
];

const stats = [
  { value: "5M+", label: "Profiles", icon: Users },
  { value: "2M+", label: "Matches", icon: Heart },
  { value: "98%", label: "Success", icon: TrendingUp },
];

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [searchForm, setSearchForm] = useState({
    profileFor: "",
    gender: "",
    age: "",
    city: "",
    religion: "",
    motherTongue: "",
  });

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#C2185B]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#880E4F]/30 via-[#AD1457]/20 to-transparent"></div>
        
        {/* Floating animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating hearts */}
          {floatingHearts.map((heart, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-20"
              style={{
                left: heart.left,
                top: heart.top,
                animationDelay: `${heart.delay}s`,
                animationDuration: `${heart.duration}s`,
              }}
            >
              <Heart size={heart.size} className="text-[#880E4F] fill-[#880E4F]/30" />
            </div>
          ))}
          
          {/* Floating circles */}
          {floatingCircles.map((circle, i) => (
            <div
              key={`circle-${i}`}
              className="absolute rounded-full animate-pulse-slow"
              style={{
                left: circle.left,
                top: circle.top,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                animationDelay: `${circle.delay}s`,
                background: `radial-gradient(circle, rgba(194, 24, 91, 0.1) 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center py-8 sm:py-10 md:py-12">
        {/* Logo Badge */}
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 md:mb-12">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow">
            <HeartHandshake size={32} className="text-[#880E4F] sm:size-9 md:size-10" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A0E25] mb-3 sm:mb-4 drop-shadow-sm animate-fade-in-up">
          Find Your Perfect
          <span className="block bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] bg-clip-text text-transparent">
            Life Partner
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#5D0F3A] mb-6 sm:mb-8 md:mb-10 lg:mb-14 max-w-2xl mx-auto px-2 sm:px-4 animate-fade-in-up animation-delay-100">
          India&apos;s Most Trusted Matrimony Service with AI-Powered Matching. 
          Join millions who found their happily ever after.
        </p>

        {/* Quick Search / Register Widget */}
        <div className="relative max-w-5xl mx-auto animate-fade-in-up animation-delay-200">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-3xl blur-sm opacity-40"></div>
          
          <div className="relative bg-white/98 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-5 md:p-6 lg:p-8 border-2 border-[#FCE4EC]">
            {/* Header */}
            <div className="flex flex-col items-center mb-4 sm:mb-5 md:mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center shadow-md">
                  <Search size={14} className="text-white sm:size-4" />
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#4A0E25]">Find Your Perfect Match</h2>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#AD1457] to-[#EC407A] rounded-lg flex items-center justify-center shadow-md">
                  <Heart size={14} className="text-white sm:size-4" />
                </div>
              </div>
              <p className="text-xs md:text-sm text-[#5D0F3A] flex items-center gap-1">
                <Sparkles size={12} className="text-[#C2185B]" />
                Quick Registration - Start your journey today!
                <Sparkles size={12} className="text-[#C2185B]" />
              </p>
            </div>
            
            {/* Decorative line */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#F8BBD9] to-transparent mb-5"></div>
            
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4">
              {/* Profile Created For */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={searchForm.profileFor}
                  onChange={(e) => setSearchForm({ ...searchForm, profileFor: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-xs sm:text-sm whitespace-nowrap min-w-0 sm:min-w-[130px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8 min-h-[44px]"
                >
                  <option value="">Profile For</option>
                  <option value="self">Myself</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                  <option value="friend">Friend</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AD1457] pointer-events-none" />
              </div>

              {/* Gender */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={searchForm.gender}
                  onChange={(e) => setSearchForm({ ...searchForm, gender: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-xs sm:text-sm whitespace-nowrap min-w-0 sm:min-w-[110px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8 min-h-[44px]"
                >
                  <option value="">Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AD1457] pointer-events-none" />
              </div>

              {/* Age */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={searchForm.age}
                  onChange={(e) => setSearchForm({ ...searchForm, age: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-xs sm:text-sm whitespace-nowrap min-w-0 sm:min-w-[110px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8 min-h-[44px]"
                >
                  <option value="">Age</option>
                  <option value="18-25">18 - 25</option>
                  <option value="26-30">26 - 30</option>
                  <option value="31-35">31 - 35</option>
                  <option value="36-40">36 - 40</option>
                  <option value="40+">40+</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AD1457] pointer-events-none" />
              </div>

              {/* Religion */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={searchForm.religion}
                  onChange={(e) => setSearchForm({ ...searchForm, religion: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-xs sm:text-sm whitespace-nowrap min-w-0 sm:min-w-[120px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8 min-h-[44px]"
                >
                  <option value="">Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Jain">Jain</option>
                  <option value="Buddhist">Buddhist</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AD1457] pointer-events-none" />
              </div>

              {/* Mother Tongue */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={searchForm.motherTongue}
                  onChange={(e) => setSearchForm({ ...searchForm, motherTongue: e.target.value })}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-xs sm:text-sm whitespace-nowrap min-w-0 sm:min-w-[140px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8 min-h-[44px]"
                >
                  <option value="">Mother Tongue</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Bengali">Bengali</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AD1457] pointer-events-none" />
              </div>

              {/* Register Button */}
              <button
                onClick={() => onNavigate("register")}
                className="relative w-full sm:w-auto group bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm whitespace-nowrap overflow-hidden min-h-[44px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <UserPlus size={18} />
                Register Free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="mt-4 sm:mt-5 text-[#880E4F] text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2">
              <Users size={12} className="text-[#C2185B] sm:size-3.5" />
              Join <span className="font-semibold text-[#880E4F]">5 million+</span> happy couples who found their life partner
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 sm:mt-10 md:mt-14 lg:mt-16 flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 animate-fade-in-up animation-delay-300 relative">
          <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
            <defs>
              <linearGradient id="maroonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#880E4F" />
                <stop offset="50%" stopColor="#AD1457" />
                <stop offset="100%" stopColor="#C2185B" />
              </linearGradient>
            </defs>
          </svg>
          {trustBadges.map((badge, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#880E4F]/30 via-[#AD1457]/20 to-[#C2185B]/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-[#FCE4EC]">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br ${badge.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-md ring-2 ring-white/50`}>
                  <badge.icon size={18} className="text-white sm:size-5 md:size-5.5" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${badge.gradient} bg-clip-text text-transparent`}>{badge.value}</span>
                  <span className="text-[#4A0E25] font-medium text-[10px] sm:text-xs md:text-sm">{badge.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-14 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border-[0.5px] border-[#F8BBD9]/50 hover:border-[#C2185B]/30 hover:shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] transition-all duration-500 group-hover:-translate-y-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-[#FCE4EC] rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <stat.icon size={16} className="sm:size-4 md:size-5" style={{ stroke: 'url(#maroonGradient)' }} />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#C2185B]">{stat.value}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-[#5D0F3A]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={32} className="text-[#880E4F]/50" />
      </div>
    </section>
  );
}

export default HeroSection;
