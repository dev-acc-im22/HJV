"use client";

import { Edit3, Target, Sliders, MessagesSquare, Sparkles, UserPlus, ArrowRight, type LucideIcon } from "lucide-react";

interface FeaturesSectionProps {
  onNavigate?: (page: string) => void;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Edit3,
    title: "Share Your Story",
    desc: "Share your goals, interests, values and your vision of love with honesty. Real connections happen only when you show up as your real self.",
    gradient: "from-[#880E4F] to-[#AD1457]"
  },
  {
    icon: Target,
    title: "Match with Intention",
    desc: "Forget endless scrolling and swiping. Connect with people who match your vibe, align with your goals and values.",
    gradient: "from-[#AD1457] to-[#C2185B]"
  },
  {
    icon: Sliders,
    title: "Match on Your Terms",
    desc: "Your Match, Your Choice. Fine-tune your preferences to meet someone who shares your lifestyle, values and commitment goals.",
    gradient: "from-[#C2185B] to-[#EC407A]"
  },
  {
    icon: MessagesSquare,
    title: "Meaningful Chats That Count",
    desc: "No more aimless chats. Talk about your dreams, goals and your five-year plans and make a connection that feels real.",
    gradient: "from-[#EC407A] to-[#F48FB1]"
  },
  {
    icon: Sparkles,
    title: "Smart Matchmaking",
    desc: "A blend of AI and Human. Our algorithm learns your preferences while our dating experts provide personalized tips.",
    gradient: "from-violet-500 to-purple-600"
  },
];

export function FeaturesSection({ onNavigate }: FeaturesSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-[#FFF8FA] to-[#FFF0F5] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FCE4EC]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#F8BBD9]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] px-4 py-2 rounded-full mb-4 sm:mb-6">
            <Sparkles size={16} className="text-[#C2185B]" />
            <span className="text-xs sm:text-sm font-semibold text-[#C2185B]">Why Choose Us</span>
            <Sparkles size={16} className="text-[#C2185B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A0E25] mb-3 sm:mb-4">
            Create a Profile That Reflects
            <span className="block bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] bg-clip-text text-transparent">
              The Real YOU
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#5D0F3A] max-w-2xl mx-auto">
            Start with honesty and match with intention. Our platform is designed for meaningful connections.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.slice(0, 4).map((feature, i) => (
            <div key={i} className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={22} className="text-white sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">{feature.desc}</p>
              </div>
            </div>
          ))}

          {/* Smart Matchmaking - spans 2 columns on tablet */}
          <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col h-full">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${features[4].gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Sparkles size={22} className="text-white sm:size-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">{features[4].title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">{features[4].desc}</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {onNavigate && (
          <div className="mt-10 sm:mt-14 md:mt-16 text-center">
            <button
              onClick={() => onNavigate("register")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <UserPlus size={18} className="sm:size-5" />
              Start Your Journey Today
              <ArrowRight size={18} className="sm:size-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturesSection;
