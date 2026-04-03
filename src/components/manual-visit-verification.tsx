"use client";

import { useState } from "react";
import {
  Home, Calendar, Clock, FileCheck, MapPin, Users, Shield, Check, X,
  ChevronRight, ArrowLeft, CreditCard, IndianRupee, CheckCircle2, Loader2,
  Crown, FileText, Camera, BadgeCheck, ShieldCheck, Lock, EyeOff, Award, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Page = "home" | "login" | "register" | "dashboard" | "profile" | "search" | "matches" | "interests" | "messages" | "settings" | "profileView" | "support" | "safety" | "faq" | "about" | "careers" | "contact" | "terms" | "privacy" | "cookies" | "manualVisitVerification";

type VerificationStatus = 'idle' | 'booking' | 'scheduled' | 'in_progress' | 'completed';
type BookingStep = 'date' | 'address' | 'documents' | 'payment';

interface ManualVisitVerificationPageProps {
  onNavigate: (page: Page) => void;
}

export function ManualVisitVerificationPage({ onNavigate }: ManualVisitVerificationPageProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'express'>('premium');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Address form state
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  // Documents selection
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const timeSlots = [
    { id: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM', icon: '☀️' },
    { id: 'evening', label: 'Evening', time: '4:00 PM - 7:00 PM', icon: '🌆' },
  ];

  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic Visit',
      price: 999,
      description: 'Standard home verification',
      features: ['Home address verification', 'Family meeting', 'Basic document check'],
      popular: false,
      eta: '5-7 business days',
    },
    {
      id: 'premium',
      name: 'Premium Visit',
      price: 1999,
      description: 'Comprehensive verification with report',
      features: ['Everything in Basic', 'Detailed verification report', 'Photo documentation', 'Neighborhood check'],
      popular: true,
      eta: '3-5 business days',
    },
    {
      id: 'express',
      name: 'Express (48hrs)',
      price: 2999,
      description: 'Priority verification in 48 hours',
      features: ['Everything in Premium', 'Priority scheduling', 'Dedicated representative', 'Instant report delivery'],
      popular: false,
      eta: '48 hours',
    },
  ];

  const documentOptions = [
    { id: 'aadhar', label: 'Aadhar Card', required: true },
    { id: 'pan', label: 'PAN Card', required: false },
    { id: 'voterid', label: 'Voter ID', required: false },
    { id: 'passport', label: 'Passport', required: false },
    { id: 'driving', label: 'Driving License', required: false },
    { id: 'utility', label: 'Utility Bill (Electricity/Water)', required: true },
    { id: 'rent', label: 'Rent Agreement (if rented)', required: false },
    { id: 'property', label: 'Property Documents', required: false },
  ];

  const verificationPoints = [
    { icon: Home, label: 'Home address verified', description: 'Physical verification of residence' },
    { icon: Users, label: 'Family members met', description: 'Meet and verify family details' },
    { icon: FileCheck, label: 'Documents verified', description: 'Cross-check submitted documents' },
    { icon: Camera, label: 'Photos of residence', description: 'Optional photo documentation' },
    { icon: MapPin, label: 'Neighborhood check', description: 'Verify local area details' },
  ];

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(d => d !== docId)
        : [...prev, docId]
    );
  };

  const handleConfirmBooking = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setVerificationStatus('scheduled');
  };

  // Generate dates for next 14 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 2; i < 16; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        available: Math.random() > 0.2, // Random availability
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Header Section
  function HeaderSection() {
    return (
      <div className="relative overflow-hidden">
        {/* Background gradient with premium feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B]"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <Home className="w-6 h-6 sm:w-7 sm:h-7" />
                  Home Visit Verification
                </h1>
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#5D0F3A] text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Crown size={12} />
                  Premium
                </span>
              </div>
              <p className="text-white/80 text-sm md:text-base mt-1">
                Get verified by our representative visit
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feature Explanation Section
  function FeatureExplanation() {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-amber-200/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#4A0E25]">What We Verify</h2>
                <p className="text-xs sm:text-sm text-[#5D0F3A]">Comprehensive background verification</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Illustration */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-[#FFF0F5] to-[#FCE4EC] rounded-2xl flex items-center justify-center border border-amber-200/30">
                  <div className="absolute inset-3 sm:inset-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-full flex items-center justify-center shadow-lg">
                        <Home className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <p className="text-xs font-medium text-[#5D0F3A]">Representative<br/>at your home</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Verification list */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { icon: Users, text: 'Family background verification' },
                    { icon: Home, text: 'Residential address confirmation' },
                    { icon: FileCheck, text: 'Family details cross-verification' },
                    { icon: User, text: 'Personal meeting & document check' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-[#FFF0F5] to-white rounded-xl border border-[#FCE4EC]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#4A0E25]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // What's Included Section
  function WhatsIncluded() {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-[#FCE4EC] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#FCE4EC]">
            <h2 className="text-base sm:text-lg font-bold text-[#4A0E25] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2185B]" />
              What&apos;s Included
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {verificationPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <point.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#4A0E25] text-sm sm:text-base">{point.label}</p>
                    <p className="text-xs text-[#5D0F3A]">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Badge Preview */}
            <div className="flex items-center justify-center p-4 sm:p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border-2 border-amber-200/50">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-[#5D0F3A] mb-2">Badge Earned After Verification</p>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-base">Home Verified</span>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pricing Section
  function PricingSection() {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#4A0E25] flex items-center justify-center gap-2">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2185B]" />
            Choose Your Plan
          </h2>
          <p className="text-[#5D0F3A] mt-1 text-sm sm:text-base">Select a verification package that suits your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id as 'basic' | 'premium' | 'express')}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedTier === tier.id 
                  ? 'border-amber-400 shadow-xl shadow-amber-100 scale-[1.02]' 
                  : 'border-[#FCE4EC] hover:border-[#F8BBD9] hover:shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold text-center py-1">
                  Most Popular
                </div>
              )}
              
              <div className={`p-4 sm:p-6 ${tier.popular ? 'pt-8' : ''}`}>
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#4A0E25]">{tier.name}</h3>
                  <p className="text-xs text-[#5D0F3A] mb-2">{tier.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-[#880E4F]" />
                    <span className="text-2xl sm:text-3xl font-bold text-[#880E4F]">{tier.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#5D0F3A] mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tier.eta}
                  </p>
                </div>
                
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-[#4A0E25]">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Selection indicator */}
                <div className={`w-full h-9 sm:h-10 rounded-lg flex items-center justify-center transition-all text-sm ${
                  selectedTier === tier.id
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold'
                    : 'bg-[#FCE4EC] text-[#880E4F]'
                }`}>
                  {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Booking Flow Section
  function BookingFlow() {
    const stepIcons = {
      date: Calendar,
      address: MapPin,
      documents: FileCheck,
      payment: CreditCard,
    };

    const stepLabels = {
      date: 'Date & Time',
      address: 'Address',
      documents: 'Documents',
      payment: 'Payment',
    };

    const steps: BookingStep[] = ['date', 'address', 'documents', 'payment'];
    const currentStepIndex = steps.indexOf(currentStep);

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-[#FCE4EC] overflow-hidden">
          {/* Step Progress */}
          <div className="bg-gradient-to-r from-[#FFF0F5] to-white p-3 sm:p-4 border-b border-[#FCE4EC]">
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((step, i) => {
                const StepIcon = stepIcons[step];
                const isActive = currentStep === step;
                const isCompleted = i < currentStepIndex;
                
                return (
                  <div key={step} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => setCurrentStep(step)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-gradient-to-br from-[#880E4F] to-[#C2185B] text-white shadow-lg scale-110' 
                          : isCompleted
                          ? 'text-emerald-600'
                          : 'text-[#5D0F3A]/50'
                      }`}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-white/20' 
                          : isCompleted 
                          ? 'bg-emerald-100' 
                          : 'bg-[#FCE4EC]'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <StepIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium">{stepLabels[step]}</span>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`w-6 sm:w-8 h-0.5 mx-1 ${
                        i < currentStepIndex ? 'bg-emerald-400' : 'bg-[#F8BBD9]'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Step Content */}
          <div className="p-4 sm:p-6">
            {currentStep === 'date' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-[#4A0E25] mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="w-4 h-4 text-[#C2185B]" />
                    Select Preferred Date
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableDates.slice(0, 8).map((date) => (
                      <button
                        key={date.value}
                        onClick={() => date.available && setSelectedDate(date.value)}
                        disabled={!date.available}
                        className={`p-2 sm:p-3 rounded-xl text-center transition-all text-xs sm:text-sm ${
                          selectedDate === date.value
                            ? 'bg-gradient-to-br from-[#880E4F] to-[#C2185B] text-white shadow-md'
                            : date.available
                            ? 'bg-[#FFF0F5] text-[#4A0E25] hover:bg-[#FCE4EC] border border-[#F8BBD9]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <p className="font-medium">{date.label}</p>
                        {!date.available && <p className="text-[10px]">Unavailable</p>}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-[#4A0E25] mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="w-4 h-4 text-[#C2185B]" />
                    Select Time Slot
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTimeSlot(slot.id)}
                        className={`p-3 sm:p-4 rounded-xl text-center transition-all ${
                          selectedTimeSlot === slot.id
                            ? 'bg-gradient-to-br from-[#880E4F] to-[#C2185B] text-white shadow-md'
                            : 'bg-[#FFF0F5] text-[#4A0E25] hover:bg-[#FCE4EC] border border-[#F8BBD9]'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl mb-1 block">{slot.icon}</span>
                        <p className="font-medium text-xs sm:text-sm">{slot.label}</p>
                        <p className="text-[10px] sm:text-xs opacity-70">{slot.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'address' && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-[#4A0E25] mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 text-[#C2185B]" />
                  Enter Address Details
                </h3>
                
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm text-[#5D0F3A] mb-1 block">Street Address *</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="w-full p-2.5 sm:p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] bg-[#FFF0F5] text-sm"
                      placeholder="House/Flat No., Street Name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs sm:text-sm text-[#5D0F3A] mb-1 block">City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        className="w-full p-2.5 sm:p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] bg-[#FFF0F5] text-sm"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-[#5D0F3A] mb-1 block">State *</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        className="w-full p-2.5 sm:p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] bg-[#FFF0F5] text-sm"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs sm:text-sm text-[#5D0F3A] mb-1 block">PIN Code *</label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) => setAddress({...address, pincode: e.target.value})}
                        className="w-full p-2.5 sm:p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] bg-[#FFF0F5] text-sm"
                        placeholder="PIN Code"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-[#5D0F3A] mb-1 block">Landmark</label>
                      <input
                        type="text"
                        value={address.landmark}
                        onChange={(e) => setAddress({...address, landmark: e.target.value})}
                        className="w-full p-2.5 sm:p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#C2185B] focus:border-[#C2185B] bg-[#FFF0F5] text-sm"
                        placeholder="Near..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'documents' && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-[#4A0E25] mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <FileCheck className="w-4 h-4 text-[#C2185B]" />
                  Select Documents to Keep Ready
                </h3>
                <p className="text-xs sm:text-sm text-[#5D0F3A] mb-4">
                  Our representative will verify these documents during the visit
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {documentOptions.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocumentToggle(doc.id)}
                      className={`p-3 sm:p-4 rounded-xl text-left transition-all flex items-center gap-2 sm:gap-3 ${
                        selectedDocs.includes(doc.id)
                          ? 'bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white shadow-md'
                          : 'bg-[#FFF0F5] text-[#4A0E25] hover:bg-[#FCE4EC] border border-[#F8BBD9]'
                      }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedDocs.includes(doc.id)
                          ? 'bg-white/20'
                          : 'bg-[#F8BBD9]'
                      }`}>
                        {selectedDocs.includes(doc.id) ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-[#C2185B]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{doc.label}</p>
                        {doc.required && (
                          <span className={`text-[10px] sm:text-xs ${selectedDocs.includes(doc.id) ? 'text-white/70' : 'text-[#C2185B]'}`}>
                            Required
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {currentStep === 'payment' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="font-semibold text-[#4A0E25] mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CreditCard className="w-4 h-4 text-[#C2185B]" />
                  Confirm Booking
                </h3>
                
                {/* Booking Summary */}
                <div className="bg-gradient-to-r from-[#FFF0F5] to-white rounded-xl p-3 sm:p-4 border border-[#F8BBD9]">
                  <h4 className="font-semibold text-[#4A0E25] mb-3 text-sm sm:text-base">Booking Summary</h4>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5D0F3A]">Plan:</span>
                      <span className="font-medium text-[#4A0E25]">{pricingTiers.find(t => t.id === selectedTier)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D0F3A]">Date:</span>
                      <span className="font-medium text-[#4A0E25]">{availableDates.find(d => d.value === selectedDate)?.label || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D0F3A]">Time:</span>
                      <span className="font-medium text-[#4A0E25]">{timeSlots.find(t => t.id === selectedTimeSlot)?.label || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D0F3A]">Address:</span>
                      <span className="font-medium text-[#4A0E25] text-right max-w-[150px] sm:max-w-[200px] truncate">{address.street || 'Not entered'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D0F3A]">Documents:</span>
                      <span className="font-medium text-[#4A0E25]">{selectedDocs.length} selected</span>
                    </div>
                    <div className="h-px bg-[#F8BBD9] my-2"></div>
                    <div className="flex justify-between text-sm sm:text-base font-bold">
                      <span className="text-[#4A0E25]">Total Amount:</span>
                      <span className="text-[#880E4F] flex items-center">
                        <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                        {pricingTiers.find(t => t.id === selectedTier)?.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#4A0E25] text-sm sm:text-base">Payment Method</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { id: 'upi', label: 'UPI', icon: '📱' },
                      { id: 'card', label: 'Card', icon: '💳' },
                      { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                      { id: 'wallet', label: 'Wallet', icon: '👛' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        className="p-2 sm:p-3 rounded-xl bg-[#FFF0F5] border border-[#F8BBD9] text-center hover:bg-[#FCE4EC] transition-all"
                      >
                        <span className="text-lg sm:text-xl mb-1 block">{method.icon}</span>
                        <span className="text-xs sm:text-sm text-[#4A0E25]">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation Buttons */}
          <div className="p-4 sm:p-6 pt-0 flex justify-between border-t border-[#FCE4EC] mt-4 pt-4">
            <button
              onClick={() => {
                const prevIndex = steps.indexOf(currentStep) - 1;
                if (prevIndex >= 0) setCurrentStep(steps[prevIndex]);
              }}
              disabled={currentStep === 'date'}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium transition-all text-xs sm:text-sm ${
                currentStep === 'date'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#FCE4EC] text-[#880E4F] hover:bg-[#F8BBD9]'
              }`}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Back
            </button>
            
            {currentStep === 'payment' ? (
              <button
                onClick={handleConfirmBooking}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-500 hover:to-orange-600 shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                Pay & Confirm
              </button>
            ) : (
              <button
                onClick={() => {
                  const nextIndex = steps.indexOf(currentStep) + 1;
                  if (nextIndex < steps.length) setCurrentStep(steps[nextIndex]);
                }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-xl font-semibold hover:from-[#6B0D3C] hover:to-[#AD1457] shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                Continue
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Status Tracking Section
  function StatusTracking() {
    if (verificationStatus === 'idle') return null;
    
    const statusSteps = [
      { id: 'scheduled', label: 'Scheduled', icon: Calendar, completed: verificationStatus !== 'idle' },
      { id: 'in_progress', label: 'In Progress', icon: Loader2, completed: verificationStatus === 'in_progress' || verificationStatus === 'completed' },
      { id: 'completed', label: 'Completed', icon: CheckCircle2, completed: verificationStatus === 'completed' },
    ];
    
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-[#FCE4EC] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#FCE4EC]">
            <h2 className="text-base sm:text-lg font-bold text-[#4A0E25] flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2185B]" />
              Verification Status
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 overflow-x-auto">
              {statusSteps.map((step, i) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`flex flex-col items-center ${
                    step.completed ? 'text-emerald-600' : 'text-[#5D0F3A]/50'
                  }`}>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' 
                        : 'bg-[#FCE4EC]'
                    }`}>
                      <step.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${step.id === 'in_progress' && !step.completed ? 'animate-spin' : ''}`} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium mt-1">{step.label}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`w-12 sm:w-16 md:w-24 h-1 mx-1 sm:mx-2 rounded ${
                      step.completed ? 'bg-emerald-400' : 'bg-[#F8BBD9]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Representative Details */}
            <div className="bg-gradient-to-r from-[#FFF0F5] to-white rounded-xl p-3 sm:p-4 border border-[#F8BBD9]">
              <h3 className="font-semibold text-[#4A0E25] mb-3 text-sm sm:text-base">Representative Details</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  RK
                </div>
                <div>
                  <p className="font-medium text-[#4A0E25] text-sm sm:text-base">Rajesh Kumar</p>
                  <p className="text-xs sm:text-sm text-[#5D0F3A]">Verification Officer</p>
                  <p className="text-xs text-[#C2185B]">+91 98XXX XXXXX</p>
                </div>
              </div>
            </div>
            
            {/* Download Report Button */}
            {verificationStatus === 'completed' && (
              <button className="mt-4 w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Download Verification Report
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment Modal
  function PaymentModal() {
    if (!showPaymentModal) return null;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] p-4">
            <h3 className="text-lg font-bold text-white">Confirm Payment</h3>
            <p className="text-white/80 text-sm">Processing your booking</p>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <IndianRupee className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#880E4F]">
                ₹{pricingTiers.find(t => t.id === selectedTier)?.price.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-[#5D0F3A]">{pricingTiers.find(t => t.id === selectedTier)?.name}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 sm:py-3 bg-[#FCE4EC] text-[#880E4F] rounded-xl font-semibold hover:bg-[#F8BBD9] transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSuccess}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white">
      <HeaderSection />
      
      <main className="pb-8 sm:pb-12">
        <FeatureExplanation />
        <WhatsIncluded />
        <PricingSection />
        
        {verificationStatus === 'idle' && (
          <BookingFlow />
        )}
        
        <StatusTracking />
        
        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-amber-200/50">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-[#5D0F3A]">
                <ShieldCheck className="text-emerald-500" size={16} />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-[#5D0F3A]">
                <BadgeCheck className="text-[#880E4F]" size={16} />
                <span>Verified Representatives</span>
              </div>
              <div className="flex items-center gap-2 text-[#5D0F3A]">
                <Lock className="text-amber-600" size={16} />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <PaymentModal />
    </div>
  );
}
