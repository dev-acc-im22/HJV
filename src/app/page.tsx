"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy, ComponentType } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Montserrat } from "next/font/google";
import { HeroSection } from "@/components/home/HeroSection";
import { 
  mockProfiles, mockInteractions, mockMessages, ghostUserProfile, 
  ghostPartnerPreferences, getMatchesForGhost, filterProfiles,
  calculateCompatibility,
  type MockProfile, type MockInteraction, type MockMessage, type LifestyleTag 
} from "@/lib/mock-data";
import { 
  getExtendedProfileData, 
  generateIcebreakers,
  type ExtendedProfileData 
} from "@/lib/extended-profile-data";
import {
  LayoutDashboard, Search, Heart, MessageCircle, Settings, User, Lock, Star,
  Check, X, ChevronRight, Eye, EyeOff, Send, Bookmark, Shield, Sparkles, Phone,
  Mail, MapPin, Briefcase, GraduationCap, Calendar, Ruler, Users, Globe,
  Bell, Menu, Ghost, LogOut, UserPlus, ArrowRight, ArrowLeft, Filter, Grid, List,
  Facebook, Instagram, Twitter, Linkedin, Camera, Edit3, Trash2, Plus, Home,
  Minus, Clock, TrendingUp, Award, BadgeCheck, Crown, HeartHandshake,
  MessagesSquare, UserCheck, UserX, Ban, MoreVertical, ChevronDown, UserCircle,
  Grid3X3, StarOff, HeartOff, ShieldCheck, Share2, Mic, Play, ChevronLeft,
  Video, VideoOff, Zap, Gift, AlertTriangle, AlertCircle, Volume2, VolumeX, CreditCard, Wallet,
  Building, IndianRupee, CheckCircle2, XCircle, Loader2, RefreshCw, Upload,
  Image as ImageIcon, FileText, Info, HelpCircle, ExternalLink, Pause, Sliders, Target,
  Inbox, Smile, Paperclip, CheckCheck, Headphones, CalendarCheck, StarRating, Handshake,
  PhoneCall, PhoneOff, PhoneIncoming, PhoneMissed, Download, Square, Music, Dog, Cat, Bird, Fish, Sun, Moon, Coffee, Tea, Cigarette, Wine, Dumbbell, BookOpen, Utensils, TreePine, Leaf, PawPrint
} from "lucide-react";

// ============================================================================
// MAROON GRADIENT ICON COMPONENT
// ============================================================================

function GradientIcon({ 
  icon: Icon, 
  size = 20, 
  className = "",
  gradientClass = "from-[#880E4F] via-[#AD1457] to-[#C2185B]"
}: { 
  icon: React.ElementType; 
  size?: number; 
  className?: string;
  gradientClass?: string;
}) {
  return (
    <div className={`inline-flex items-center justify-center bg-gradient-to-br ${gradientClass} p-2 rounded-lg shadow-md ${className}`}>
      <Icon size={size} className="text-white" />
    </div>
  );
}

function GradientIconInline({ 
  icon: Icon, 
  size = 16,
  className = ""
}: { 
  icon: React.ElementType; 
  size?: number;
  className?: string;
}) {
  return (
    <Icon size={size} className={`text-white ${className}`} />
  );
}

function GradientTextIcon({
  icon: Icon,
  size = 24,
  className = ""
}: {
  icon: React.ElementType;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`icon-gradient ${className}`}>
      <Icon size={size} />
    </div>
  );
}

// ============================================================================
// SPOTLIGHT BADGE COMPONENT
// ============================================================================

function SpotlightBadge({ size = "sm", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2"
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div className={`bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white rounded-full shadow-md animate-pulse ${sizeClasses[size]} ${className}`}>
      <Zap size={iconSizes[size]} />
    </div>
  );
}

function SpotlightBadgeInline({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${className}`}>
      <Zap size={10} />
      Spotlight
    </span>
  );
}

// ============================================================================
// LIFESTYLE TAGS COMPONENTS
// ============================================================================

// Available lifestyle tags with their icons and colors
const LIFESTYLE_TAG_CONFIG: Record<LifestyleTag, { icon: React.ElementType; color: string; bg: string }> = {
  'Pet Parent': { icon: PawPrint, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'Wanderlust': { icon: TreePine, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'Work-from-Home': { icon: Home, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'Fitness Enthusiast': { icon: Dumbbell, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  'Tea over Coffee': { icon: Coffee, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'Coffee Lover': { icon: Coffee, color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  'Non-Smoker': { icon: Leaf, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  'Non-Drinker': { icon: XCircle, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  'Early Bird': { icon: Sun, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  'Night Owl': { icon: Moon, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  'Foodie': { icon: Utensils, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  'Bookworm': { icon: BookOpen, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  'Music Lover': { icon: Music, color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200' },
  'Movie Buff': { icon: Video, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  'Nature Lover': { icon: TreePine, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  'Spiritual': { icon: Sparkles, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' }, // Spirituality
  'Vegetarian': { icon: Leaf, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  'Animal Lover': { icon: Heart, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

// Lifestyle Tag Badge Component
function LifestyleTagBadge({ tag, size = "md" }: { tag: LifestyleTag; size?: "sm" | "md" | "lg" }) {
  const config = LIFESTYLE_TAG_CONFIG[tag];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.color} font-medium ${sizeClasses[size]}`}>
      <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
      {tag}
    </span>
  );
}

// Lifestyle Tags Display Component
function LifestyleTagsDisplay({ tags, maxDisplay = 5, size = "md" }: { tags: LifestyleTag[] | undefined; maxDisplay?: number; size?: "sm" | "md" | "lg" }) {
  if (!tags || tags.length === 0) return null;
  
  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;
  
  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag) => (
        <LifestyleTagBadge key={tag} tag={tag} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-medium">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESSIVE LOADING SKELETONS
// ============================================================================

// Hero Section Skeleton
function HeroSkeleton() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#C2185B]">
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <Skeleton className="h-16 w-3/4 mx-auto mb-6 bg-white/30 rounded-2xl" />
        <Skeleton className="h-8 w-2/3 mx-auto mb-8 bg-white/20 rounded-xl" />
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto">
          <Skeleton className="h-6 w-1/2 mx-auto mb-4 bg-rose-100 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 bg-rose-50 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-14 w-full bg-gradient-to-r from-[#880E4F] to-[#C2185B] rounded-xl" />
        </div>
      </div>
    </section>
  );
}

// Trust Badges Skeleton
function TrustBadgesSkeleton() {
  return (
    <section className="py-8 bg-white border-b border-[#FCE4EC]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full bg-rose-100" />
              <div className="text-left">
                <Skeleton className="h-5 w-16 bg-rose-50 rounded" />
                <Skeleton className="h-3 w-12 mt-1 bg-rose-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Success Stories Skeleton
function SuccessStoriesSkeleton() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#FFF0F5]">
      <div className="max-w-6xl mx-auto px-4">
        <Skeleton className="h-10 w-64 mx-auto mb-2 bg-rose-100 rounded-xl" />
        <Skeleton className="h-6 w-80 mx-auto mb-8 bg-rose-50 rounded-lg" />
        <div className="flex gap-6 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="min-w-[300px] bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-20 mx-auto rounded-full bg-rose-100 mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2 bg-rose-50 rounded" />
                <Skeleton className="h-4 w-24 mx-auto mb-4 bg-rose-50 rounded" />
                <Skeleton className="h-16 w-full bg-rose-50 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section Skeleton
function FeaturesSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <Skeleton className="h-10 w-48 mx-auto mb-2 bg-rose-100 rounded-xl" />
        <Skeleton className="h-6 w-72 mx-auto mb-12 bg-rose-50 rounded-lg" />
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-[#FCE4EC] hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Skeleton className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 mb-4" />
                <Skeleton className="h-5 w-24 mx-auto mb-2 bg-rose-50 rounded" />
                <Skeleton className="h-12 w-full bg-rose-50 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Skeleton
function CTASkeleton() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Skeleton className="h-12 w-2/3 mx-auto mb-4 bg-white/20 rounded-xl" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-8 bg-white/10 rounded-lg" />
        <Skeleton className="h-14 w-48 mx-auto bg-white rounded-xl" />
      </div>
    </section>
  );
}

// Dashboard Page Skeleton
function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-[#FCE4EC]">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-24 mx-auto rounded-full bg-rose-100 mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2 bg-rose-50 rounded" />
              <Skeleton className="h-4 w-24 mx-auto bg-rose-50 rounded" />
            </CardContent>
          </Card>
          <Card className="border-[#FCE4EC]">
            <CardContent className="p-4">
              <Skeleton className="h-6 w-28 bg-rose-50 rounded mb-3" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-rose-50 rounded-lg mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-[#FCE4EC]">
            <CardContent className="p-4">
              <Skeleton className="h-8 w-40 bg-rose-50 rounded mb-4" />
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="border-[#FCE4EC]">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full bg-rose-100" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-24 bg-rose-50 rounded mb-1" />
                        <Skeleton className="h-4 w-32 bg-rose-50 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Search Page Skeleton
function SearchSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        <div className="hidden lg:block w-72 space-y-4">
          <Card className="border-[#FCE4EC]">
            <CardContent className="p-4">
              <Skeleton className="h-6 w-20 bg-rose-50 rounded mb-4" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-4 w-16 bg-rose-50 rounded mb-2" />
                  <Skeleton className="h-10 w-full bg-rose-50 rounded-lg" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48 bg-rose-50 rounded" />
            <Skeleton className="h-10 w-32 bg-rose-50 rounded-lg" />
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-[#FCE4EC]">
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full bg-rose-100 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-32 bg-rose-50 rounded mb-2" />
                  <Skeleton className="h-4 w-24 bg-rose-50 rounded mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 bg-rose-50 rounded-lg" />
                    <Skeleton className="h-10 flex-1 bg-rose-50 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Messages Page Skeleton
function MessagesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6 h-[70vh]">
        <Card className="border-[#FCE4EC]">
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full bg-rose-50 rounded-lg mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 mb-2 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full bg-rose-100" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 bg-rose-50 rounded mb-1" />
                  <Skeleton className="h-4 w-32 bg-rose-50 rounded" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2 border-[#FCE4EC] flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-3 pb-4 border-b border-[#FCE4EC]">
              <Skeleton className="h-10 w-10 rounded-full bg-rose-100" />
              <Skeleton className="h-6 w-32 bg-rose-50 rounded" />
            </div>
            <div className="flex-1 py-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-40'} bg-rose-50 rounded-2xl`} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t border-[#FCE4EC]">
              <Skeleton className="h-10 flex-1 bg-rose-50 rounded-lg" />
              <Skeleton className="h-10 w-10 bg-gradient-to-r from-[#880E4F] to-[#C2185B] rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Profile Page Skeleton
function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="border-[#FCE4EC]">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="h-32 w-32 rounded-full bg-rose-100" />
            <div className="flex-1">
              <Skeleton className="h-8 w-40 bg-rose-50 rounded mb-2" />
              <Skeleton className="h-4 w-32 bg-rose-50 rounded" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 bg-rose-50 rounded mb-2" />
                <Skeleton className="h-10 w-full bg-rose-50 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Generic Page Skeleton
function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-6 bg-rose-50 rounded" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-[#FCE4EC]">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 bg-rose-50 rounded mb-4" />
              <Skeleton className="h-4 w-full bg-rose-50 rounded mb-2" />
              <Skeleton className="h-4 w-3/4 bg-rose-50 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Full Home Page Skeleton
function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      <HeroSkeleton />
      <TrustBadgesSkeleton />
      <SuccessStoriesSkeleton />
      <FeaturesSkeleton />
      <CTASkeleton />
    </div>
  );
}

// Progressive Page Wrapper - shows skeleton then fades in content
function ProgressivePageWrapper({ 
  children, 
  Skeleton: SkeletonComponent,
  delay = 0 
}: { 
  children: React.ReactNode; 
  Skeleton: ComponentType;
  delay?: number;
}) {
  const [showContent, setShowContent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!showContent) {
    return <SkeletonComponent />;
  }

  return (
    <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}

// ============================================================================
// AUDIO RECORDER COMPONENT
// ============================================================================

function AudioRecorder({ 
  onSave, 
  existingAudio,
  maxDuration = 15 
}: { 
  onSave: (audioData: { base64: string; duration: number }) => void;
  existingAudio?: { duration: number; audioUrl?: string };
  maxDuration?: number;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio?.audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Play/pause audio
  const togglePlayback = () => {
    if (!audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Save audio
  const saveAudio = async () => {
    if (!audioBlob) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onSave({ base64, duration: recordingTime });
    };
  };

  // Delete audio
  const deleteAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-[#FFF0F5] to-white rounded-2xl border-2 border-[#F8BBD9] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center shadow-md">
          <Mic size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[#4A0E25]">Audio Introduction</h3>
          <p className="text-sm text-[#5D0F3A]">Record a 15-second voice intro</p>
        </div>
      </div>

      {!audioUrl ? (
        // Recording Interface
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-gradient-to-br from-[#880E4F] to-[#AD1457] hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457]'
            }`}
          >
            {isRecording ? (
              <Square size={32} className="text-white" />
            ) : (
              <Mic size={32} className="text-white" />
            )}
          </button>
          
          {isRecording && (
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-red-600">{formatTime(recordingTime)}</p>
              <p className="text-sm text-gray-500">Recording... (max {maxDuration}s)</p>
            </div>
          )}
          
          {!isRecording && (
            <p className="text-sm text-[#5D0F3A] text-center">
              Tap to start recording. Share your personality in your own voice!
            </p>
          )}
        </div>
      ) : (
        // Playback Interface
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white rounded-xl p-3 border border-[#FCE4EC]">
            <button
              onClick={togglePlayback}
              className="w-12 h-12 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              {isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white ml-0.5" />
              )}
            </button>
            
            <div className="flex-1">
              <div className="flex gap-0.5 items-center h-8">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#C2185B] rounded-full transition-all"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0:00</span>
                <span>{formatTime(existingAudio?.duration || recordingTime)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={deleteAudio}
              className="flex-1 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </button>
            <button
              onClick={saveAudio}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} /> Save Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AUDIO PLAYER COMPONENT (for viewing profiles)
// ============================================================================

function AudioPlayer({ duration, onPlay }: { duration: number; onPlay?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    onPlay?.();
  };

  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 flex items-center gap-4">
      <button 
        onClick={handlePlayPause}
        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all text-sky-600 hover:text-sky-700"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="flex gap-0.5 items-center h-10">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${
                i < (currentTime / duration) * 40 ? 'bg-sky-500' : 'bg-sky-200'
              }`}
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BIODATA PDF GENERATOR
// ============================================================================

function generateBiodataPDF(profile: typeof ghostUserProfile) {
  // Create a printable HTML content for biodata
  const biodataHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Biodata - ${profile.name}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { 
      font-family: 'Georgia', serif; 
      line-height: 1.6; 
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header { 
      text-align: center; 
      border-bottom: 3px double #880E4F; 
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { 
      color: #880E4F; 
      margin: 0;
      font-size: 28px;
    }
    .header .subtitle {
      color: #AD1457;
      font-style: italic;
      margin-top: 5px;
    }
    .photo-placeholder {
      width: 150px;
      height: 180px;
      border: 2px solid #F8BBD9;
      margin: 20px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFF0F5;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: linear-gradient(to right, #880E4F, #AD1457);
      color: white;
      padding: 8px 15px;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .info-item {
      padding: 5px 0;
      border-bottom: 1px dotted #F8BBD9;
    }
    .info-label {
      color: #880E4F;
      font-weight: bold;
      font-size: 13px;
    }
    .info-value {
      color: #333;
    }
    .full-width {
      grid-column: span 2;
    }
    .bio-box {
      background: #FFF0F5;
      border-left: 4px solid #880E4F;
      padding: 15px;
      font-style: italic;
    }
    .family-table {
      width: 100%;
      border-collapse: collapse;
    }
    .family-table td {
      padding: 8px;
      border-bottom: 1px solid #F8BBD9;
    }
    .family-table td:first-child {
      font-weight: bold;
      color: #880E4F;
      width: 35%;
    }
    .horoscope-box {
      background: linear-gradient(to right, #FFF0F5, #FCE4EC);
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .horoscope-item {
      display: inline-block;
      margin: 5px 15px;
    }
    .horoscope-label {
      font-size: 12px;
      color: #880E4F;
    }
    .horoscope-value {
      font-weight: bold;
      font-size: 16px;
    }
    .lifestyle-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .tag {
      background: #FCE4EC;
      color: #880E4F;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #F8BBD9;
      color: #AD1457;
      font-size: 12px;
    }
    .swastik {
      font-size: 24px;
      color: #880E4F;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="swastik">ॐ</div>
    <h1>${profile.name}</h1>
    <div class="subtitle">Biodata for Marriage Proposal</div>
  </div>

  <div class="section">
    <div class="section-title">📋 Basic Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${profile.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Age</div>
        <div class="info-value">${profile.age} years</div>
      </div>
      <div class="info-item">
        <div class="info-label">Height</div>
        <div class="info-value">${profile.height} cm (${Math.round(profile.height / 2.54)}'${Math.round((profile.height / 2.54 % 12))}")</div>
      </div>
      <div class="info-item">
        <div class="info-label">Marital Status</div>
        <div class="info-value">${profile.maritalStatus.replace('_', ' ')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Religion</div>
        <div class="info-value">${profile.religion}${profile.caste ? ` - ${profile.caste}` : ''}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Mother Tongue</div>
        <div class="info-value">${profile.motherTongue}</div>
      </div>
      <div class="info-item full-width">
        <div class="info-label">Location</div>
        <div class="info-value">${profile.city}, ${profile.state}, ${profile.country}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🎓 Education & Career</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Education</div>
        <div class="info-value">${profile.education || 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Occupation</div>
        <div class="info-value">${profile.occupation || 'Not specified'}</div>
      </div>
      <div class="info-item full-width">
        <div class="info-label">Annual Income</div>
        <div class="info-value">₹${profile.annualIncome ? (profile.annualIncome / 100000).toFixed(0) + ' Lakhs' : 'Not specified'}</div>
      </div>
    </div>
  </div>

  ${profile.bio ? `
  <div class="section">
    <div class="section-title">💬 About Me</div>
    <div class="bio-box">${profile.bio}</div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">👨‍👩‍👧‍👦 Family Details</div>
    <table class="family-table">
      ${profile.fatherName ? `<tr><td>Father's Name</td><td>${profile.fatherName}</td></tr>` : ''}
      ${profile.fatherOccupation ? `<tr><td>Father's Occupation</td><td>${profile.fatherOccupation}</td></tr>` : ''}
      ${profile.motherName ? `<tr><td>Mother's Name</td><td>${profile.motherName}</td></tr>` : ''}
      ${profile.motherOccupation ? `<tr><td>Mother's Occupation</td><td>${profile.motherOccupation}</td></tr>` : ''}
      ${profile.siblings ? `<tr><td>Siblings</td><td>${profile.siblings}</td></tr>` : ''}
      ${profile.familyType ? `<tr><td>Family Type</td><td>${profile.familyType}</td></tr>` : ''}
      ${profile.familyStatus ? `<tr><td>Family Status</td><td>${profile.familyStatus}</td></tr>` : ''}
    </table>
    ${profile.aboutFamily ? `<p style="margin-top: 10px; font-style: italic; color: #666;">${profile.aboutFamily}</p>` : ''}
  </div>

  ${profile.rashi || profile.nakshatra || profile.gotra ? `
  <div class="section">
    <div class="section-title">⭐ Horoscope Details</div>
    <div class="horoscope-box">
      ${profile.rashi ? `<div class="horoscope-item"><div class="horoscope-label">Rashi</div><div class="horoscope-value">${profile.rashi}</div></div>` : ''}
      ${profile.nakshatra ? `<div class="horoscope-item"><div class="horoscope-label">Nakshatra</div><div class="horoscope-value">${profile.nakshatra}</div></div>` : ''}
      ${profile.gotra ? `<div class="horoscope-item"><div class="horoscope-label">Gotra</div><div class="horoscope-value">${profile.gotra}</div></div>` : ''}
      ${profile.manglik ? `<div class="horoscope-item"><div class="horoscope-label">Manglik</div><div class="horoscope-value">${profile.manglik}</div></div>` : ''}
      ${profile.birthTime ? `<div class="horoscope-item"><div class="horoscope-label">Birth Time</div><div class="horoscope-value">${profile.birthTime}</div></div>` : ''}
      ${profile.birthPlace ? `<div class="horoscope-item"><div class="horoscope-label">Birth Place</div><div class="horoscope-value">${profile.birthPlace}</div></div>` : ''}
    </div>
  </div>
  ` : ''}

  ${profile.lifestyleTags && profile.lifestyleTags.length > 0 ? `
  <div class="section">
    <div class="section-title">🏷️ Lifestyle & Interests</div>
    <div class="lifestyle-tags">
      ${profile.lifestyleTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated from Happy Jodi Vibes</p>
    <p style="font-size: 10px; color: #999;">This biodata is for matrimonial purposes only.</p>
  </div>
</body>
</html>
  `;

  // Create and open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(biodataHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

// ============================================================================
// ANTI-SCAM DETECTION SYSTEM
// ============================================================================

type ScamAlertType = 'money_request' | 'external_link' | 'suspicious_phrase' | 'phone_number';

interface ScamDetectionResult {
  isSuspicious: boolean;
  alerts: {
    type: ScamAlertType;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }[];
}

// Scam detection patterns
const SCAM_PATTERNS = {
  moneyRequest: {
    patterns: [
      /\b(send\s*money)\b/i,
      /\b(transfer)\b/i,
      /\b(bank\s*details?)\b/i,
      /\b(upi)\b/i,
      /\b(paytm)\b/i,
      /\b(gpay)\b/i,
      /\b(phonepe)\b/i,
      /\b(account\s*number)\b/i,
      /\b(ifsc)\b/i,
      /\b(wire\s*transfer)\b/i,
      /\b(western\s*union)\b/i,
      /\b(moneygram)\b/i,
      /\b(send\s*rs\.?)\b/i,
      /\b(payment)\b/i,
      /\b(loan)\b/i,
      /\b(advance\s*fee)\b/i,
    ],
    message: 'Money/Financial Request Detected',
    severity: 'high' as const
  },
  externalLink: {
    patterns: [
      /https?:\/\/[^\s]+/i,
      /www\.[^\s]+\.[a-z]{2,}/i,
      /\b\w+\.(com|in|net|org|io|co|edu|gov)\b/i,
    ],
    message: 'External Link Detected',
    severity: 'medium' as const
  },
  suspiciousPhrase: {
    patterns: [
      /\b(urgent)\b/i,
      /\b(emergency)\b/i,
      /\b(immediate)\b/i,
      /\b(investment)\b/i,
      /\b(crypto)\b/i,
      /\b(bitcoin)\b/i,
      /\b(lottery)\b/i,
      /\b(prize)\b/i,
      /\b(winner)\b/i,
      /\b(inherit)\b/i,
      /\b(prince|princess)\b/i,
      /\b(dying\s*wish)\b/i,
      /\b(stranded)\b/i,
      /\b(robbed)\b/i,
      /\b(lost\s*my\s*wallet)\b/i,
      /\b(help\s*me\s*out)\b/i,
    ],
    message: 'Suspicious Language Detected',
    severity: 'medium' as const
  },
  phoneNumber: {
    patterns: [
      /\b\d{10}\b/,
      /\b\d{5}\s*\d{5}\b/,
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\b(\+91|0)?[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    ],
    message: 'Phone Number Detected',
    severity: 'low' as const
  }
};

// Function to detect scam content in a message
function detectScamContent(content: string): ScamDetectionResult {
  const alerts: ScamDetectionResult['alerts'] = [];
  
  // Check for money requests
  if (SCAM_PATTERNS.moneyRequest.patterns.some(p => p.test(content))) {
    alerts.push({
      type: 'money_request',
      message: SCAM_PATTERNS.moneyRequest.message,
      severity: SCAM_PATTERNS.moneyRequest.severity
    });
  }
  
  // Check for external links
  if (SCAM_PATTERNS.externalLink.patterns.some(p => p.test(content))) {
    alerts.push({
      type: 'external_link',
      message: SCAM_PATTERNS.externalLink.message,
      severity: SCAM_PATTERNS.externalLink.severity
    });
  }
  
  // Check for suspicious phrases
  if (SCAM_PATTERNS.suspiciousPhrase.patterns.some(p => p.test(content))) {
    alerts.push({
      type: 'suspicious_phrase',
      message: SCAM_PATTERNS.suspiciousPhrase.message,
      severity: SCAM_PATTERNS.suspiciousPhrase.severity
    });
  }
  
  // Check for phone numbers
  if (SCAM_PATTERNS.phoneNumber.patterns.some(p => p.test(content))) {
    alerts.push({
      type: 'phone_number',
      message: SCAM_PATTERNS.phoneNumber.message,
      severity: SCAM_PATTERNS.phoneNumber.severity
    });
  }
  
  return {
    isSuspicious: alerts.length > 0,
    alerts
  };
}

// Calculate safety score based on conversation history
function calculateSafetyScore(messages: MockMessage[], userId: string): number {
  const userMessages = messages.filter(m => m.senderId === userId);
  if (userMessages.length === 0) return 100;
  
  let score = 100;
  const deductions: number[] = [];
  
  userMessages.forEach(msg => {
    const result = detectScamContent(msg.content);
    result.alerts.forEach(alert => {
      if (alert.severity === 'high') deductions.push(25);
      else if (alert.severity === 'medium') deductions.push(15);
      else deductions.push(5);
    });
  });
  
  // Cap total deductions
  const totalDeductions = Math.min(deductions.reduce((a, b) => a + b, 0), 80);
  return Math.max(score - totalDeductions, 20);
}

// ============================================================================
// AI HELPER FUNCTIONS FOR MATCH INSIGHTS
// ============================================================================

interface AICompatibilityInsight {
  reason: string;
  icon: string;
  type: 'value' | 'lifestyle' | 'career' | 'family' | 'interest';
}

interface AICommonality {
  text: string;
  icon: string;
  highlight: boolean;
}

interface AIMessageDraft {
  message: string;
  tone: 'friendly' | 'thoughtful' | 'playful';
  icon: string;
}

interface AIProfileTip {
  tip: string;
  category: 'bio' | 'photos' | 'preferences' | 'verification';
  impact: 'high' | 'medium' | 'low';
  icon: string;
}

// Generate AI compatibility insights based on profile comparison
function generateAICompatibilityInsights(
  profile: MockProfile, 
  extendedData: ExtendedProfileData,
  myPreferences: typeof ghostPartnerPreferences
): AICompatibilityInsight[] {
  const insights: AICompatibilityInsight[] = [];
  
  // Family values match
  if (extendedData.familyValues === 'Moderate' || extendedData.familyValues === 'Traditional') {
    insights.push({
      reason: "Both of you value traditional family bonds and respect for elders",
      icon: "👨‍👩‍👧‍👦",
      type: 'family'
    });
  }
  
  // Career compatibility
  if (profile.occupation && (profile.annualIncome || 0) >= 1000000) {
    insights.push({
      reason: "Compatible career goals - both are financially independent professionals",
      icon: "💼",
      type: 'career'
    });
  }
  
  // Education match
  if (profile.education && ['MBA', 'B.Tech', 'MBBS', 'CA', 'MS'].includes(profile.education)) {
    insights.push({
      reason: "Strong educational background that aligns with your preferences",
      icon: "🎓",
      type: 'career'
    });
  }
  
  // Lifestyle compatibility
  if (extendedData.diet === 'Vegetarian') {
    insights.push({
      reason: "Share similar dietary preferences - both prefer vegetarian cuisine",
      icon: "🥗",
      type: 'lifestyle'
    });
  }
  
  // Interest/hobby match
  if (extendedData.hobbies && extendedData.hobbies.length > 0) {
    const commonHobbies = ['Reading', 'Traveling', 'Cooking', 'Music', 'Yoga'];
    const hasMatch = extendedData.hobbies.some(h => commonHobbies.includes(h));
    if (hasMatch) {
      insights.push({
        reason: "Common interests in " + extendedData.hobbies.slice(0, 2).join(' & ') + " to bond over",
        icon: "✨",
        type: 'interest'
      });
    }
  }
  
  // Value alignment
  if (extendedData.personalityType) {
    insights.push({
      reason: `${extendedData.personalityType} personality complements your communication style`,
      icon: "🧠",
      type: 'value'
    });
  }
  
  // Location preference match
  if (myPreferences.location && profile.city) {
    insights.push({
      reason: `Located in ${profile.city} - within your preferred location range`,
      icon: "📍",
      type: 'lifestyle'
    });
  }
  
  return insights.slice(0, 5); // Return top 5 insights
}

// Generate AI commonalities between two profiles
function generateAICommonalities(
  profile: MockProfile,
  extendedData: ExtendedProfileData,
  myProfile: typeof ghostUserProfile,
  myExtendedData: ExtendedProfileData
): AICommonality[] {
  const commonalities: AICommonality[] = [];
  
  // Education commonalities
  if (profile.education && myProfile.education) {
    const eduKeywords = ['MBA', 'B.Tech', 'MBBS', 'CA', 'IIT', 'IIM'];
    for (const keyword of eduKeywords) {
      if (profile.education.includes(keyword) && myProfile.education?.includes(keyword)) {
        commonalities.push({
          text: `Both are ${keyword} graduates`,
          icon: "🎓",
          highlight: true
        });
        break;
      }
    }
  }
  
  // Location commonalities
  if (profile.city === myProfile.city) {
    commonalities.push({
      text: `Both live in ${profile.city}`,
      icon: "🏙️",
      highlight: true
    });
  } else if (profile.state === myProfile.state) {
    commonalities.push({
      text: `Both from ${profile.state} state`,
      icon: "🗺️",
      highlight: false
    });
  }
  
  // Religion/Caste match
  if (profile.religion === myProfile.religion) {
    commonalities.push({
      text: `Both share ${profile.religion} faith`,
      icon: "🕉️",
      highlight: false
    });
  }
  
  // Mother tongue
  if (profile.motherTongue === myProfile.motherTongue) {
    commonalities.push({
      text: `Both speak ${profile.motherTongue} as mother tongue`,
      icon: "🗣️",
      highlight: false
    });
  }
  
  // Hobby matches
  if (extendedData.hobbies && myExtendedData.hobbies) {
    const myHobbies = myExtendedData.hobbies || [];
    const commonHobbies = extendedData.hobbies.filter(h => myHobbies.includes(h));
    if (commonHobbies.length > 0) {
      commonalities.push({
        text: `Both enjoy ${commonHobbies[0]}`,
        icon: "✨",
        highlight: true
      });
    }
  }
  
  // Diet preference
  if (extendedData.diet === myExtendedData.diet) {
    commonalities.push({
      text: `Both are ${extendedData.diet.toLowerCase()}`,
      icon: "🥗",
      highlight: false
    });
  }
  
  // Family values
  if (extendedData.familyValues === myExtendedData.familyValues) {
    commonalities.push({
      text: `Both believe in ${extendedData.familyValues.toLowerCase()} family values`,
      icon: "👨‍👩‍👧",
      highlight: false
    });
  }
  
  // Rashi match
  if (extendedData.rashi && myExtendedData.rashi && extendedData.rashi === myExtendedData.rashi) {
    commonalities.push({
      text: `Both have same Rashi (${extendedData.rashi.split(' ')[0]})`,
      icon: "⭐",
      highlight: true
    });
  }
  
  // Professional field
  if (profile.occupation && myProfile.occupation) {
    const occKeywords = ['Engineer', 'Doctor', 'Manager', 'CA', 'Software'];
    for (const keyword of occKeywords) {
      if (profile.occupation.includes(keyword) && myProfile.occupation?.includes(keyword)) {
        commonalities.push({
          text: `Both work as ${keyword}s`,
          icon: "💼",
          highlight: false
        });
        break;
      }
    }
  }
  
  return commonalities.slice(0, 6); // Return top 6
}

// Generate AI message drafts (Wingman feature)
function generateAIMessageDrafts(profile: MockProfile, extendedData: ExtendedProfileData): AIMessageDraft[] {
  const drafts: AIMessageDraft[] = [];
  const firstName = profile.name.split(' ')[0];
  
  // Friendly approach based on occupation
  if (profile.occupation) {
    drafts.push({
      message: `Hi ${firstName}! I noticed you're a ${profile.occupation}. That's really impressive! I'd love to hear about what inspired you to choose this career path.`,
      tone: 'friendly',
      icon: "👋"
    });
  }
  
  // Thoughtful approach based on hobbies
  if (extendedData.hobbies && extendedData.hobbies.length > 0) {
    const hobby = extendedData.hobbies[0];
    drafts.push({
      message: `Hello ${firstName}! I saw that you enjoy ${hobby.toLowerCase()}. It's one of my interests too! What do you love most about it?`,
      tone: 'thoughtful',
      icon: "💭"
    });
  }
  
  // Playful approach based on city
  if (profile.city) {
    drafts.push({
      message: `Hey ${firstName}! How's life in ${profile.city}? I've heard amazing things about the city. Would love to know your favorite hangout spots there! 😊`,
      tone: 'playful',
      icon: "😄"
    });
  }
  
  // Default options if profile is minimal
  if (drafts.length < 3) {
    drafts.push({
      message: `Hi ${firstName}! Your profile caught my attention. I think we might have some things in common. Would you like to chat?`,
      tone: 'friendly',
      icon: "👋"
    });
  }
  
  return drafts;
}

// Calculate profile match-ability score
function calculateMatchabilityScore(profile: typeof ghostUserProfile, extendedData: ExtendedProfileData): {
  score: number;
  tips: AIProfileTip[];
} {
  let score = 50; // Base score
  const tips: AIProfileTip[] = [];
  
  // Bio completeness (up to 20 points)
  if (profile.bio && profile.bio.length > 50) {
    score += 15;
  } else if (profile.bio && profile.bio.length > 20) {
    score += 8;
    tips.push({
      tip: "Expand your bio to share more about your personality and interests",
      category: 'bio',
      impact: 'high',
      icon: "✍️"
    });
  } else {
    tips.push({
      tip: "Add a detailed bio to help others know you better",
      category: 'bio',
      impact: 'high',
      icon: "✍️"
    });
  }
  
  // Photo completeness (up to 15 points)
  if (profile.photo) {
    score += 15;
  } else {
    tips.push({
      tip: "Add a profile photo to increase profile views by 10x",
      category: 'photos',
      impact: 'high',
      icon: "📸"
    });
  }
  
  // Verification badges (up to 15 points)
  const verifications = extendedData.verifications;
  const verifiedCount = Object.values(verifications).filter(Boolean).length;
  score += verifiedCount * 3;
  if (verifiedCount < 3) {
    tips.push({
      tip: "Get more verification badges to build trust with potential matches",
      category: 'verification',
      impact: 'medium',
      icon: "✅"
    });
  }
  
  // Education & Career info (up to 10 points)
  if (profile.education && profile.occupation) {
    score += 10;
  } else {
    tips.push({
      tip: "Complete your education and career details",
      category: 'bio',
      impact: 'medium',
      icon: "🎓"
    });
  }
  
  // Hobbies and interests (up to 5 points)
  if (extendedData.hobbies && extendedData.hobbies.length >= 3) {
    score += 5;
  } else {
    tips.push({
      tip: "Add more hobbies to find better matches with common interests",
      category: 'bio',
      impact: 'low',
      icon: "🎯"
    });
  }
  
  return { score: Math.min(score, 100), tips: tips.slice(0, 4) };
}

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div className={`${montserrat.variable} font-montserrat`}>
          <MatrimonyApp />
          <Toaster />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Page = "home" | "login" | "register" | "dashboard" | "profile" | "search" | "matches" | "interests" | "messages" | "settings" | "profileView" | "support" | "safety" | "faq" | "about" | "careers" | "contact" | "terms" | "privacy" | "cookies" | "verification" | "assisted-matrimony";

// Spotlight Booster Types
interface SpotlightBoost {
  id: string;
  duration: number; // in hours
  price: number;
  startedAt: Date;
  expiresAt: Date;
  viewsGained: number;
  interestsGained: number;
}

interface SpotlightPlan {
  id: string;
  duration: number;
  durationLabel: string;
  price: number;
  popular?: boolean;
}

const spotlightPlans: SpotlightPlan[] = [
  { id: '24h', duration: 24, durationLabel: '24 Hours', price: 99 },
  { id: '48h', duration: 48, durationLabel: '48 Hours', price: 179, popular: true },
  { id: '7d', duration: 168, durationLabel: '7 Days', price: 499 },
];

interface AppState {
  currentPage: Page;
  ghostMode: boolean;
  incognitoMode: boolean;
  photoPrivacyEnabled: boolean;
  interactions: MockInteraction[];
  messages: MockMessage[];
  shortlisted: string[];
  blocked: string[];
  notifications: { id: string; type: string; message: string; read: boolean }[];
  profile: typeof ghostUserProfile;
  preferences: typeof ghostPartnerPreferences;
  activeChat: string | null;
  viewingProfileId: string | null;
  spotlightBoost: SpotlightBoost | null;
  verificationStatus: {
    aadhaar: 'pending' | 'verified';
    linkedin: 'pending' | 'verified';
    selfie: 'pending' | 'verified';
    manual: 'pending' | 'verified';
    digilocker: 'pending' | 'verified';
    liveness: 'pending' | 'verified';
  };
  digilockerData?: {
    education: { degree: string; institution: string; year: string; verified: boolean }[];
    employment: { company: string; designation: string; duration: string; verified: boolean }[];
  };
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

// Loading skeleton shown during hydration
function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF0F5] to-white">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#880E4F] to-[#AD1457] shadow-lg h-14 sm:h-16 animate-pulse" />
      
      {/* Hero Skeleton */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#C2185B]">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-pulse">
          <div className="h-16 w-3/4 mx-auto mb-6 bg-white/30 rounded-2xl" />
          <div className="h-8 w-2/3 mx-auto mb-8 bg-white/20 rounded-xl" />
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <div className="h-6 w-1/2 mx-auto mb-4 bg-rose-100 rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-rose-50 rounded-lg" />)}
            </div>
            <div className="h-14 w-full bg-rose-200 rounded-xl" />
          </div>
        </div>
      </section>
      
      {/* Footer Skeleton */}
      <footer className="bg-gradient-to-b from-[#5D0F3A] to-[#2D0817] h-48 mt-auto animate-pulse" />
    </div>
  );
}

function MatrimonyApp() {
  // All hooks must be called before any early returns (React rules of hooks)
  const { data: session, status } = useSession();
  
  // All state hooks
  const [state, setState] = useState<AppState>({
    currentPage: "home",
    ghostMode: false,
    incognitoMode: false,
    photoPrivacyEnabled: false,
    interactions: [...mockInteractions],
    messages: [...mockMessages],
    shortlisted: [],
    blocked: [],
    notifications: [
      { id: '1', type: 'interest', message: 'Priya Sharma sent you an interest', read: false },
      { id: '2', type: 'match', message: 'You have 5 new matches today!', read: false },
    ],
    profile: { ...ghostUserProfile },
    preferences: { ...ghostPartnerPreferences },
    activeChat: null,
    viewingProfileId: null,
    spotlightBoost: null,
    verificationStatus: {
      aadhaar: 'pending',
      linkedin: 'pending',
      selfie: 'pending',
      manual: 'pending',
      digilocker: 'pending',
      liveness: 'pending',
    },
    digilockerData: undefined,
  });

  // Derived conversations - use computed value instead of effect
  const conversations = useMemo(() => {
    const acceptedInteractions = state.interactions.filter(i => i.status === 'ACCEPTED');
    return acceptedInteractions.map(i => ({
      userId: i.profile.userId,
      profile: i.profile,
      lastMessage: state.messages
        .filter(m => m.senderId === i.profile.userId || m.receiverId === i.profile.userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0],
      unreadCount: state.messages.filter(m => m.senderId === i.profile.userId && !m.isRead).length,
    }));
  }, [state.interactions, state.messages]);

  const isAuthenticated = status === "authenticated" || state.ghostMode;

  const setCurrentPage = (page: Page) => {
    if (isAuthenticated && (page === "login" || page === "register")) {
      setState(prev => ({ ...prev, currentPage: "dashboard" }));
      return;
    }
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const effectivePage = isAuthenticated && (state.currentPage === "login" || state.currentPage === "register")
    ? "dashboard"
    : state.currentPage;

  // Actions
  const sendInterest = useCallback((profile: MockProfile, message?: string) => {
    const newInteraction: MockInteraction = {
      id: `int-${Date.now()}`,
      senderId: 'ghost-user',
      receiverId: profile.userId,
      status: 'PENDING',
      type: 'INTEREST',
      message,
      createdAt: new Date(),
      profile,
    };
    setState(prev => ({
      ...prev,
      interactions: [...prev.interactions, newInteraction],
      notifications: [
        { id: Date.now().toString(), type: 'sent', message: `Interest sent to ${profile.name}`, read: false },
        ...prev.notifications,
      ],
    }));
  }, []);

  const acceptInterest = useCallback((interactionId: string) => {
    setState(prev => ({
      ...prev,
      interactions: prev.interactions.map(i =>
        i.id === interactionId ? { ...i, status: 'ACCEPTED' as const } : i
      ),
      notifications: [
        { id: Date.now().toString(), type: 'accepted', message: 'Interest accepted! You can now chat.', read: false },
        ...prev.notifications,
      ],
    }));
  }, []);

  const declineInterest = useCallback((interactionId: string) => {
    setState(prev => ({
      ...prev,
      interactions: prev.interactions.map(i =>
        i.id === interactionId ? { ...i, status: 'DECLINED' as const } : i
      ),
    }));
  }, []);

  const shortlistProfile = useCallback((profileId: string) => {
    setState(prev => {
      const isShortlisted = prev.shortlisted.includes(profileId);
      return {
        ...prev,
        shortlisted: isShortlisted
          ? prev.shortlisted.filter(id => id !== profileId)
          : [...prev.shortlisted, profileId],
        interactions: isShortlisted
          ? prev.interactions.filter(i => !(i.profile.userId === profileId && i.type === 'SHORTLIST'))
          : [...prev.interactions, {
              id: `shortlist-${Date.now()}`,
              senderId: 'ghost-user',
              receiverId: profileId,
              status: 'SHORTLISTED' as const,
              type: 'SHORTLIST' as const,
              createdAt: new Date(),
              profile: mockProfiles.find(p => p.userId === profileId)!,
            }],
      };
    });
  }, []);

  const blockProfile = useCallback((profileId: string) => {
    setState(prev => ({
      ...prev,
      blocked: prev.blocked.includes(profileId)
        ? prev.blocked.filter(id => id !== profileId)
        : [...prev.blocked, profileId],
    }));
  }, []);

  const viewProfile = useCallback((profileId: string) => {
    setState(prev => ({
      ...prev,
      viewingProfileId: profileId,
      currentPage: 'profileView',
    }));
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'ghost-user',
      receiverId,
      content,
      createdAt: new Date(),
      isRead: true,
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
  }, []);

  const markMessagesRead = useCallback((userId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.senderId === userId ? { ...m, isRead: true } : m
      ),
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<typeof ghostUserProfile>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<typeof ghostPartnerPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const activateSpotlight = useCallback((plan: SpotlightPlan) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration * 60 * 60 * 1000);
    const newBoost: SpotlightBoost = {
      id: `spotlight-${Date.now()}`,
      duration: plan.duration,
      price: plan.price,
      startedAt: now,
      expiresAt,
      viewsGained: 0,
      interestsGained: 0,
    };
    setState(prev => ({
      ...prev,
      spotlightBoost: newBoost,
      notifications: [
        { id: Date.now().toString(), type: 'spotlight', message: `Spotlight activated! Your profile is #1 in search for ${plan.durationLabel}`, read: false },
        ...prev.notifications,
      ],
    }));
  }, []);

  const clearSpotlight = useCallback(() => {
    setState(prev => ({ ...prev, spotlightBoost: null }));
  }, []);

  // Update verification status and set profile as verified if any verification is complete
  const updateVerificationStatus = useCallback((type: 'aadhaar' | 'linkedin' | 'selfie' | 'manual' | 'digilocker' | 'liveness', status: 'pending' | 'verified') => {
    setState(prev => {
      const newVerificationStatus = { ...prev.verificationStatus, [type]: status };
      // Check if at least one verification is complete
      const hasAnyVerification = Object.values(newVerificationStatus).some(s => s === 'verified');
      return {
        ...prev,
        verificationStatus: newVerificationStatus,
        profile: { ...prev.profile, isVerified: hasAnyVerification },
      };
    });
  }, []);

  // Update DigiLocker data
  const updateDigilockerData = useCallback((data: {
    education: { degree: string; institution: string; year: string; verified: boolean }[];
    employment: { company: string; designation: string; duration: string; verified: boolean }[];
  }) => {
    setState(prev => ({ ...prev, digilockerData: data }));
  }, []);

  const renderPage = () => {
    // Public pages (accessible without authentication)
    // Home page - simple direct render to avoid hydration issues
    if (effectivePage === "home") {
      return (
        <main className="min-h-screen bg-[#FFF0F5]">
          <HeroSection onNavigate={setCurrentPage} />
        </main>
      );
    }
    if (effectivePage === "login") return (
      <Suspense fallback={<PageSkeleton />}>
        <LoginPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "register") return (
      <Suspense fallback={<PageSkeleton />}>
        <RegisterPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    
    // Footer pages (publicly accessible)
    if (effectivePage === "support") return (
      <Suspense fallback={<PageSkeleton />}>
        <SupportPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "safety") return (
      <Suspense fallback={<PageSkeleton />}>
        <SafetyTipsPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "faq") return (
      <Suspense fallback={<PageSkeleton />}>
        <FAQPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "about") return (
      <Suspense fallback={<PageSkeleton />}>
        <AboutPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "careers") return (
      <Suspense fallback={<PageSkeleton />}>
        <CareersPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "contact") return (
      <Suspense fallback={<PageSkeleton />}>
        <ContactPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "terms") return (
      <Suspense fallback={<PageSkeleton />}>
        <TermsPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "privacy") return (
      <Suspense fallback={<PageSkeleton />}>
        <PrivacyPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "cookies") return (
      <Suspense fallback={<PageSkeleton />}>
        <CookiesPage onNavigate={setCurrentPage} />
      </Suspense>
    );
    if (effectivePage === "verification") return (
      <Suspense fallback={<ProfileSkeleton />}>
        <VerificationPage
          onNavigate={setCurrentPage}
          verificationStatus={state.verificationStatus}
          updateVerificationStatus={updateVerificationStatus}
          digilockerData={state.digilockerData}
          updateDigilockerData={updateDigilockerData}
        />
      </Suspense>
    );

    if (!isAuthenticated) {
      return (
        <Suspense fallback={<PageSkeleton />}>
          <LoginPage onNavigate={setCurrentPage} />
        </Suspense>
      );
    }

    switch (effectivePage) {
      case "dashboard":
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage
              onNavigate={setCurrentPage}
              profile={state.profile}
              interactions={state.interactions}
              notifications={state.notifications}
              clearNotification={clearNotification}
              getMatches={getMatchesForGhost}
              shortlistProfile={shortlistProfile}
              shortlisted={state.shortlisted}
              viewProfile={viewProfile}
              spotlightBoost={state.spotlightBoost}
              activateSpotlight={activateSpotlight}
              clearSpotlight={clearSpotlight}
              verificationStatus={state.verificationStatus}
            />
          </Suspense>
        );
      case "profile":
        return (
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfilePage
              onNavigate={setCurrentPage}
              profile={state.profile}
              updateProfile={updateProfile}
            />
          </Suspense>
        );
      case "search":
        return (
          <Suspense fallback={<SearchSkeleton />}>
            <SearchPage
              onNavigate={setCurrentPage}
              profiles={mockProfiles}
              sendInterest={sendInterest}
              shortlistProfile={shortlistProfile}
              shortlisted={state.shortlisted}
              blocked={state.blocked}
              blockProfile={blockProfile}
              viewProfile={viewProfile}
            />
          </Suspense>
        );
      case "matches":
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <MatchesPage
              onNavigate={setCurrentPage}
              getMatches={getMatchesForGhost}
              sendInterest={sendInterest}
              shortlistProfile={shortlistProfile}
              shortlisted={state.shortlisted}
              viewProfile={viewProfile}
            />
          </Suspense>
        );
      case "interests":
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <InterestsPage
              onNavigate={setCurrentPage}
              interactions={state.interactions}
              acceptInterest={acceptInterest}
              declineInterest={declineInterest}
              shortlisted={state.shortlisted}
              shortlistProfile={shortlistProfile}
              viewProfile={viewProfile}
              sendInterest={sendInterest}
            />
          </Suspense>
        );
      case "messages":
        return (
          <Suspense fallback={<MessagesSkeleton />}>
            <MessagesPage
              onNavigate={setCurrentPage}
              conversations={conversations}
              messages={state.messages}
              sendMessage={sendMessage}
              markMessagesRead={markMessagesRead}
              activeChat={state.activeChat}
              setActiveChat={(id) => setState(prev => ({ ...prev, activeChat: id }))}
            />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<ProfileSkeleton />}>
            <SettingsPage
              onNavigate={setCurrentPage}
              profile={state.profile}
              preferences={state.preferences}
              updateProfile={updateProfile}
              updatePreferences={updatePreferences}
              incognitoMode={state.incognitoMode}
              setIncognitoMode={(v) => setState(prev => ({ ...prev, incognitoMode: v }))}
              photoPrivacyEnabled={state.photoPrivacyEnabled}
              setPhotoPrivacyEnabled={(v) => setState(prev => ({ ...prev, photoPrivacyEnabled: v }))}
            />
          </Suspense>
        );
      case "profileView":
        const viewingProfile = state.viewingProfileId 
          ? mockProfiles.find(p => p.userId === state.viewingProfileId)
          : null;
        if (!viewingProfile) {
          return (
            <Suspense fallback={<DashboardSkeleton />}>
              <MatchesPage onNavigate={setCurrentPage} viewProfile={viewProfile} />
            </Suspense>
          );
        }
        const matchScore = calculateCompatibility(viewingProfile, state.preferences);
        return (
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileViewPage
              profile={viewingProfile}
              compatibilityScore={matchScore}
              onNavigate={setCurrentPage}
              sendInterest={sendInterest}
              shortlistProfile={shortlistProfile}
              shortlisted={state.shortlisted}
              sentInterests={state.interactions
                .filter(i => i.senderId === 'ghost-user' && i.type === 'INTEREST')
                .map(i => i.profile.userId)}
              myPreferences={state.preferences}
              viewProfile={viewProfile}
            />
          </Suspense>
        );
      default:
        return (
          <main className="min-h-screen bg-[#FFF0F5]">
            <HeroSection onNavigate={setCurrentPage} />
          </main>
        );
    }
  };

  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF0F5] to-white"
      suppressHydrationWarning
    >
      <Header
        currentPage={effectivePage}
        onNavigate={setCurrentPage}
        ghostMode={state.ghostMode}
        setGhostMode={(v) => setState(prev => ({ ...prev, ghostMode: v }))}
        unreadNotifications={unreadNotifications}
        incognitoMode={state.incognitoMode}
      />
      {state.ghostMode && (
        <div className="bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white text-center py-2 text-sm font-medium animate-pulse">
          👻 GHOST MODE ACTIVE - Testing without authentication
        </div>
      )}
      {state.incognitoMode && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
          <EyeOff size={16} /> INCOGNITO MODE ACTIVE - Your profile visits are hidden
        </div>
      )}
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  ghostMode: boolean;
  setGhostMode: (value: boolean) => void;
  unreadNotifications: number;
  incognitoMode?: boolean;
}

function Header({ currentPage, onNavigate, ghostMode, setGhostMode, unreadNotifications, incognitoMode }: HeaderProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = status === "authenticated" || ghostMode;

  const navItems: { label: string; page: Page; icon: React.ElementType }[] = [
    { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
    { label: "Search", page: "search", icon: Search },
    { label: "Matches", page: "matches", icon: Heart },
    { label: "Interests", page: "interests", icon: HeartHandshake },
    { label: "Messages", page: "messages", icon: MessageCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#880E4F] to-[#AD1457] shadow-lg safe-area-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Responsive sizing */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <HeartHandshake size={20} className="text-[#880E4F] fill-[#C2185B] sm:w-6 sm:h-6" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-white hidden xs:block">Happy Jodi Vibes</span>
          </button>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] ${
                    currentPage === item.page
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon size={18} className={currentPage === item.page ? "text-white" : "text-white/70"} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Incognito Mode Indicator */}
            {incognitoMode && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-full text-xs sm:text-sm font-medium shadow-lg ring-2 ring-slate-500/30 animate-pulse min-h-[36px]">
                <EyeOff size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Incognito</span>
              </div>
            )}
            
            {/* Ghost Mode Button - Touch optimized */}
            <button
              onClick={() => setGhostMode(!ghostMode)}
              className={`p-2.5 sm:p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center touch-highlight ${
                ghostMode
                  ? "bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-lg ring-2 ring-[#F8BBD9] animate-pulse"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
              title={ghostMode ? "Disable Ghost Mode" : "Enable Ghost Mode (Admin Testing)"}
            >
              <Ghost size={22} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {unreadNotifications > 0 && (
                  <div className="bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs px-2 py-1 rounded-full animate-bounce flex items-center gap-1 min-h-[32px]">
                    <Bell size={12} />
                    {unreadNotifications}
                  </div>
                )}
                <button
                  onClick={() => onNavigate("profile")}
                  className="hidden sm:flex items-center gap-2 bg-white hover:bg-[#FCE4EC] px-3 lg:px-4 py-2 rounded-full transition-colors shadow-md border border-[#FCE4EC] min-h-[44px]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#880E4F] to-[#C2185B] flex items-center justify-center shadow-sm">
                    {ghostMode ? <Ghost size={16} className="text-white" /> : <User size={16} className="text-white" />}
                  </div>
                  <span className="text-[#880E4F] font-bold text-sm">{ghostMode ? "Ghost User" : "My Profile"}</span>
                </button>
                <button
                  onClick={() => onNavigate("settings")}
                  className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-highlight"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
                {!ghostMode && (
                  <button
                    onClick={() => signOut()}
                    className="hidden md:flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium hover:bg-white/10 px-3 py-2 rounded-lg transition-colors min-h-[44px]"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => onNavigate("login")}
                  className="text-white/90 hover:text-white text-sm font-medium min-h-[44px] px-2 flex items-center"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="bg-white text-[#880E4F] px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FCE4EC] transition-colors flex items-center gap-1.5 sm:gap-2 min-h-[44px]"
                >
                  <UserPlus size={16} />
                  <span className="hidden xs:inline">Register Free</span>
                  <span className="xs:hidden">Join</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger - Touch optimized */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-white hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-highlight"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown - Enhanced with animations and backdrop blur */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden pb-4 animate-mobile-menu">
            <div className="bg-white/10 backdrop-blur-md rounded-xl mt-1 p-2 border border-white/20">
              {navItems.map((item, index) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-lg text-sm font-medium flex items-center gap-3 min-h-[48px] transition-all touch-highlight ${
                    currentPage === item.page
                      ? "bg-white/25 text-white shadow-sm"
                      : "text-white/90 hover:bg-white/15 active:bg-white/20"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentPage === item.page ? "bg-white/20" : "bg-white/10"
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <span>{item.label}</span>
                  {currentPage === item.page && (
                    <ChevronRight size={16} className="ml-auto opacity-70" />
                  )}
                </button>
              ))}
              
              {/* Mobile-only: Profile and Logout options */}
              <div className="mt-2 pt-2 border-t border-white/20">
                <button
                  onClick={() => {
                    onNavigate("profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3.5 rounded-lg text-sm font-medium flex items-center gap-3 min-h-[48px] text-white/90 hover:bg-white/15 transition-all touch-highlight sm:hidden"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                    <User size={18} />
                  </div>
                  <span>My Profile</span>
                </button>
                {!ghostMode && (
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3.5 rounded-lg text-sm font-medium flex items-center gap-3 min-h-[48px] text-white/90 hover:bg-white/15 transition-all touch-highlight md:hidden"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
                      <LogOut size={18} />
                    </div>
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="bg-gradient-to-b from-[#5D0F3A] to-[#2D0817] text-white mt-auto safe-area-bottom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        {/* Mobile: Stack columns, Tablet: 2 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Need Help? */}
          <div>
            <h4 className="font-semibold mb-3 text-sm sm:text-base text-[#F8BBD9]">Need Help?</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#F8BBD9]">
              <li>
                <button 
                  onClick={() => onNavigate("support")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <MessageCircle size={14} className="flex-shrink-0" /> 
                  <span>Customer Support</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("safety")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Shield size={14} className="flex-shrink-0" /> 
                  <span>Safety Tips</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("faq")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Sparkles size={14} className="flex-shrink-0" /> 
                  <span>FAQs</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3 text-sm sm:text-base text-[#F8BBD9]">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#F8BBD9]">
              <li>
                <button 
                  onClick={() => onNavigate("about")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Users size={14} className="flex-shrink-0" /> 
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("careers")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Briefcase size={14} className="flex-shrink-0" /> 
                  <span>Careers</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("contact")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Mail size={14} className="flex-shrink-0" /> 
                  <span>Contact</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Privacy */}
          <div>
            <h4 className="font-semibold mb-3 text-sm sm:text-base text-[#F8BBD9]">Privacy</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#F8BBD9]">
              <li>
                <button 
                  onClick={() => onNavigate("terms")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Lock size={14} className="flex-shrink-0" /> 
                  <span>Terms of Use</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("privacy")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Shield size={14} className="flex-shrink-0" /> 
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("cookies")} 
                  className="hover:text-white flex items-center gap-2 text-left min-h-[44px] py-2 w-full touch-highlight"
                >
                  <Settings size={14} className="flex-shrink-0" /> 
                  <span>Cookie Policy</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-3 text-sm sm:text-base text-[#F8BBD9]">Connect</h4>
            <p className="text-xs sm:text-sm text-[#F8BBD9] flex items-center gap-2 mb-3">
              <Mail size={14} className="flex-shrink-0" /> 
              <span className="break-all">support@happyjodivibes.com</span>
            </p>
            {/* Social icons - touch optimized with min 44px */}
            <div className="flex gap-2 sm:gap-3">
              <button 
                className="w-11 h-11 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-md touch-highlight"
                aria-label="Facebook"
              >
                <Facebook size={18} className="text-white" />
              </button>
              <button 
                className="w-11 h-11 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-md touch-highlight"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white" />
              </button>
              <button 
                className="w-11 h-11 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-md touch-highlight"
                aria-label="Twitter"
              >
                <Twitter size={18} className="text-white" />
              </button>
              <button 
                className="w-11 h-11 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-md touch-highlight"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-[#880E4F] mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-[#EC407A] flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <span>© 2024 Happy Jodi Vibes. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            Made with 
            <Heart size={14} className="text-[#C2185B] fill-[#C2185B] sm:w-4 sm:h-4" />
          </span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// HOME PAGE
// ============================================================================

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [searchForm, setSearchForm] = useState({
    profileFor: "",
    gender: "",
    age: "",
    city: "",
    religion: "",
    motherTongue: "",
  });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Success stories for carousel
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

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % successStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [successStories.length]);

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
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#C2185B]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#880E4F]/30 via-[#AD1457]/20 to-transparent"></div>
          
          {/* Floating animated elements - using predefined values to avoid hydration mismatch */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating hearts with predefined positions */}
            {[
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
            ].map((heart, i) => (
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
                <Heart 
                  size={heart.size} 
                  className="text-[#880E4F] fill-[#880E4F]/30" 
                />
              </div>
            ))}
            
            {/* Floating circles with predefined positions */}
            {[
              { left: '5%', top: '10%', size: 60, delay: 0 },
              { left: '20%', top: '40%', size: 80, delay: 0.7 },
              { left: '35%', top: '75%', size: 50, delay: 1.4 },
              { left: '50%', top: '20%', size: 70, delay: 2.1 },
              { left: '65%', top: '60%', size: 55, delay: 2.8 },
              { left: '80%', top: '35%', size: 75, delay: 3.5 },
              { left: '95%', top: '70%', size: 65, delay: 4.2 },
              { left: '45%', top: '90%', size: 45, delay: 4.9 },
            ].map((circle, i) => (
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

          {/* Quick Search / Register Widget - Enhanced Prominence */}
          <div className="relative max-w-5xl mx-auto animate-fade-in-up animation-delay-200">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-3xl blur-sm opacity-40"></div>
            
            <div className="relative bg-white/98 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-5 md:p-6 lg:p-8 border-2 border-[#FCE4EC]">
              {/* Enhanced Header */}
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

                {/* Register Button - Enhanced */}
                <button
                  onClick={() => onNavigate("register")}
                  className="relative w-full sm:w-auto group bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm whitespace-nowrap overflow-hidden min-h-[44px]"
                >
                  {/* Shine effect */}
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

          {/* Trust Indicators - Enhanced with Visual Badges */}
          <div className="mt-8 sm:mt-10 md:mt-14 lg:mt-16 flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 animate-fade-in-up animation-delay-300 relative">
            {/* SVG Gradient Definition */}
            <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
              <defs>
                <linearGradient id="maroonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#880E4F" />
                  <stop offset="50%" stopColor="#AD1457" />
                  <stop offset="100%" stopColor="#C2185B" />
                </linearGradient>
              </defs>
            </svg>
            {[
              { icon: BadgeCheck, value: "5M+", label: "Verified Profiles", gradient: "from-[#880E4F] to-[#C2185B]" },
              { icon: Heart, value: "2M+", label: "Successful Matches", gradient: "from-[#AD1457] to-[#EC407A]" },
              { icon: Award, value: "15+", label: "Years of Service", gradient: "from-[#C2185B] to-[#F06292]" },
            ].map((badge, i) => (
              <div
                key={i}
                className="relative group"
              >
                {/* Glow effect on hover */}
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
            {[
              { value: "5M+", label: "Profiles", icon: Users },
              { value: "2M+", label: "Matches", icon: Heart },
              { value: "98%", label: "Success", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="relative group">
                {/* Glowing hover effect */}
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

      {/* Features Section */}
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
            {[
              { step: "1", icon: Edit3, title: "Create Profile", desc: "Sign up and create your detailed profile in minutes. Add photos, preferences, and more." },
              { step: "2", icon: Search, title: "Find Matches", desc: "Search and get AI-powered personalized matches based on your preferences." },
              { step: "3", icon: HeartHandshake, title: "Connect", desc: "Send interests, chat with matches, and find your perfect life partner." },
            ].map((feature, i) => (
              <div key={i} className="relative group">
                {/* Glowing hover effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-[1.5rem] sm:rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative p-5 sm:p-6 md:p-7 lg:p-8 bg-white rounded-[1.5rem] sm:rounded-[2rem] border-[0.5px] border-[#F8BBD9]/50 hover:border-[#C2185B]/30 hover:shadow-[0_20px_60px_-15px_rgba(136,14,79,0.3)] transition-all duration-500 text-center group-hover:-translate-y-1">
                  {/* Step Pill - Combined */}
                  <div className="flex justify-center mb-4 sm:mb-5">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-lg">
                      <span className="font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider">Step {feature.step}</span>
                    </div>
                  </div>
                  {/* Icon Container */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 bg-[#FCE4EC] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon size={28} className="sm:size-8 md:size-9 lg:size-8" style={{ stroke: 'url(#maroonGradient)' }} />
                  </div>
                  {/* Title - Centered */}
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#4A0E25] mb-1.5 sm:mb-2">{feature.title}</h3>
                  {/* Description - Centered */}
                  <p className="text-xs sm:text-sm md:text-base text-[#5D0F3A]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Enhanced */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-[#FFF0F5] to-white relative">
        {/* SVG Gradient Definition */}
        <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
          <defs>
            <linearGradient id="maroonGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#880E4F" />
              <stop offset="50%" stopColor="#AD1457" />
              <stop offset="100%" stopColor="#C2185B" />
            </linearGradient>
          </defs>
        </svg>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16">
            <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Why Choose Us
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Trusted by Millions</h2>
            <p className="text-sm sm:text-base md:text-lg text-[#5D0F3A]">Features that make us India&apos;s favorite matrimony platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {[
              { icon: BadgeCheck, title: "Verified Profiles", desc: "100% verified profiles with ID & photo verification" },
              { icon: Lock, title: "100% Privacy", desc: "End-to-end encryption for all your data" },
              { icon: Sparkles, title: "AI Matching", desc: "Smart compatibility algorithm for best matches" },
              { icon: Crown, title: "Premium Quality", desc: "High-quality profiles from educated professionals" },
              { icon: MessageCircle, title: "Instant Chat", desc: "Real-time messaging with accepted matches" },
              { icon: Filter, title: "Smart Filters", desc: "Advanced search by caste, education, location" },
            ].map((badge, i) => (
              <div key={i} className="relative group">
                {/* Glowing hover effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-xl sm:rounded-2xl border-[0.5px] border-[#F8BBD9]/50 p-3 sm:p-4 md:p-5 lg:p-6 hover:border-[#C2185B]/30 hover:shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] transition-all duration-500 hover:-translate-y-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-[#FCE4EC] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <badge.icon size={20} className="sm:size-5 md:size-6" style={{ stroke: 'url(#maroonGradient2)' }} />
                  </div>
                  <h3 className="font-bold text-[#4A0E25] mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">{badge.title}</h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-[#5D0F3A]">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Carousel */}
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

                  {/* Photo placeholder with enhanced styling */}
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

                  {/* Couple Names - Enhanced typography */}
                  <h3 className="font-bold text-[#4A0E25] text-center text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2 tracking-wide">
                    {story.names}
                  </h3>
                  
                  {/* Location & Marriage Date */}
                  <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 mb-3 sm:mb-4 md:mb-5 px-1 sm:px-2">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[#C2185B] text-xs sm:text-sm whitespace-nowrap">
                      <MapPin size={12} className="text-[#AD1457] flex-shrink-0 sm:size-3.5" />
                      <span className="font-medium">{story.location}</span>
                    </div>
                    <span className="text-[#F8BBD9] text-sm sm:text-lg">•</span>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[#880E4F] text-xs sm:text-sm whitespace-nowrap">
                      <Heart size={10} className="text-[#AD1457] fill-[#AD1457] flex-shrink-0 sm:size-3" />
                      <span className="font-medium">{story.married}</span>
                    </div>
                  </div>
                  
                  {/* Story Quote - Enhanced styling */}
                  <div className="relative bg-gradient-to-br from-[#FFF0F5] to-[#FCE4EC]/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 pt-4 sm:pt-5 md:pt-6 border border-[#FCE4EC] mb-3 sm:mb-4 md:mb-5">
                    {/* Opening quote mark */}
                    <span className="absolute -top-0.5 sm:-top-1 left-3 sm:left-4 text-lg sm:text-xl md:text-2xl text-[#C2185B] font-serif">"</span>
                    <p className="text-xs sm:text-sm md:text-base text-[#5D0F3A] italic leading-relaxed text-center">
                      {story.story}
                    </p>
                    {/* Closing quote mark */}
                    <span className="absolute -bottom-0.5 sm:-bottom-1 right-3 sm:right-4 text-lg sm:text-xl md:text-2xl text-[#C2185B] font-serif">"</span>
                  </div>

                  {/* Star Rating - Enhanced */}
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star 
                        key={j} 
                        size={12} className="text-amber-400 fill-amber-400 drop-shadow-sm group-hover:scale-110 transition-transform duration-200 sm:size-4 md:size-4" 
                        style={{ transitionDelay: `${j * 50}ms` }}
                      />
                    ))}
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-[#5D0F3A] font-medium">5.0</span>
                  </div>
                </div>

                {/* Card Bottom Decoration */}
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 lg:px-8 lg:pb-6">
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

      {/* How It Works / Features Section */}
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
            {/* Card 1: Share Your Story */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Edit3 size={22} className="text-white sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Share Your Story</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  Share your goals, interests, values and your vision of love with honesty. Real connections happen only when you show up as your real self.
                </p>
              </div>
            </div>

            {/* Card 2: Match with Intention */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#AD1457] to-[#C2185B] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Target size={22} className="text-white sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Match with Intention</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  Forget endless scrolling and swiping. Connect with people who match your vibe, align with your goals and values.
                </p>
              </div>
            </div>

            {/* Card 3: Match on Your Terms */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#C2185B] to-[#EC407A] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Sliders size={22} className="text-white sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Match on Your Terms</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  Your Match, Your Choice. Fine-tune your preferences to meet someone who shares your lifestyle, values and commitment goals.
                </p>
              </div>
            </div>

            {/* Card 4: Meaningful Chats */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#EC407A] to-[#F48FB1] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <MessagesSquare size={22} className="text-white sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Meaningful Chats That Count</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  No more aimless chats. Talk about your dreams, goals and your five-year plans and make a connection that feels real.
                </p>
              </div>
            </div>

            {/* Card 5: Smart Matchmaking */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#FCE4EC] hover:shadow-xl hover:border-[#F8BBD9] transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles size={22} className="text-white sm:size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#4A0E25] mb-2 sm:mb-3">Smart Matchmaking</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  A blend of AI and Human. Our algorithm learns your preferences while our dating experts provide personalized tips.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-r from-[#5D0F3A] via-[#880E4F] to-[#C2185B] relative overflow-hidden">
        {/* Decorative elements - predefined positions to avoid hydration mismatch */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
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
          ].map((heart, i) => (
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
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Ready to Find Your Soulmate?</h2>
          <p className="text-sm sm:text-base md:text-lg text-[#FFE4E1] mb-6 sm:mb-8 px-2">Register now and start your journey to finding the perfect life partner</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => onNavigate("register")}
              className="bg-white text-[#880E4F] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg hover:bg-[#FCE4EC] transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <UserPlus size={18} className="sm:size-5" />
              Register Free
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="border-2 border-white text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <LogOut size={18} className="rotate-180 sm:size-5" />
              Login
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================================
// LOGIN PAGE
// ============================================================================

function LoginPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    if (phone.length >= 10) {
      setShowOtpModal(true);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6 && /^\d$/.test(digit)) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(digits.length - 1, 5);
      otpInputRefs.current[lastIndex]?.focus();
    } else if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      // Mock OTP verification - in real app would call API
      setShowOtpModal(false);
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#FCE4EC]">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <Heart size={32} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#4A0E25] mt-2">Welcome Back</h1>
            <p className="text-[#5D0F3A]">Sign in to continue your search</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6 bg-[#FFF0F5] p-1 rounded-xl">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'email' 
                  ? 'bg-white text-[#880E4F] shadow-md' 
                  : 'text-[#5D0F3A] hover:text-[#880E4F]'
              }`}
            >
              <Mail size={16} />
              Email
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'phone' 
                  ? 'bg-white text-[#880E4F] shadow-md' 
                  : 'text-[#5D0F3A] hover:text-[#880E4F]'
              }`}
            >
              <Phone size={16} />
              Phone
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A0E25] mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A0E25] mb-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 pr-12 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent text-sm md:text-base min-h-[48px]"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#5D0F3A] hover:text-[#880E4F] transition-colors touch-target"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#5D0F3A] cursor-pointer">
                  <input type="checkbox" className="rounded border-[#F8BBD9] text-[#C2185B] focus:ring-[#EC407A] w-4 h-4" />
                  Remember me
                </label>
                <button type="button" className="text-[#C2185B] hover:underline font-medium">Forgot Password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 touch-target"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogOut size={18} className="rotate-180" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A0E25] mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D0F3A] text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full p-3 pl-12 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your phone number"
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhoneLogin}
                disabled={phone.length < 10}
                className="w-full bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 touch-target"
              >
                <Phone size={18} />
                Send OTP
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-[#5D0F3A]">
              Don&apos;t have an account?{" "}
              <button onClick={() => onNavigate("register")} className="text-[#C2185B] font-semibold hover:underline flex items-center gap-1 inline-flex">
                <UserPlus size={16} />
                Register Free
              </button>
            </p>
          </div>

          <div className="mt-6 border-t border-[#FCE4EC] pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F8BBD9]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#5D0F3A]">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="py-3 px-4 border border-[#F8BBD9] rounded-xl text-[#4A0E25] hover:bg-[#FCE4EC] flex items-center justify-center gap-2 transition-all hover:shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="py-3 px-4 border border-[#F8BBD9] rounded-xl text-[#4A0E25] hover:bg-[#FCE4EC] flex items-center justify-center gap-2 transition-all hover:shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>

            <button className="mt-3 w-full py-3 px-4 border border-[#F8BBD9] rounded-xl text-[#4A0E25] hover:bg-[#FCE4EC] flex items-center justify-center gap-2 transition-all hover:shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-xl flex items-center justify-center shadow-lg mb-3">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#4A0E25]">Verify OTP</h2>
              <p className="text-sm text-[#5D0F3A] mt-1">
                We&apos;ve sent a 6-digit code to +91 {phone}
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-xl font-bold border border-[#F8BBD9] rounded-xl focus:ring-2 focus:ring-[#EC407A] focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otp.join('').length !== 6}
              className="w-full py-3 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-xl font-semibold hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg touch-target"
            >
              Verify OTP
            </button>

            <p className="text-center text-sm text-[#5D0F3A] mt-4">
              Didn&apos;t receive OTP?{' '}
              <button className="text-[#C2185B] font-semibold hover:underline">Resend</button>
            </p>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-3 py-2 text-[#5D0F3A] hover:text-[#880E4F] transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// REGISTER PAGE - Enhanced 5-Step Wizard
// ============================================================================

function RegisterPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [step, setStep] = useState(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profileFor: "",
    // OTP
    otp: "",
    otpDigits: ['', '', '', '', '', ''],
    // Step 2: Personal Details
    name: "",
    gender: "",
    dateOfBirth: "",
    height: "",
    maritalStatus: "",
    religion: "",
    motherTongue: "",
    caste: "",
    // Step 3: Education/Career
    education: "",
    college: "",
    occupation: "",
    company: "",
    annualIncome: "",
    workingWith: "",
    // Step 4: Family Details
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    familyType: "",
    familyStatus: "",
    siblings: "",
    siblingDetails: "",
    familyLocation: "",
    familyValues: "",
    // Step 5: Preferences
    country: "India",
    state: "",
    city: "",
    bio: "",
    partnerMinAge: "",
    partnerMaxAge: "",
    partnerReligion: "",
    partnerCity: "",
    partnerEducation: "",
    partnerOccupation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("123456");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const totalSteps = 5;

  const stepLabels = [
    { label: "Basic Info", icon: Lock, description: "Account details" },
    { label: "Personal", icon: User, description: "About you" },
    { label: "Career", icon: Briefcase, description: "Education & Work" },
    { label: "Family", icon: Users, description: "Family details" },
    { label: "Preferences", icon: Heart, description: "Partner & Photos" },
  ];

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      if (data.devOtp) setDevOtp(data.devOtp);
      setShowOtpModal(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      const newOtp = [...formData.otpDigits];
      digits.forEach((digit, i) => {
        if (i < 6 && /^\d$/.test(digit)) {
          newOtp[i] = digit;
        }
      });
      setFormData({ ...formData, otpDigits: newOtp, otp: newOtp.join('') });
      const lastIndex = Math.min(digits.length - 1, 5);
      otpInputRefs.current[lastIndex]?.focus();
    } else if (/^\d*$/.test(value)) {
      const newOtp = [...formData.otpDigits];
      newOtp[index] = value;
      setFormData({ ...formData, otpDigits: newOtp, otp: newOtp.join('') });
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formData.otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          purpose: "EMAIL_VERIFICATION",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      setShowOtpModal(false);
      setStep(2); // Move to Personal Details step
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedPhotos(prev => [...prev, ...newPhotos].slice(0, 6));
      if (newPhotos.length > 0 && !photoPreview) {
        setPhotoPreview(newPhotos[0]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    if (photoPreview === uploadedPhotos[index]) {
      setPhotoPreview(uploadedPhotos[0] || null);
    }
  };

  const handleCreateProfile = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          height: parseInt(formData.height),
          maritalStatus: formData.maritalStatus,
          religion: formData.religion,
          motherTongue: formData.motherTongue,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          bio: formData.bio,
          education: formData.education,
          occupation: formData.occupation,
          annualIncome: parseInt(formData.annualIncome) || undefined,
        }),
      });

      if (res.ok) {
        onNavigate("dashboard");
      } else {
        setError("Failed to create profile");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Validation for each step
  const canProceedStep1 = formData.email && formData.password && formData.password === formData.confirmPassword && formData.password.length >= 8;
  const canProceedStep2 = formData.name && formData.gender && formData.dateOfBirth && formData.height && formData.maritalStatus && formData.religion && formData.motherTongue;
  const canProceedStep3 = formData.education || formData.occupation;
  const canProceedStep4 = formData.familyType;
  const canProceedStep5 = uploadedPhotos.length > 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#FCE4EC]">
          {/* Enhanced Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {stepLabels.map((s, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step > i + 1
                          ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg"
                          : step === i + 1
                            ? "bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-lg ring-4 ring-[#FCE4EC]"
                            : "bg-[#FCE4EC] text-[#5D0F3A]"
                      }`}
                    >
                      {step > i + 1 ? <Check size={18} /> : <s.icon size={18} />}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block ${step >= i + 1 ? 'text-[#880E4F] font-medium' : 'text-[#5D0F3A]'}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#880E4F]/60 hidden md:block">{s.description}</span>
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step > i + 1 ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B]" : "bg-[#FCE4EC]"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[#5D0F3A]">Step {step} of {totalSteps}</span>
              <span className="text-xs text-[#C2185B] font-medium">{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#4A0E25]">
              {step === 1 && "Create Your Account"}
              {step === 2 && "Personal Details"}
              {step === 3 && "Education & Career"}
              {step === 4 && "Family Details"}
              {step === 5 && "Partner Preferences & Photos"}
            </h1>
            <p className="text-sm sm:text-base text-[#5D0F3A] mt-1">
              {step === 1 && "Enter your basic details to get started"}
              {step === 2 && "Tell us about yourself"}
              {step === 3 && "Share your educational and professional background"}
              {step === 4 && "Help matches know your family background"}
              {step === 5 && "Set your preferences and add photos"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Step 1 - Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Profile Created For *</label>
                  <select
                    value={formData.profileFor}
                    onChange={(e) => setFormData({ ...formData, profileFor: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="self">Myself</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="friend">Friend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Email *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-3 pl-10 pr-12 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent min-h-[48px]"
                      placeholder="Min 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#5D0F3A] hover:text-[#880E4F] transition-colors touch-target"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full p-3 pl-10 pr-12 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent min-h-[48px]"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#5D0F3A] hover:text-[#880E4F] transition-colors touch-target"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Social Registration */}
              <div className="pt-4 border-t border-[#FCE4EC]">
                <p className="text-center text-sm text-[#5D0F3A] mb-3">Or sign up with</p>
                <div className="flex gap-3 justify-center">
                  <button className="flex-1 max-w-[160px] py-3 px-4 border border-[#F8BBD9] rounded-xl text-[#4A0E25] hover:bg-[#FCE4EC] flex items-center justify-center gap-2 transition-all hover:shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button className="flex-1 max-w-[160px] py-3 px-4 border border-[#F8BBD9] rounded-xl text-[#4A0E25] hover:bg-[#FCE4EC] flex items-center justify-center gap-2 transition-all hover:shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || !canProceedStep1}
                className="w-full bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 touch-target"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Continue <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2 - Personal Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Full Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Date of Birth *</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Height (cm) *</label>
                  <div className="relative">
                    <Ruler size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="e.g., 165"
                      min="100"
                      max="250"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Marital Status *</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    <option value="NEVER_MARRIED">Never Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Religion *</label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Mother Tongue *</label>
                  <select
                    value={formData.motherTongue}
                    onChange={(e) => setFormData({ ...formData, motherTongue: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Caste</label>
                  <input
                    type="text"
                    value={formData.caste}
                    onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., Brahmin, Rajput"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl font-medium hover:bg-[#FCE4EC] transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 touch-target"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Education & Career */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Highest Education *</label>
                  <div className="relative">
                    <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor's">Bachelor&apos;s Degree</option>
                      <option value="Master's">Master&apos;s Degree</option>
                      <option value="PhD">PhD/Doctorate</option>
                      <option value="Professional">Professional Degree</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">College/University</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., IIT Delhi, Delhi University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Occupation *</label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <select
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Software Professional">Software Professional</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Teacher">Teacher/Professor</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Government Employee">Government Employee</option>
                      <option value="Private Employee">Private Employee</option>
                      <option value="Self Employed">Self Employed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Company/Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., Google, TCS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Working With</label>
                  <select
                    value={formData.workingWith}
                    onChange={(e) => setFormData({ ...formData, workingWith: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Private Company">Private Company</option>
                    <option value="Government">Government</option>
                    <option value="Business">Business</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Not Working">Not Working</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Annual Income (₹)</label>
                  <div className="relative">
                    <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <select
                      value={formData.annualIncome}
                      onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="below-3">Below ₹3 Lakh</option>
                      <option value="3-5">₹3-5 Lakh</option>
                      <option value="5-10">₹5-10 Lakh</option>
                      <option value="10-20">₹10-20 Lakh</option>
                      <option value="20-50">₹20-50 Lakh</option>
                      <option value="above-50">Above ₹50 Lakh</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl font-medium hover:bg-[#FCE4EC] transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg flex items-center justify-center gap-2 touch-target"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 - Family Details */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Father&apos;s Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="Father's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Father&apos;s Occupation</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., Retired, Business"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Mother&apos;s Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="Mother's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Mother&apos;s Occupation</label>
                  <input
                    type="text"
                    value={formData.motherOccupation}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., Homemaker, Teacher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Family Type *</label>
                  <select
                    value={formData.familyType}
                    onChange={(e) => setFormData({ ...formData, familyType: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="JOINT">Joint Family</option>
                    <option value="NUCLEAR">Nuclear Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Family Status</label>
                  <select
                    value={formData.familyStatus}
                    onChange={(e) => setFormData({ ...formData, familyStatus: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="MIDDLE_CLASS">Middle Class</option>
                    <option value="UPPER_MIDDLE">Upper Middle Class</option>
                    <option value="RICH">Rich / Affluent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Number of Siblings</label>
                  <select
                    value={formData.siblings}
                    onChange={(e) => setFormData({ ...formData, siblings: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="0">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4 or more</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Sibling Details</label>
                  <input
                    type="text"
                    value={formData.siblingDetails}
                    onChange={(e) => setFormData({ ...formData, siblingDetails: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., 1 Brother (Married)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Family Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="text"
                      value={formData.familyLocation}
                      onChange={(e) => setFormData({ ...formData, familyLocation: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="e.g., Mumbai, Maharashtra"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Family Values</label>
                  <select
                    value={formData.familyValues}
                    onChange={(e) => setFormData({ ...formData, familyValues: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="TRADITIONAL">Traditional</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LIBERAL">Liberal</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl font-medium hover:bg-[#FCE4EC] transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!canProceedStep4}
                  className="flex-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 touch-target"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5 - Partner Preferences & Photos */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Photo Upload Section with Camera Preview */}
              <div>
                <label className="block text-sm font-medium text-[#4A0E25] mb-3">
                  <Camera size={16} className="inline mr-2 text-[#C2185B]" />
                  Add Your Photos (up to 6)
                </label>
                
                <div className="flex gap-4 items-start">
                  {/* Main Photo Preview */}
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-[#F8BBD9] flex items-center justify-center bg-[#FFF0F5] overflow-hidden flex-shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-[#C2185B]/50" />
                    )}
                  </div>
                  
                  {/* Upload Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-[#C2185B] bg-[#FCE4EC]' 
                        : 'border-[#F8BBD9] hover:border-[#C2185B] hover:bg-[#FFF0F5]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                    />
                    <Upload size={24} className="mx-auto text-[#C2185B] mb-2" />
                    <p className="text-sm text-[#5D0F3A]">
                      Drag & drop or <span className="text-[#C2185B] font-medium">browse</span>
                    </p>
                    <p className="text-xs text-[#5D0F3A] mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* Photo Grid Preview */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-6 gap-2 mt-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-[#C2185B] transition-all"
                          onClick={() => setPhotoPreview(photo)}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#880E4F] text-white text-[8px] py-0.5 text-center rounded-b-lg">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    placeholder="e.g., Mumbai"
                  />
                </div>
              </div>

              {/* Partner Preferences */}
              <div>
                <label className="block text-sm font-medium text-[#4A0E25] mb-3">
                  <Heart size={16} className="inline mr-2 text-[#C2185B]" />
                  Partner Preferences
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#5D0F3A] mb-1">Age Range</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={formData.partnerMinAge}
                        onChange={(e) => setFormData({ ...formData, partnerMinAge: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-sm"
                        placeholder="Min"
                      />
                      <span className="text-[#5D0F3A]">to</span>
                      <input
                        type="number"
                        value={formData.partnerMaxAge}
                        onChange={(e) => setFormData({ ...formData, partnerMaxAge: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#5D0F3A] mb-1">Preferred Religion</label>
                    <select
                      value={formData.partnerReligion}
                      onChange={(e) => setFormData({ ...formData, partnerReligion: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-sm"
                    >
                      <option value="">Any</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#5D0F3A] mb-1">Preferred Education</label>
                    <select
                      value={formData.partnerEducation}
                      onChange={(e) => setFormData({ ...formData, partnerEducation: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-sm"
                    >
                      <option value="">Any</option>
                      <option value="Bachelor's">Bachelor&apos;s or higher</option>
                      <option value="Master's">Master&apos;s or higher</option>
                      <option value="Professional">Professional Degree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#5D0F3A] mb-1">Preferred Occupation</label>
                    <select
                      value={formData.partnerOccupation}
                      onChange={(e) => setFormData({ ...formData, partnerOccupation: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-sm"
                    >
                      <option value="">Any</option>
                      <option value="Software Professional">Software Professional</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Government Employee">Government Employee</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#5D0F3A] mb-1">Preferred City</label>
                    <input
                      type="text"
                      value={formData.partnerCity}
                      onChange={(e) => setFormData({ ...formData, partnerCity: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-sm"
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                    />
                  </div>
                </div>
              </div>

              {/* About Yourself */}
              <div>
                <label className="block text-sm font-medium text-[#4A0E25] mb-1">About Yourself</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                  rows={3}
                  placeholder="Tell potential matches about yourself..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl font-medium hover:bg-[#FCE4EC] transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 touch-target"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-[#5D0F3A] text-sm">
              Already have an account?{" "}
              <button onClick={() => onNavigate("login")} className="text-[#C2185B] font-semibold hover:underline">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-xl flex items-center justify-center shadow-lg mb-3">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#4A0E25]">Verify Your Email</h2>
              <p className="text-sm text-[#5D0F3A] mt-1">
                We&apos;ve sent a 6-digit code to
              </p>
              <p className="text-sm font-medium text-[#880E4F]">{formData.email}</p>
            </div>

            {/* Dev Mode OTP Display */}
            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 text-sm flex items-center gap-2 mb-4">
                <Info size={16} />
                <span>Dev Mode - Your OTP: <span className="font-mono font-bold">{devOtp}</span></span>
              </div>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {formData.otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-xl font-bold border border-[#F8BBD9] rounded-xl focus:ring-2 focus:ring-[#EC407A] focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || formData.otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-xl font-semibold hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all disabled:opacity-50 shadow-lg touch-target flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check size={18} /> Verify & Continue
                </>
              )}
            </button>

            <p className="text-center text-sm text-[#5D0F3A] mt-4">
              Didn&apos;t receive OTP?{' '}
              <button className="text-[#C2185B] font-semibold hover:underline">Resend</button>
            </p>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-3 py-2 text-[#5D0F3A] hover:text-[#880E4F] transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

function DashboardPage({
  onNavigate, profile, interactions, notifications, clearNotification,
  getMatches, shortlistProfile, shortlisted, viewProfile,
  spotlightBoost, activateSpotlight, clearSpotlight, verificationStatus
}: {
  onNavigate: (page: Page) => void;
  profile: typeof ghostUserProfile;
  interactions: MockInteraction[];
  notifications: { id: string; type: string; message: string; read: boolean }[];
  clearNotification: (id: string) => void;
  getMatches: () => (MockProfile & { compatibilityScore: number })[];
  shortlistProfile: (id: string) => void;
  shortlisted: string[];
  viewProfile: (id: string) => void;
  spotlightBoost: SpotlightBoost | null;
  activateSpotlight: (plan: SpotlightPlan) => void;
  clearSpotlight: () => void;
  verificationStatus: {
    aadhaar: 'pending' | 'verified';
    linkedin: 'pending' | 'verified';
    selfie: 'pending' | 'verified';
    manual: 'pending' | 'verified';
  };
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'visitors'>('overview');
  const [showSpotlightModal, setShowSpotlightModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const matchesCarouselRef = useRef<HTMLDivElement>(null);

  const pendingInterests = interactions.filter(i => i.status === 'PENDING' && i.senderId !== 'ghost-user');
  const acceptedInterests = interactions.filter(i => i.status === 'ACCEPTED');
  const sentInterests = interactions.filter(i => i.senderId === 'ghost-user' && i.type === 'INTEREST');

  // Get top matches for daily recommendations
  const dailyMatches = useMemo(() => {
    return getMatches().slice(0, 10);
  }, [getMatches]);

  // Recent visitors mock data
  const recentVisitors = useMemo(() => {
    return mockProfiles
      .filter(p => p.gender !== profile.gender)
      .slice(0, 6)
      .map(p => ({
        ...p,
        visitedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }))
      .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime());
  }, [profile.gender]);

  // Scroll carousel
  const scrollMatches = (direction: 'left' | 'right') => {
    if (matchesCarouselRef.current) {
      const scrollAmount = 280;
      matchesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Countdown timer for active spotlight
  useEffect(() => {
    if (!spotlightBoost) {
      setTimeRemaining('');
      return;
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = spotlightBoost.expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearSpotlight();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h remaining`);
      } else {
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [spotlightBoost, clearSpotlight]);

  // Profile completion steps with actionable items
  const completionSteps = [
    { label: 'Basic Info', done: true, percent: 25 },
    { label: 'Add Photos', done: profile.profileCompletion >= 50, percent: 20, action: '+20%', actionText: 'Add your photos' },
    { label: 'Education & Career', done: profile.education !== undefined, percent: 15, action: '+15%', actionText: 'Add education details' },
    { label: 'Partner Preferences', done: true, percent: 15 },
    { label: 'Complete Bio', done: false, percent: 10, action: '+10%', actionText: 'Write about yourself' },
    { label: 'Add Family Details', done: false, percent: 10, action: '+10%', actionText: 'Add family info' },
    { label: 'Verify Profile', done: false, percent: 5, action: '+5%', actionText: 'Get verified' },
  ];

  const incompleteSteps = completionSteps.filter(s => !s.done);
  const totalPercent = completionSteps.reduce((acc, s) => s.done ? acc + s.percent : acc, 0);

  // Calculate verification progress
  const verifiedCount = Object.values(verificationStatus).filter(s => s === 'verified').length;
  const isProfileVerified = verifiedCount > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Verification Status Strip */}
      <div className={`mb-4 rounded-xl p-3 border shadow-sm ${
        isProfileVerified
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
              isProfileVerified
                ? 'bg-gradient-to-br from-green-600 to-emerald-500'
                : 'bg-gradient-to-br from-amber-500 to-orange-500'
            }`}>
              {isProfileVerified ? (
                <ShieldCheck size={20} className="text-white" />
              ) : (
                <AlertCircle size={20} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#4A0E25]">
                {isProfileVerified ? 'Profile Verified' : 'Profile Verification Pending'}
              </p>
              <p className="text-xs text-[#5D0F3A]">
                {isProfileVerified
                  ? `${verifiedCount} of 4 verifications completed • Verified profiles get 3x more responses`
                  : 'Complete verification to unlock chat features and get 3x more responses'}
              </p>
            </div>
          </div>
          {isProfileVerified ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">
                <Check size={12} className="mr-1" /> Verified
              </Badge>
              <button
                onClick={() => onNavigate('verification')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 text-sm font-medium hover:bg-green-100 transition-all"
              >
                <ShieldCheck size={14} />
                <span className="hidden sm:inline">Manage</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('verification')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-md transition-all"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Verify Now</span>
              <span className="sm:hidden">Verify</span>
            </button>
          )}
        </div>
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.name[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#4A0E25] flex items-center gap-2 flex-wrap">
              Welcome back, {session?.user?.name?.split(' ')[0] || profile.name.split(' ')[0]}!
              {spotlightBoost && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm animate-pulse">
                  <Zap size={12} />
                  Spotlight Active
                </span>
              )}
            </h1>
            <p className="text-sm text-[#5D0F3A]">Here&apos;s your matchmaking dashboard</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={() => onNavigate("search")}
            className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white px-4 md:px-6 py-2.5 rounded-xl font-semibold hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg flex items-center gap-2 text-sm"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            onClick={() => onNavigate("matches")}
            className="border border-[#F8BBD9] text-[#880E4F] px-4 md:px-6 py-2.5 rounded-xl font-semibold hover:bg-[#FCE4EC] transition-all flex items-center gap-2 text-sm"
          >
            <Heart size={18} />
            <span className="hidden sm:inline">Matches</span>
          </button>
        </div>
      </div>

      {/* Premium Upgrade Banner */}
      {profile.isPremium && (
        <div className="mb-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/10 rounded-full translate-y-1/2"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Crown size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Premium Member</h3>
                <p className="text-white/80 text-sm">Enjoy unlimited features & priority support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white/20 px-4 py-2 rounded-full">
              <Sparkles size={16} />
              Valid until Dec 2025
            </div>
          </div>
        </div>
      )}

      {!profile.isPremium && (
        <div className="mb-6 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/10 rounded-full translate-y-1/2"></div>
          <div className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center ring-2 ring-white/30">
                  <Crown size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    Upgrade to Premium
                    <Sparkles size={18} className="animate-pulse" />
                  </h3>
                  <p className="text-white/80 text-sm">Unlock all features and find your perfect match faster</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="bg-white text-[#880E4F] px-6 py-3 rounded-xl font-bold hover:bg-[#FCE4EC] transition-all flex items-center gap-2 text-sm shadow-lg"
              >
                <Zap size={18} />
                Upgrade Now
              </button>
            </div>
            {/* Benefits Preview */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Eye, text: 'See all profile visitors' },
                { icon: MessageCircle, text: 'Unlimited messaging' },
                { icon: Filter, text: 'Advanced filters' },
                { icon: TrendingUp, text: 'Priority in search' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <benefit.icon size={16} className="text-white/90 flex-shrink-0" />
                  <span className="text-xs text-white/90">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spotlight / Profile Booster Section */}
      {spotlightBoost ? (
        // Active Booster Status
        <div className="mb-6 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
          {/* Animated spotlight effect */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center ring-2 ring-white/30 animate-pulse shadow-lg">
                  <Zap size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                      <Zap size={12} />
                      ACTIVE
                    </span>
                    Spotlight Mode
                  </h3>
                  <p className="text-white/90 text-sm font-medium">Your profile is #1 in search results!</p>
                </div>
              </div>
              
              {/* Countdown Timer */}
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-white/70 mb-1">Time Remaining</p>
                  <p className="text-2xl font-mono font-bold text-amber-300">{timeRemaining}</p>
                </div>
              </div>
            </div>
            
            {/* Stats gained during boost */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <Eye size={16} className="text-white/90" />
                <div>
                  <p className="text-lg font-bold">+{spotlightBoost.viewsGained || 47}</p>
                  <p className="text-xs text-white/70">Views Gained</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <Heart size={16} className="text-white/90" />
                <div>
                  <p className="text-lg font-bold">+{spotlightBoost.interestsGained || 8}</p>
                  <p className="text-xs text-white/70">Interests Gained</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-white/90" />
                <div>
                  <p className="text-lg font-bold">#1</p>
                  <p className="text-xs text-white/70">Search Rank</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <Sparkles size={16} className="text-white/90" />
                <div>
                  <p className="text-lg font-bold">3x</p>
                  <p className="text-xs text-white/70">More Visibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Spotlight Promotional Banner
        <div className="mb-6 bg-gradient-to-br from-[#FCE4EC] via-[#FFF0F5] to-white rounded-2xl p-4 md:p-6 border-2 border-[#F8BBD9] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#880E4F]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#F8BBD9]/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-200">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#4A0E25] flex items-center gap-2">
                    Spotlight
                    <span className="text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-0.5 rounded-full font-semibold">NEW</span>
                  </h3>
                  <p className="text-[#880E4F] text-sm font-medium">Get #1 Spot in Search Results</p>
                </div>
              </div>
              <button
                onClick={() => setShowSpotlightModal(true)}
                className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white px-5 py-2.5 rounded-xl font-semibold hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all flex items-center gap-2 text-sm shadow-lg"
              >
                <Zap size={18} />
                Boost Now
              </button>
            </div>
            
            {/* Plan Cards */}
            <div className="grid grid-cols-3 gap-3">
              {spotlightPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative bg-white rounded-xl p-3 border-2 transition-all cursor-pointer hover:shadow-md ${
                    plan.popular 
                      ? 'border-[#C2185B] shadow-md' 
                      : 'border-[#F8BBD9] hover:border-[#C2185B]'
                  }`}
                  onClick={() => {
                    setShowSpotlightModal(true);
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      BEST VALUE
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-[#5D0F3A] mb-1">{plan.durationLabel}</p>
                    <p className="text-xl font-bold text-[#880E4F]">₹{plan.price}</p>
                    {plan.popular && (
                      <p className="text-[10px] text-green-600 font-medium mt-1">Save ₹19</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-[#5D0F3A] mt-3 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              Boost your profile visibility 3x and appear at the top of search results!
            </p>
          </div>
        </div>
      )}

      {/* Spotlight Modal */}
      {showSpotlightModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap size={22} className="text-amber-300" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Spotlight Your Profile</h2>
                    <p className="text-white/80 text-sm">Choose your boost duration</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSpotlightModal(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-5">
              <div className="space-y-3 mb-5">
                {spotlightPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      activateSpotlight(plan);
                      setShowSpotlightModal(false);
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      plan.popular
                        ? 'border-[#C2185B] bg-gradient-to-r from-[#FCE4EC] to-white'
                        : 'border-[#F8BBD9] hover:border-[#C2185B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#4A0E25]">{plan.durationLabel}</p>
                          {plan.popular && (
                            <span className="text-[10px] bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white px-2 py-0.5 rounded-full font-semibold">RECOMMENDED</span>
                          )}
                        </div>
                        <p className="text-sm text-[#5D0F3A]">
                          {plan.duration === 24 && 'Perfect for quick visibility boost'}
                          {plan.duration === 48 && 'Best value for serious seekers'}
                          {plan.duration === 168 && 'Maximum exposure for best results'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#880E4F]">₹{plan.price}</p>
                        {plan.popular && (
                          <p className="text-xs text-green-600 font-medium">Save ₹19</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Benefits */}
              <div className="bg-[#FFF0F5] rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-[#4A0E25] mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  What you get:
                </h4>
                <ul className="space-y-2 text-sm text-[#5D0F3A]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    #1 position in all relevant searches
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    3x more profile views
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Special Spotlight badge on your profile
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Priority in match recommendations
                  </li>
                </ul>
              </div>
              
              <p className="text-xs text-center text-[#5D0F3A]">
                Secure payment via UPI, Card, or Net Banking
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Widget - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Profile Completion Card - Enhanced with Actionable Items */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#FCE4EC]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#4A0E25]">Profile Completion</h3>
            <span className="text-xs font-bold text-[#880E4F] bg-[#FCE4EC] px-2 py-1 rounded-full">{totalPercent}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#FCE4EC] rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] transition-all duration-500"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
          {/* Actionable Items */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {incompleteSteps.length > 0 ? (
              incompleteSteps.slice(0, 4).map((step, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate('profile')}
                  className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#FFF0F5] hover:bg-[#FCE4EC] transition-colors group min-h-[44px] touch-manipulation"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F8BBD9] flex items-center justify-center group-hover:bg-[#C2185B] transition-colors">
                      <Plus size={12} className="text-[#880E4F] group-hover:text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-[#4A0E25] font-medium">{step.actionText}</span>
                  </div>
                  <span className="text-xs font-bold text-[#C2185B] bg-white px-2 py-0.5 sm:py-1 rounded-full">{step.action}</span>
                </button>
              ))
            ) : (
              <div className="flex items-center gap-2 text-green-600 py-2">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium">Profile complete!</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="w-full mt-3 text-sm text-[#C2185B] font-medium hover:underline flex items-center justify-center gap-1 min-h-[44px] touch-manipulation"
          >
            Complete Profile <ArrowRight size={14} />
          </button>
        </div>

        {/* Activity Snapshot - Enhanced */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#FCE4EC]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#4A0E25] flex items-center gap-2">
              <TrendingUp size={16} className="text-[#C2185B]" />
              Activity Snapshot
            </h3>
            <button 
              onClick={() => setActiveTab('activity')}
              className="text-xs text-[#C2185B] hover:underline min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { label: 'Profile Views', value: 24, subtext: '+12 today', icon: Eye, color: 'from-[#880E4F] to-[#AD1457]' },
              { label: 'Interests Received', value: pendingInterests.length, subtext: 'new', icon: Heart, color: 'from-[#AD1457] to-[#C2185B]' },
              { label: 'Interests Sent', value: sentInterests.length, subtext: 'pending', icon: Send, color: 'from-[#C2185B] to-[#EC407A]' },
              { label: 'Visitors', value: recentVisitors.length, subtext: 'this week', icon: User, color: 'from-[#880E4F] to-[#C2185B]' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-[#FFF0F5] hover:bg-[#FCE4EC] transition-colors cursor-pointer min-h-[52px] sm:min-h-[56px] touch-manipulation">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <item.icon size={14} className="text-white sm:hidden" />
                  <item.icon size={16} className="text-white hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold text-[#4A0E25]">{item.value}</p>
                  <p className="text-[10px] sm:text-xs text-[#5D0F3A] truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Quick Activity Stats */}
          <div className="mt-3 pt-3 border-t border-[#FCE4EC] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#5D0F3A]">
              <Clock size={12} />
              <span>Last active: 2h ago</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={12} />
              <span>+18% this week</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#FCE4EC]">
          <h3 className="text-sm font-medium text-[#5D0F3A] mb-3">Quick Stats</h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { label: 'Profile Views This Week', value: 45, change: '+12%', positive: true },
              { label: 'Interests Accepted', value: acceptedInterests.length, change: '+2', positive: true },
              { label: 'Pending Requests', value: sentInterests.filter(i => i.status === 'PENDING').length, change: '0', positive: true },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between py-1 sm:py-0">
                <span className="text-xs sm:text-sm text-[#5D0F3A] truncate pr-2">{stat.label}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-[#4A0E25]">{stat.value}</span>
                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${stat.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'activity' as const, label: 'Activity', icon: TrendingUp },
          { id: 'visitors' as const, label: 'Visitors', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap min-h-[44px] touch-manipulation ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-md'
                : 'bg-white border border-[#F8BBD9] text-[#5D0F3A] hover:bg-[#FCE4EC]'
            }`}
          >
            <tab.icon size={16} className="sm:hidden" />
            <tab.icon size={18} className="hidden sm:block" />
            <span className="text-sm sm:text-base">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Daily Match Recommendations */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#4A0E25] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#C2185B] sm:hidden" />
                  <Sparkles size={20} className="text-[#C2185B] hidden sm:block" />
                  Daily Recommendations
                </h2>
                <p className="text-xs sm:text-sm text-[#5D0F3A]">AI-powered matches based on your preferences</p>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => scrollMatches('left')}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  <ChevronLeft size={16} className="text-[#880E4F] sm:hidden" />
                  <ChevronLeft size={18} className="text-[#880E4F] hidden sm:block" />
                </button>
                <button
                  onClick={() => scrollMatches('right')}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  <ChevronRight size={16} className="text-[#880E4F] sm:hidden" />
                  <ChevronRight size={18} className="text-[#880E4F] hidden sm:block" />
                </button>
              </div>
            </div>
            
            <div 
              ref={matchesCarouselRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {dailyMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex-shrink-0 w-56 sm:w-64 bg-white rounded-2xl shadow-sm border border-[#FCE4EC] overflow-hidden hover:shadow-lg transition-all cursor-pointer group snap-start"
                  onClick={() => viewProfile(match.userId)}
                >
                  <div className="relative h-32 sm:h-40 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <User size={24} className="text-rose-400 sm:hidden" />
                        <User size={32} className="text-rose-400 hidden sm:block" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1 rounded-full shadow-md flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        match.compatibilityScore >= 85 ? 'bg-emerald-500' :
                        match.compatibilityScore >= 70 ? 'bg-sky-500' :
                        match.compatibilityScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      {match.compatibilityScore}%
                    </div>
                    {match.isPremium && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-1 sm:p-1.5 rounded-full shadow-md">
                        <Crown size={10} className="sm:hidden" />
                        <Crown size={12} className="hidden sm:block" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{match.name}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">{match.age} yrs • {match.city}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                      <span className="bg-rose-50 text-rose-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{match.religion}</span>
                      <span className="bg-sky-50 text-sky-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs">{match.motherTongue}</span>
                    </div>
                    {/* Skip and Like Buttons */}
                    <div className="mt-2 sm:mt-3 flex gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          // Skip action - just visual feedback
                        }}
                        className="flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 min-h-[36px] sm:min-h-[40px] touch-manipulation"
                      >
                        <X size={14} className="sm:hidden" />
                        <X size={16} className="hidden sm:block" /> Skip
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          shortlistProfile(match.userId); 
                        }}
                        className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 min-h-[36px] sm:min-h-[40px] touch-manipulation ${
                          shortlisted.includes(match.userId)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] shadow-md'
                        }`}
                      >
                        {shortlisted.includes(match.userId) ? (
                          <>
                            <Check size={14} className="sm:hidden" />
                            <Check size={16} className="hidden sm:block" /> Liked
                          </>
                        ) : (
                          <>
                            <Heart size={14} className="sm:hidden" />
                            <Heart size={16} className="hidden sm:block" /> Like
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Interests */}
          {pendingInterests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#FCE4EC] overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-[#FCE4EC] flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-bold text-[#4A0E25] flex items-center gap-2">
                  <HeartHandshake size={18} className="text-[#C2185B] sm:hidden" />
                  <HeartHandshake size={20} className="text-[#C2185B] hidden sm:block" />
                  <span className="hidden sm:inline">Recent Interests Received</span>
                  <span className="sm:hidden">Interests</span>
                  <span className="bg-[#C2185B] text-white text-xs px-2 py-0.5 rounded-full">{pendingInterests.length}</span>
                </h2>
                <button
                  onClick={() => onNavigate("interests")}
                  className="text-sm text-[#C2185B] hover:underline flex items-center gap-1 font-medium min-h-[44px] min-w-[44px] justify-center touch-manipulation"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-[#FFE4E1]">
                {pendingInterests.slice(0, 3).map((interest) => (
                  <div key={interest.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-md flex-shrink-0">
                        {interest.profile.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-[#4A0E25] truncate">{interest.profile.name}</h3>
                          {interest.profile.isVerified && <BadgeCheck size={14} className="text-green-500 sm:hidden" />}
                          {interest.profile.isVerified && <BadgeCheck size={16} className="text-green-500 hidden sm:block" />}
                        </div>
                        <p className="text-xs sm:text-sm text-[#5D0F3A] truncate">
                          {interest.profile.age} yrs • {interest.profile.city} • {interest.profile.education}
                        </p>
                        {interest.message && (
                          <p className="text-xs sm:text-sm text-[#C2185B] italic mt-1 line-clamp-1">&quot;{interest.message}&quot;</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0 ml-15 sm:ml-0">
                      <button
                        onClick={() => onNavigate("interests")}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-xl text-xs sm:text-sm font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-md flex items-center justify-center gap-1 min-h-[40px] sm:min-h-[44px] touch-manipulation"
                      >
                        <Check size={14} className="sm:hidden" />
                        <Check size={16} className="hidden sm:block" /> Accept
                      </button>
                      <button
                        onClick={() => onNavigate("interests")}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl text-xs sm:text-sm font-medium hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1 min-h-[40px] sm:min-h-[44px] touch-manipulation"
                      >
                        <X size={14} className="sm:hidden" />
                        <X size={16} className="hidden sm:block" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#FCE4EC]">
            <h3 className="font-bold text-[#4A0E25] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { icon: Eye, text: 'Your profile was viewed by 5 people today', time: '2 hours ago', color: 'from-blue-500 to-indigo-500' },
                { icon: Heart, text: 'Rahul Verma sent you an interest', time: '5 hours ago', color: 'from-rose-500 to-pink-500' },
                { icon: MessageCircle, text: 'New message from Imran Ahmed', time: '1 day ago', color: 'from-emerald-500 to-teal-500' },
                { icon: Star, text: 'You shortlisted Priya Sharma', time: '2 days ago', color: 'from-amber-500 to-yellow-500' },
                { icon: HeartHandshake, text: 'Your interest was accepted by Arjun Reddy', time: '3 days ago', color: 'from-purple-500 to-violet-500' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <activity.icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#4A0E25]">{activity.text}</p>
                    <p className="text-xs text-[#5D0F3A] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visitors' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#FCE4EC] overflow-hidden">
          <div className="p-4 border-b border-[#FCE4EC]">
            <h3 className="font-bold text-[#4A0E25] flex items-center gap-2">
              <Eye size={20} className="text-[#C2185B]" />
              Recent Profile Visitors
            </h3>
          </div>
          <div className="divide-y divide-[#FFE4E1]">
            {recentVisitors.map((visitor) => (
              <div 
                key={visitor.userId} 
                className="p-4 flex items-center gap-4 hover:bg-[#FFF0F5] cursor-pointer transition-colors"
                onClick={() => viewProfile(visitor.userId)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {visitor.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[#4A0E25]">{visitor.name}</h3>
                    {visitor.isPremium && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                    {visitor.isVerified && <BadgeCheck size={14} className="text-green-500" />}
                  </div>
                  <p className="text-sm text-[#5D0F3A]">{visitor.age} yrs • {visitor.city}</p>
                </div>
                <div className="text-xs text-[#5D0F3A]">
                  {visitor.visitedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gradient-to-r from-[#FFF0F5] to-white border-t border-[#FCE4EC]">
            <p className="text-sm text-center text-[#5D0F3A]">
              <Crown size={14} className="inline text-amber-500 mr-1" />
              Upgrade to Premium to see all visitors
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Continue in next message...

// ============================================================================
// SEARCH PAGE - Enhanced with Faceted Sidebar
// ============================================================================

// Accordion Filter Component
function AccordionFilter({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-[#FCE4EC] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#FFF0F5] transition-colors min-h-[52px] touch-target"
      >
        <span className="flex items-center gap-2 font-medium text-[#4A0E25]">
          <Icon size={18} className="text-[#C2185B]" />
          {title}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-[#5D0F3A] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

const ghostFilters = {
  gender: "",
  minAge: "",
  maxAge: "",
  religion: "",
  city: "",
  motherTongue: "",
  education: "",
  occupation: "",
  minHeight: "",
  maxHeight: "",
  maritalStatus: "",
  caste: "",
  minIncome: "",
};

// Sidebar Filter Content Component
function FilterSidebarContent({ 
  filters, 
  setFilters, 
  activeFilterCount, 
  clearFilters,
}: {
  filters: typeof ghostFilters;
  setFilters: React.Dispatch<React.SetStateAction<typeof ghostFilters>>;
  activeFilterCount: number;
  clearFilters: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#FCE4EC] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#FCE4EC] flex items-center justify-between">
        <h3 className="font-bold text-[#4A0E25] flex items-center gap-2">
          <Filter size={18} className="text-[#C2185B]" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-[#C2185B] text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-[#C2185B] hover:underline min-h-[44px] min-w-[44px] flex items-center justify-center touch-target">
            Clear All
          </button>
        )}
      </div>

      {/* Accordion Filters */}
      <div className="space-y-1">
        {/* Gender */}
        <AccordionFilter title="Gender" icon={User} defaultOpen={true}>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, gender: filters.gender === 'MALE' ? '' : 'MALE' })}
              className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px] touch-target ${
                filters.gender === 'MALE' 
                  ? 'bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white' 
                  : 'bg-[#FCE4EC] text-[#4A0E25] hover:bg-[#F8BBD9]'
              }`}
            >
              Groom
            </button>
            <button
              onClick={() => setFilters({ ...filters, gender: filters.gender === 'FEMALE' ? '' : 'FEMALE' })}
              className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all min-h-[44px] touch-target ${
                filters.gender === 'FEMALE' 
                  ? 'bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white' 
                  : 'bg-[#FCE4EC] text-[#4A0E25] hover:bg-[#F8BBD9]'
              }`}
            >
              Bride
            </button>
          </div>
        </AccordionFilter>

        {/* Age */}
        <AccordionFilter title="Age Range" icon={Calendar} defaultOpen={true}>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={filters.minAge}
              onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
              min="18"
            />
            <span className="text-[#5D0F3A]">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAge}
              onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
              min="18"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['21-25', '26-30', '31-35', '36-40'].map((range) => {
              const [min, max] = range.split('-');
              const isActive = filters.minAge === min && filters.maxAge === max;
              return (
                <button
                  key={range}
                  onClick={() => setFilters({ 
                    ...filters, 
                    minAge: isActive ? '' : min, 
                    maxAge: isActive ? '' : max 
                  })}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all min-h-[36px] touch-target ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white' 
                      : 'bg-[#FCE4EC] text-[#4A0E25] hover:bg-[#F8BBD9]'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </AccordionFilter>

        {/* Height */}
        <AccordionFilter title="Height" icon={Ruler}>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min (cm)"
              value={filters.minHeight}
              onChange={(e) => setFilters({ ...filters, minHeight: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
              min="120"
              max="220"
            />
            <span className="text-[#5D0F3A]">to</span>
            <input
              type="number"
              placeholder="Max (cm)"
              value={filters.maxHeight}
              onChange={(e) => setFilters({ ...filters, maxHeight: e.target.value })}
              className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
              min="120"
              max="220"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['150-160', '160-170', '170-180', '180+'].map((range) => {
              const isPlus = range.includes('+');
              const [min, max] = range.replace('+', '').split('-');
              const isActive = isPlus 
                ? filters.minHeight === min
                : filters.minHeight === min && filters.maxHeight === max;
              return (
                <button
                  key={range}
                  onClick={() => setFilters({ 
                    ...filters, 
                    minHeight: isActive ? '' : min, 
                    maxHeight: isActive || isPlus ? '' : max 
                  })}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all min-h-[36px] touch-target ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white' 
                      : 'bg-[#FCE4EC] text-[#4A0E25] hover:bg-[#F8BBD9]'
                  }`}
                >
                  {range} cm
                </button>
              );
            })}
          </div>
        </AccordionFilter>

        {/* Education */}
        <AccordionFilter title="Education" icon={GraduationCap}>
          <select
            value={filters.education}
            onChange={(e) => setFilters({ ...filters, education: e.target.value })}
            className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
          >
            <option value="">All Education</option>
            <option value="B.Tech">B.Tech / B.E.</option>
            <option value="M.Tech">M.Tech / M.E.</option>
            <option value="MBA">MBA</option>
            <option value="MBBS">MBBS / MD</option>
            <option value="BBA">BBA</option>
            <option value="B.Com">B.Com</option>
            <option value="B.Sc">B.Sc</option>
            <option value="M.Sc">M.Sc</option>
            <option value="CA">CA / CS</option>
            <option value="LLB">LLB / LLM</option>
            <option value="PhD">PhD</option>
            <option value="Diploma">Diploma</option>
          </select>
        </AccordionFilter>

        {/* Occupation */}
        <AccordionFilter title="Occupation" icon={Briefcase}>
          <select
            value={filters.occupation}
            onChange={(e) => setFilters({ ...filters, occupation: e.target.value })}
            className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
          >
            <option value="">All Occupations</option>
            <option value="Software">Software Professional</option>
            <option value="Doctor">Doctor</option>
            <option value="Engineer">Engineer</option>
            <option value="Manager">Manager</option>
            <option value="Business">Business Owner</option>
            <option value="Teacher">Teacher / Professor</option>
            <option value="CA">Chartered Accountant</option>
            <option value="Lawyer">Lawyer</option>
            <option value="Government">Government Employee</option>
            <option value="Banking">Banking Professional</option>
            <option value="Architect">Architect</option>
            <option value="Designer">Designer</option>
          </select>
        </AccordionFilter>

        {/* Religion */}
        <AccordionFilter title="Religion" icon={Sparkles}>
          <div className="space-y-1">
            {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'].map((rel) => (
              <label key={rel} className="flex items-center gap-2 p-3 rounded-lg hover:bg-[#FCE4EC] cursor-pointer min-h-[44px] touch-target">
                <input
                  type="radio"
                  name="religion"
                  checked={filters.religion === rel}
                  onChange={() => setFilters({ ...filters, religion: filters.religion === rel ? '' : rel })}
                  className="accent-[#C2185B]"
                />
                <span className="text-sm text-[#4A0E25]">{rel}</span>
              </label>
            ))}
          </div>
        </AccordionFilter>

        {/* City */}
        <AccordionFilter title="City" icon={MapPin}>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="w-full p-3 rounded-lg border border-[#F8BBD9] text-sm min-h-[44px]"
          >
            <option value="">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </AccordionFilter>

        {/* Mother Tongue */}
        <AccordionFilter title="Mother Tongue" icon={Globe}>
          <div className="space-y-1 max-h-32 overflow-y-auto sidebar-scrollbar">
            {['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Malayalam', 'Urdu'].map((lang) => (
              <label key={lang} className="flex items-center gap-2 p-3 rounded-lg hover:bg-[#FCE4EC] cursor-pointer min-h-[44px] touch-target">
                <input
                  type="radio"
                  name="motherTongue"
                  checked={filters.motherTongue === lang}
                  onChange={() => setFilters({ ...filters, motherTongue: filters.motherTongue === lang ? '' : lang })}
                  className="accent-[#C2185B]"
                />
                <span className="text-sm text-[#4A0E25]">{lang}</span>
              </label>
            ))}
          </div>
        </AccordionFilter>

        {/* Marital Status */}
        <AccordionFilter title="Marital Status" icon={Heart}>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'NEVER_MARRIED', label: 'Never Married' },
              { value: 'DIVORCED', label: 'Divorced' },
              { value: 'WIDOWED', label: 'Widowed' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilters({ ...filters, maritalStatus: filters.maritalStatus === status.value ? '' : status.value })}
                className={`px-4 py-2.5 rounded-full text-xs font-medium transition-all min-h-[40px] touch-target ${
                  filters.maritalStatus === status.value 
                    ? 'bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white' 
                    : 'bg-[#FCE4EC] text-[#4A0E25] hover:bg-[#F8BBD9]'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </AccordionFilter>

        {/* Income */}
        <AccordionFilter title="Annual Income" icon={IndianRupee}>
          <div className="space-y-1">
            {[
              { value: '5', label: '₹5 LPA+' },
              { value: '10', label: '₹10 LPA+' },
              { value: '15', label: '₹15 LPA+' },
              { value: '20', label: '₹20 LPA+' },
              { value: '30', label: '₹30 LPA+' },
            ].map((income) => (
              <label key={income.value} className="flex items-center gap-2 p-3 rounded-lg hover:bg-[#FCE4EC] cursor-pointer min-h-[44px] touch-target">
                <input
                  type="radio"
                  name="minIncome"
                  checked={filters.minIncome === income.value}
                  onChange={() => setFilters({ ...filters, minIncome: filters.minIncome === income.value ? '' : income.value })}
                  className="accent-[#C2185B]"
                />
                <span className="text-sm text-[#4A0E25]">{income.label}</span>
              </label>
            ))}
          </div>
        </AccordionFilter>
      </div>
    </div>
  );
}

function SearchPage({
  onNavigate,
  profiles,
  sendInterest,
  shortlistProfile,
  shortlisted,
  blocked,
  blockProfile,
  viewProfile,
}: {
  onNavigate: (page: Page) => void;
  profiles: MockProfile[];
  sendInterest: (profile: MockProfile, message?: string) => void;
  shortlistProfile: (id: string) => void;
  shortlisted: string[];
  blocked: string[];
  blockProfile: (id: string) => void;
  viewProfile: (id: string) => void;
}) {
  const [filters, setFilters] = useState(ghostFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProfile, setSelectedProfile] = useState<MockProfile | null>(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [sentInterests, setSentInterests] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Use useMemo for filtered results
  const results = useMemo(() => {
    let filtered = [...profiles];
    
    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }
    if (filters.minAge) {
      filtered = filtered.filter(p => p.age >= parseInt(filters.minAge));
    }
    if (filters.maxAge) {
      filtered = filtered.filter(p => p.age <= parseInt(filters.maxAge));
    }
    if (filters.religion) {
      filtered = filtered.filter(p => p.religion === filters.religion);
    }
    if (filters.city) {
      filtered = filtered.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.motherTongue) {
      filtered = filtered.filter(p => p.motherTongue === filters.motherTongue);
    }
    if (filters.education) {
      filtered = filtered.filter(p => p.education && p.education.toLowerCase().includes(filters.education.toLowerCase()));
    }
    if (filters.occupation) {
      filtered = filtered.filter(p => p.occupation && p.occupation.toLowerCase().includes(filters.occupation.toLowerCase()));
    }
    if (filters.minHeight) {
      filtered = filtered.filter(p => p.height >= parseInt(filters.minHeight));
    }
    if (filters.maxHeight) {
      filtered = filtered.filter(p => p.height <= parseInt(filters.maxHeight));
    }
    if (filters.maritalStatus) {
      filtered = filtered.filter(p => p.maritalStatus === filters.maritalStatus);
    }
    if (filters.caste) {
      filtered = filtered.filter(p => p.caste && p.caste.toLowerCase().includes(filters.caste.toLowerCase()));
    }
    if (filters.minIncome) {
      filtered = filtered.filter(p => (p.annualIncome || 0) >= parseInt(filters.minIncome) * 100000);
    }
    
    return filtered.filter(p => !blocked.includes(p.userId));
  }, [filters, blocked, profiles]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== '').length;
  }, [filters]);
  
  // Get active filters as array for chips display
  const activeFiltersArray = useMemo(() => {
    const active: { key: string; label: string; value: string }[] = [];
    if (filters.gender) active.push({ key: 'gender', label: 'Gender', value: filters.gender === 'MALE' ? 'Groom' : 'Bride' });
    if (filters.minAge || filters.maxAge) active.push({ key: 'age', label: 'Age', value: `${filters.minAge || '18'}-${filters.maxAge || '60'}` });
    if (filters.minHeight || filters.maxHeight) active.push({ key: 'height', label: 'Height', value: `${filters.minHeight || '120'}-${filters.maxHeight || '220'} cm` });
    if (filters.religion) active.push({ key: 'religion', label: 'Religion', value: filters.religion });
    if (filters.city) active.push({ key: 'city', label: 'City', value: filters.city });
    if (filters.motherTongue) active.push({ key: 'motherTongue', label: 'Mother Tongue', value: filters.motherTongue });
    if (filters.education) active.push({ key: 'education', label: 'Education', value: filters.education });
    if (filters.occupation) active.push({ key: 'occupation', label: 'Occupation', value: filters.occupation });
    if (filters.maritalStatus) active.push({ key: 'maritalStatus', label: 'Marital Status', value: filters.maritalStatus === 'NEVER_MARRIED' ? 'Never Married' : filters.maritalStatus === 'DIVORCED' ? 'Divorced' : 'Widowed' });
    if (filters.caste) active.push({ key: 'caste', label: 'Caste', value: filters.caste });
    if (filters.minIncome) active.push({ key: 'minIncome', label: 'Income', value: `₹${filters.minIncome}LPA+` });
    return active;
  }, [filters]);
  
  // Remove individual filter
  const removeFilter = (key: string) => {
    if (key === 'age') {
      setFilters(prev => ({ ...prev, minAge: '', maxAge: '' }));
    } else if (key === 'height') {
      setFilters(prev => ({ ...prev, minHeight: '', maxHeight: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSendInterest = (profile: MockProfile) => {
    setSelectedProfile(profile);
    setShowInterestModal(true);
  };

  const confirmSendInterest = () => {
    if (selectedProfile) {
      sendInterest(selectedProfile, interestMessage);
      setSentInterests([...sentInterests, selectedProfile.userId]);
      setShowInterestModal(false);
      setInterestMessage("");
      setSelectedProfile(null);
    }
  };

  const clearFilters = () => {
    setFilters(ghostFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4A0E25]">Search Profiles</h1>
          <p className="text-sm md:text-base text-[#5D0F3A]">
            Found <span className="font-bold text-[#C2185B]">{results.length}</span> profiles
          </p>
        </div>
        <div className="flex gap-2">
          {/* Mobile Filter Toggle - Touch Friendly */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] border-2 border-[#F8BBD9] rounded-xl text-sm font-medium hover:border-[#C2185B] hover:shadow-md transition-all touch-target"
          >
            <Filter size={20} className="text-[#C2185B]" />
            <span className="text-[#4A0E25]">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex bg-white border border-[#F8BBD9] rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 px-3 flex items-center gap-1 text-sm ${viewMode === "grid" ? "bg-[#880E4F] text-white" : "text-[#5D0F3A]"}`}
            >
              <Grid3X3 size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 px-3 flex items-center gap-1 text-sm ${viewMode === "list" ? "bg-[#880E4F] text-white" : "text-[#5D0F3A]"}`}
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto sidebar-scrollbar rounded-2xl">
            <FilterSidebarContent
              filters={filters}
              setFilters={setFilters}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer - Bottom Sheet Style */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-fade-in" 
              onClick={() => setShowMobileFilters(false)} 
            />
            {/* Bottom Sheet Panel */}
            <div className="bottom-sheet animate-slide-up-bottom-sheet flex flex-col max-h-[90vh]">
              {/* Drag Handle */}
              <div className="bottom-sheet-handle" />
              
              {/* Header with touch-friendly close button */}
              <div className="sticky top-0 bg-white px-4 py-3 flex items-center justify-between z-10 border-b border-[#FCE4EC]">
                <h3 className="font-bold text-[#4A0E25] text-lg flex items-center gap-2">
                  <Filter size={20} className="text-[#C2185B]" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white text-xs px-2 py-0.5 rounded-full font-bold">{activeFilterCount}</span>
                  )}
                </h3>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="w-11 h-11 flex items-center justify-center bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full transition-colors touch-target"
                >
                  <X size={20} className="text-[#880E4F]" />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto sidebar-scrollbar bg-[#FFF0F5]">
                <FilterSidebarContent
                  filters={filters}
                  setFilters={setFilters}
                  activeFilterCount={activeFilterCount}
                  clearFilters={clearFilters}
                />
              </div>
              
              {/* Apply Button - Fixed at bottom for mobile */}
              <div className="sticky bottom-0 bg-white p-4 border-t border-[#FCE4EC] safe-area-bottom">
                <div className="flex gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-3.5 border-2 border-[#F8BBD9] text-[#5D0F3A] rounded-xl text-base font-medium hover:bg-[#FCE4EC] transition-colors touch-target"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-xl text-base font-semibold hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg touch-target flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Show {results.length} Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Active Filter Chips */}
          {activeFiltersArray.length > 0 && (
            <div className="mb-4 bg-white rounded-xl border border-[#FCE4EC] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[#5D0F3A] flex items-center gap-1">
                  <Sliders size={14} className="text-[#C2185B]" />
                  Active Filters:
                </span>
                {activeFiltersArray.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] border border-[#F8BBD9] rounded-full text-xs font-medium text-[#4A0E25] hover:border-[#C2185B] transition-colors group"
                  >
                    <span className="text-[#880E4F]">{filter.label}:</span> {filter.value}
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="ml-1 w-4 h-4 rounded-full bg-[#F8BBD9] hover:bg-[#C2185B] flex items-center justify-center transition-colors group-hover:bg-[#C2185B]"
                    >
                      <X size={10} className="text-[#5D0F3A] group-hover:text-white" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="ml-auto px-3 py-1 text-xs font-medium text-[#C2185B] hover:text-[#880E4F] hover:bg-[#FCE4EC] rounded-full transition-colors flex items-center gap-1"
                >
                  <X size={12} />
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
          
          {results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-[#FCE4EC]">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl flex items-center justify-center shadow-lg">
                <Search size={40} className="text-white" />
              </div>
              <p className="text-xl text-[#4A0E25] font-medium">No profiles found</p>
              <p className="text-[#5D0F3A]">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-lg hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-md"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl shadow-sm border border-[#FCE4EC] overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  onClick={() => viewProfile(profile.userId)}
                >
                  {/* Photo */}
                  <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User size={80} className="text-white/30" />
                    </div>
                    {profile.isPremium && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
                        <Crown size={12} /> Premium
                      </div>
                    )}
                    {profile.isVerified && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <BadgeCheck size={12} /> Verified
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="text-white font-bold text-lg">{profile.name}</div>
                      <div className="text-white/80 text-sm">{profile.age} yrs, {profile.height} cm</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-xs text-[#5D0F3A] mb-1.5 flex-wrap">
                      <MapPin size={12} className="text-[#C2185B]" />
                      <span>{profile.city}</span>
                      <span>•</span>
                      <span>{profile.religion}</span>
                    </div>
                    <p className="text-xs text-[#4A0E25] mb-1.5 flex items-center gap-1 truncate">
                      <GraduationCap size={12} className="text-[#C2185B]" />
                      {profile.education} • {profile.occupation}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#5D0F3A] mb-2">
                      <span className="flex items-center gap-1"><Globe size={10} className="text-[#C2185B]" />{profile.motherTongue}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      {sentInterests.includes(profile.userId) ? (
                        <div className="flex-1 text-center py-2 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                          <Check size={14} /> Sent
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendInterest(profile); }}
                          className="flex-1 py-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-lg text-xs font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          <Heart size={14} /> Interest
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); shortlistProfile(profile.userId); }}
                        className={`p-2 rounded-lg transition-colors ${
                          shortlisted.includes(profile.userId)
                            ? "bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600"
                            : "bg-[#FFF0F5] text-[#5D0F3A] hover:bg-[#FFE4E1]"
                        }`}
                      >
                        {shortlisted.includes(profile.userId) ? <Star size={18} className="fill-yellow-500" /> : <Bookmark size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl shadow-sm border border-[#FCE4EC] p-3 sm:p-4 flex gap-3 sm:gap-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => viewProfile(profile.userId)}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User size={32} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#4A0E25] text-sm sm:text-lg">{profile.name}</h3>
                      {profile.isPremium && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                      {profile.isVerified && <BadgeCheck size={14} className="text-green-500" />}
                    </div>
                    <p className="text-[#5D0F3A] text-xs sm:text-sm">
                      {profile.age} yrs • {profile.height} cm • {profile.city}
                    </p>
                    <p className="text-[#4A0E25] text-xs sm:text-sm mt-1 truncate">
                      {profile.education} • {profile.occupation}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col gap-2">
                    {sentInterests.includes(profile.userId) ? (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                        <Check size={16} /> Sent
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSendInterest(profile); }}
                        className="px-4 py-2 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg text-sm font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all flex items-center gap-1"
                      >
                        <Heart size={16} /> Interest
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); shortlistProfile(profile.userId); }}
                      className={`px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                        shortlisted.includes(profile.userId)
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-[#FFF0F5] text-[#5D0F3A]"
                      }`}
                    >
                      {shortlisted.includes(profile.userId) ? <Star size={16} className="fill-yellow-500" /> : <Bookmark size={16} />}
                      {shortlisted.includes(profile.userId) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interest Modal - Bottom Sheet on Mobile */}
      {showInterestModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-backdrop-fade-in">
          {/* Desktop Modal */}
          <div className="hidden md:block bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up shadow-2xl">
            <h2 className="text-xl font-bold text-[#4A0E25] mb-4">Send Interest to {selectedProfile.name}</h2>
            <textarea
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Add a personal message (optional)..."
              className="w-full p-3 border border-[#F8BBD9] rounded-xl h-24 focus:ring-2 focus:ring-[#EC407A] resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={confirmSendInterest}
                className="flex-1 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3 rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] touch-target"
              >
                Send Interest
              </button>
              <button
                onClick={() => {
                  setShowInterestModal(false);
                  setInterestMessage("");
                  setSelectedProfile(null);
                }}
                className="flex-1 border border-[#F8BBD9] py-3 rounded-xl font-medium hover:bg-[#FCE4EC] touch-target"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Mobile Bottom Sheet */}
          <div className="md:hidden bottom-sheet animate-slide-up-bottom-sheet w-full">
            <div className="bottom-sheet-handle" />
            <div className="p-4">
              <h2 className="text-lg font-bold text-[#4A0E25] mb-3">Send Interest</h2>
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#FFF0F5] rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center text-white font-bold">
                  {selectedProfile.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#4A0E25]">{selectedProfile.name}</p>
                  <p className="text-xs text-[#5D0F3A]">{selectedProfile.age} yrs, {selectedProfile.city}</p>
                </div>
              </div>
              <textarea
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                placeholder="Add a personal message (optional)..."
                className="w-full p-3 border border-[#F8BBD9] rounded-xl h-24 focus:ring-2 focus:ring-[#EC407A] resize-none text-base"
              />
              <div className="flex gap-3 mt-4 safe-area-bottom">
                <button
                  onClick={() => {
                    setShowInterestModal(false);
                    setInterestMessage("");
                    setSelectedProfile(null);
                  }}
                  className="flex-1 border-2 border-[#F8BBD9] py-3.5 rounded-xl font-medium hover:bg-[#FCE4EC] touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendInterest}
                  className="flex-1 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3.5 rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] touch-target flex items-center justify-center gap-2"
                >
                  <Heart size={18} /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MATCHES PAGE
// ============================================================================

function MatchesPage({
  onNavigate,
  getMatches,
  sendInterest,
  shortlistProfile,
  shortlisted,
  viewProfile,
}: {
  onNavigate: (page: Page) => void;
  getMatches: () => (MockProfile & { compatibilityScore: number })[];
  sendInterest: (profile: MockProfile) => void;
  shortlistProfile: (id: string) => void;
  shortlisted: string[];
  viewProfile: (id: string) => void;
}) {
  const [minScore, setMinScore] = useState(50);
  const [sentInterests, setSentInterests] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"compatibility" | "age" | "income">("compatibility");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Use useMemo instead of useEffect for derived state
  const matches = useMemo(() => {
    const allMatches = getMatches();
    let filtered = allMatches.filter(m => m.compatibilityScore >= minScore);
    
    // Sort
    if (sortBy === "compatibility") {
      filtered = filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } else if (sortBy === "age") {
      filtered = filtered.sort((a, b) => a.age - b.age);
    } else if (sortBy === "income") {
      filtered = filtered.sort((a, b) => (b.annualIncome || 0) - (a.annualIncome || 0));
    }
    
    return filtered;
  }, [minScore, sortBy, getMatches]);

  const handleSendInterest = (profile: MockProfile) => {
    sendInterest(profile);
    setSentInterests([...sentInterests, profile.userId]);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const allMatches = getMatches();
    const highCompat = allMatches.filter(m => m.compatibilityScore >= 80).length;
    const avgScore = allMatches.length > 0 
      ? Math.round(allMatches.reduce((acc, m) => acc + m.compatibilityScore, 0) / allMatches.length)
      : 0;
    const premiumMatches = allMatches.filter(m => m.isPremium).length;
    return { total: allMatches.length, highCompat, avgScore, premiumMatches };
  }, [getMatches]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", progress: "bg-emerald-500" };
    if (score >= 70) return { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", progress: "bg-sky-500" };
    if (score >= 55) return { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", progress: "bg-amber-500" };
    return { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", progress: "bg-rose-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100 border-b border-rose-200/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200/50">
                  <Heart size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Matches</h1>
                  <p className="text-gray-600 text-sm">AI-powered compatibility recommendations</p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-100 shadow-sm">
                <p className="text-xs text-gray-500">Total Matches</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-100 shadow-sm">
                <p className="text-xs text-gray-500">High Match</p>
                <p className="text-xl font-bold text-emerald-600">{stats.highCompat}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-100 shadow-sm hidden sm:block">
                <p className="text-xs text-gray-500">Avg Score</p>
                <p className="text-xl font-bold text-rose-600">{stats.avgScore}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter & Sort Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Compatibility Slider */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Min Compatibility</span>
                <span className="text-sm font-bold text-rose-600">{minScore}%+</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "compatibility" | "age" | "income")}
                className="px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
              >
                <option value="compatibility">Sort by Compatibility</option>
                <option value="age">Sort by Age</option>
                <option value="income">Sort by Income</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-rose-50 rounded-xl p-1 border border-rose-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-rose-600" : "text-gray-500 hover:text-rose-500"}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-rose-600" : "text-gray-500 hover:text-rose-500"}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-800">{matches.length}</span> matches
          </p>
        </div>

        {/* Matches Grid/List */}
        {matches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-rose-100/50">
            <div className="w-20 h-20 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
              <HeartOff size={36} className="text-rose-300" />
            </div>
            <p className="text-xl text-gray-800 font-medium mb-2">No matches found</p>
            <p className="text-gray-500 mb-4">Try lowering your minimum compatibility score</p>
            <button
              onClick={() => setMinScore(0)}
              className="px-6 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
            >
              Show All Matches
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => {
              const scoreColors = getScoreColor(match.compatibilityScore);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all group cursor-pointer"
                  onClick={() => viewProfile(match.userId)}
                >
                  {/* Photo Section */}
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-rose-200 via-pink-100 to-rose-200 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <User size={40} className="text-rose-400" />
                      </div>
                    </div>
                    
                    {/* Compatibility Badge */}
                    <div className={`absolute top-3 right-3 ${scoreColors.bg} ${scoreColors.text} px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border ${scoreColors.ring}`}>
                      {match.compatibilityScore}% Match
                    </div>

                    {/* Premium Badge */}
                    {match.isPremium && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                        <Crown size={12} /> Premium
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); shortlistProfile(match.userId); }}
                        className={`p-2.5 rounded-full shadow-lg transition-all ${
                          shortlisted.includes(match.userId)
                            ? "bg-amber-400 text-white"
                            : "bg-white/90 text-gray-600 hover:bg-amber-50 hover:text-amber-500"
                        }`}
                      >
                        {shortlisted.includes(match.userId) ? <StarOff size={18} /> : <Star size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{match.name}</h3>
                        <p className="text-gray-500 text-sm">
                          {match.age} yrs • {match.height}cm • {match.city}
                        </p>
                      </div>
                      {match.isVerified && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 size={14} /> Aadhaar Verified
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg text-xs">{match.religion}</span>
                      <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg text-xs">{match.motherTongue}</span>
                      <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded-lg text-xs">{match.education}</span>
                    </div>

                    {/* Career Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Briefcase size={14} className="text-gray-400" />
                      <span>{match.occupation}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-medium text-gray-700">₹{(match.annualIncome / 100000).toFixed(0)}L</span>
                    </div>

                    {/* Action Button */}
                    {sentInterests.includes(match.userId) ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
                        <Check size={18} /> Interest Sent
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSendInterest(match); }}
                        className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <Heart size={18} /> Send Interest
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {matches.map((match) => {
              const scoreColors = getScoreColor(match.compatibilityScore);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                  onClick={() => viewProfile(match.userId)}
                >
                  <div className="flex">
                    {/* Photo */}
                    <div className="w-32 md:w-40 h-32 md:h-36 bg-gradient-to-br from-rose-200 via-pink-100 to-rose-200 flex items-center justify-center flex-shrink-0 relative">
                      <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <User size={28} className="text-rose-400" />
                      </div>
                      {match.isPremium && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-1.5 rounded-full shadow-md">
                          <Crown size={12} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 text-lg">{match.name}</h3>
                            {match.isVerified && (
                              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> Aadhaar
                              </div>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mb-2">
                            {match.age} yrs • {match.height}cm • {match.city}, {match.state}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg text-xs">{match.religion}</span>
                            <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg text-xs">{match.motherTongue}</span>
                            <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded-lg text-xs">{match.education}</span>
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs">{match.maritalStatus.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><Briefcase size={14} className="text-gray-400" /> {match.occupation}</span>
                            <span className="font-medium text-gray-700">₹{(match.annualIncome / 100000).toFixed(0)}L/yr</span>
                          </div>
                        </div>

                        {/* Score & Actions */}
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className={`${scoreColors.bg} ${scoreColors.text} px-3 py-1.5 rounded-full text-sm font-bold border ${scoreColors.ring}`}>
                            {match.compatibilityScore}%
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); shortlistProfile(match.userId); }}
                              className={`p-2 rounded-lg transition-all ${
                                shortlisted.includes(match.userId)
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500"
                              }`}
                            >
                              {shortlisted.includes(match.userId) ? <StarOff size={18} /> : <Star size={18} />}
                            </button>
                            {sentInterests.includes(match.userId) ? (
                              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm">
                                <Check size={16} /> Sent
                              </div>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSendInterest(match); }}
                                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:from-rose-600 hover:to-pink-600 transition-all flex items-center gap-1.5"
                              >
                                <Heart size={16} /> Interest
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INTERESTS PAGE
// ============================================================================

function InterestsPage({
  onNavigate,
  interactions,
  acceptInterest,
  declineInterest,
  shortlisted,
  shortlistProfile,
  viewProfile,
  sendInterest,
}: {
  onNavigate: (page: Page) => void;
  interactions: MockInteraction[];
  acceptInterest: (id: string) => void;
  declineInterest: (id: string) => void;
  shortlisted: string[];
  shortlistProfile: (id: string) => void;
  viewProfile: (id: string) => void;
  sendInterest: (profile: MockProfile) => void;
}) {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "accepted" | "shortlisted">("received");

  const receivedInterests = interactions.filter(i => i.senderId !== 'ghost-user' && i.status === 'PENDING');
  const sentInterests = interactions.filter(i => i.senderId === 'ghost-user' && i.type === 'INTEREST');
  const acceptedInterests = interactions.filter(i => i.status === 'ACCEPTED');
  const shortlistedInteractions = interactions.filter(i => i.type === 'SHORTLIST');

  const getTabData = () => {
    switch (activeTab) {
      case "received": return receivedInterests;
      case "sent": return sentInterests;
      case "accepted": return acceptedInterests;
      case "shortlisted": return shortlistedInteractions;
    }
  };

  const currentData = getTabData();

  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const [sentFromShortlist, setSentFromShortlist] = useState<string[]>([]);

  const handleSendInterestFromShortlist = (profile: MockProfile) => {
    sendInterest(profile);
    setSentFromShortlist([...sentFromShortlist, profile.userId]);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E25] mb-4 sm:mb-6 flex items-center gap-2">
        <Heart size={28} className="text-[#C2185B]" />
        Interests
      </h1>

      {/* Tabs - Horizontal Scroll on Mobile */}
      <div className="interests-tabs mb-4 sm:mb-6 bg-white rounded-xl p-1.5 sm:p-2 shadow-sm border border-[#FCE4EC]">
        {[
          { id: "received" as const, label: "Received", count: receivedInterests.length, icon: Inbox },
          { id: "sent" as const, label: "Sent", count: sentInterests.length, icon: Send },
          { id: "accepted" as const, label: "Accepted", count: acceptedInterests.length, icon: UserCheck },
          { id: "shortlisted" as const, label: "Shortlisted", count: shortlistedInteractions.length, icon: Bookmark },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`interest-tab flex-1 sm:flex-none ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white shadow-md"
                : "text-[#5D0F3A] hover:bg-[#FCE4EC]"
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? "text-white" : "text-[#C2185B]"} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id 
                  ? "bg-white/20 text-white" 
                  : "bg-[#FCE4EC] text-[#880E4F]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {currentData.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-[#FCE4EC] p-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] rounded-full flex items-center justify-center">
            <Heart size={32} className="text-[#C2185B]" />
          </div>
          <p className="text-lg sm:text-xl text-[#4A0E25] font-medium">No {activeTab} interests</p>
          <p className="text-sm sm:text-base text-[#5D0F3A] mt-2 max-w-md mx-auto">
            {activeTab === "received" && "When someone sends you an interest, it will appear here"}
            {activeTab === "sent" && "Start searching and send interests to profiles you like"}
            {activeTab === "accepted" && "Accepted interests will appear here. You can then start chatting!"}
            {activeTab === "shortlisted" && "Shortlist profiles to review them later"}
          </p>
          {activeTab === "sent" && (
            <button
              onClick={() => onNavigate("search")}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl text-sm font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all min-h-[44px] flex items-center gap-2 mx-auto"
            >
              <Search size={18} />
              Search Profiles
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {currentData.map((interaction) => (
            <div
              key={interaction.id}
              className="bg-white rounded-xl shadow-sm border border-[#FCE4EC] overflow-hidden hover:shadow-md hover:border-[#F8BBD9] transition-all"
            >
              <div className="p-3 sm:p-4" onClick={() => viewProfile(interaction.profile.userId)}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Avatar with verified badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md">
                        {interaction.profile.name[0]}
                      </div>
                      {interaction.profile.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                          <BadgeCheck size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#4A0E25] text-sm sm:text-base">{interaction.profile.name}</h3>
                        {interaction.profile.isPremium && (
                          <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <Crown size={10} />
                          </span>
                        )}
                      </div>
                      
                      {/* Quick Stats with icons */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#5D0F3A] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#C2185B]" />
                          {interaction.profile.age} yrs
                        </span>
                        <span className="text-[#F8BBD9]">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#C2185B]" />
                          {interaction.profile.city}
                        </span>
                        <span className="text-[#F8BBD9] hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1">
                          <GraduationCap size={12} className="text-[#C2185B]" />
                          {interaction.profile.education || 'N/A'}
                        </span>
                      </div>
                      
                      {/* Message Preview - Enhanced */}
                      {interaction.message && (
                        <div className="mt-2 bg-gradient-to-r from-[#FFF0F5] to-[#FCE4EC] p-2 sm:p-3 rounded-lg border border-[#F8BBD9]/50">
                          <p className="text-xs text-[#880E4F] font-medium mb-1 flex items-center gap-1">
                            <MessageCircle size={10} /> Message
                          </p>
                          <p className="text-xs sm:text-sm text-[#4A0E25] italic">
                            &quot;{interaction.message}&quot;
                          </p>
                        </div>
                      )}
                      
                      {/* Timestamp - Relative time */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={12} className="text-[#AD1457]" />
                        <span className="text-xs text-[#AD1457] font-medium">{getRelativeTime(interaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Action Buttons Bar */}
              <div className="border-t border-[#FCE4EC] bg-[#FFF0F5]/30 p-2 sm:p-3">
                <div className="flex flex-wrap gap-2 justify-end">
                  {activeTab === "received" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); acceptInterest(interaction.id); }}
                        className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-lg text-xs sm:text-sm font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); declineInterest(interaction.id); }}
                        className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 border border-[#F8BBD9] text-[#5D0F3A] rounded-lg text-xs sm:text-sm font-medium hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X size={14} /> Decline
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); shortlistProfile(interaction.profile.userId); }}
                        className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                          shortlisted.includes(interaction.profile.userId)
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "border border-[#F8BBD9] text-[#5D0F3A] hover:bg-[#FCE4EC]"
                        }`}
                      >
                        {shortlisted.includes(interaction.profile.userId) ? <Star size={14} className="fill-amber-500" /> : <Bookmark size={14} />}
                        <span className="hidden sm:inline">{shortlisted.includes(interaction.profile.userId) ? "Saved" : "Save"}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); viewProfile(interaction.profile.userId); }}
                        className="px-3 py-2 sm:py-1.5 border border-[#F8BBD9] text-[#5D0F3A] rounded-lg text-xs sm:text-sm hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> <span className="hidden sm:inline">View</span>
                      </button>
                    </>
                  )}
                  {activeTab === "sent" && (
                    <>
                      <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 ${
                        interaction.status === 'PENDING' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        interaction.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {interaction.status === 'PENDING' && <Clock size={14} />}
                        {interaction.status === 'ACCEPTED' && <UserCheck size={14} />}
                        {interaction.status === 'DECLINED' && <UserX size={14} />}
                        {interaction.status}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); viewProfile(interaction.profile.userId); }}
                        className="px-3 py-1.5 border border-[#F8BBD9] text-[#5D0F3A] rounded-lg text-xs sm:text-sm hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> View
                      </button>
                    </>
                  )}
                  {activeTab === "accepted" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onNavigate("messages"); }}
                        className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-lg text-xs sm:text-sm font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); viewProfile(interaction.profile.userId); }}
                        className="px-3 py-1.5 border border-[#F8BBD9] text-[#5D0F3A] rounded-lg text-xs sm:text-sm hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> View
                      </button>
                    </>
                  )}
                  {activeTab === "shortlisted" && (
                    <>
                      {sentFromShortlist.includes(interaction.profile.userId) ? (
                        <div className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5">
                          <Check size={14} /> Interest Sent
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendInterestFromShortlist(interaction.profile); }}
                          className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-lg text-xs sm:text-sm font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Heart size={14} /> Send Interest
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); shortlistProfile(interaction.profile.userId); }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs sm:text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); viewProfile(interaction.profile.userId); }}
                        className="px-3 py-1.5 border border-[#F8BBD9] text-[#5D0F3A] rounded-lg text-xs sm:text-sm hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> View
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MESSAGES PAGE
// ============================================================================

function MessagesPage({
  onNavigate,
  conversations,
  messages,
  sendMessage,
  markMessagesRead,
  activeChat,
  setActiveChat,
}: {
  onNavigate: (page: Page) => void;
  conversations: { userId: string; profile: MockProfile; lastMessage?: MockMessage; unreadCount: number }[];
  messages: MockMessage[];
  sendMessage: (receiverId: string, content: string) => void;
  markMessagesRead: (userId: string) => void;
  activeChat: string | null;
  setActiveChat: (id: string | null) => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showAIMessageDrafter, setShowAIMessageDrafter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Anti-scam monitoring states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Icebreaker suggestions - Fun prompts to start conversations
  const icebreakers = [
    { emoji: "🏖️", text: "What's your favorite weekend getaway?", category: "Travel" },
    { emoji: "🍳", text: "If we had to cook one meal together, what would it be?", category: "Food" },
    { emoji: "☕", text: "Tea or Coffee person? And what's your go-to order?", category: "Lifestyle" },
    { emoji: "✈️", text: "What's your dream travel destination?", category: "Travel" },
    { emoji: "🎬", text: "What's the last movie or series you binge-watched?", category: "Entertainment" },
    { emoji: "📚", text: "What's a book that changed your perspective on life?", category: "Books" },
    { emoji: "🎵", text: "What song would be the soundtrack of your life?", category: "Music" },
    { emoji: "🎯", text: "What's one thing on your bucket list you're dying to do?", category: "Goals" },
    { emoji: "🍽️", text: "What's your comfort food after a long day?", category: "Food" },
    { emoji: "🌟", text: "What does your perfect Sunday look like?", category: "Lifestyle" },
  ];

  const filteredConversations = conversations.filter(c =>
    c.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatMessages = activeChat
    ? messages.filter(m => m.senderId === activeChat || m.receiverId === activeChat)
    : [];

  // Calculate safety score for active conversation
  const safetyScore = activeChat ? calculateSafetyScore(messages, activeChat) : 100;
  
  // Get safety status based on score
  const getSafetyStatus = (score: number) => {
    if (score >= 80) return { label: 'Safe', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 50) return { label: 'Caution', color: 'text-amber-600', bgColor: 'bg-amber-100' };
    return { label: 'Warning', color: 'text-red-600', bgColor: 'bg-red-100' };
  };
  
  const safetyStatus = getSafetyStatus(safetyScore);

  // Calculate current warning based on the latest incoming message
  const currentWarning = useMemo(() => {
    if (activeChat && chatMessages.length > 0) {
      // Check the latest message from the other user
      const latestIncomingMessage = [...chatMessages]
        .reverse()
        .find(m => m.senderId === activeChat);
      
      if (latestIncomingMessage) {
        const result = detectScamContent(latestIncomingMessage.content);
        if (result.isSuspicious) {
          return result;
        }
      }
    }
    return null;
  }, [chatMessages, activeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (activeChat) {
      markMessagesRead(activeChat);
      // Simulate typing indicator for demo
      const timeout = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [activeChat, markMessagesRead]);

  const handleSendMessage = () => {
    if (newMessage.trim() && activeChat) {
      sendMessage(activeChat, newMessage.trim());
      setNewMessage("");
      setShowIcebreakers(false);
    }
  };

  const handleIcebreakerSelect = (text: string) => {
    setNewMessage(text);
    setShowIcebreakers(false);
  };

  const handleVideoCall = () => {
    // Show paywall for non-premium users
    setShowPaywall(true);
  };

  const activeConversation = conversations.find(c => c.userId === activeChat);

  if (conversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E25] mb-4 sm:mb-6 flex items-center gap-2">
          <MessageCircle size={28} className="text-[#C2185B]" />
          Messages
        </h1>
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-[#FCE4EC] p-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] rounded-full flex items-center justify-center">
            <MessageCircle size={32} className="text-[#C2185B]" />
          </div>
          <p className="text-lg sm:text-xl text-[#4A0E25] font-medium">No conversations yet</p>
          <p className="text-sm sm:text-base text-[#5D0F3A] mt-2">Accept interests to start messaging with your matches</p>
          <button
            onClick={() => onNavigate("interests")}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl text-sm font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all min-h-[44px] flex items-center gap-2 mx-auto"
          >
            <HeartHandshake size={18} />
            View Interests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E25] mb-4 sm:mb-6 flex items-center gap-2">
        <MessageCircle size={28} className="text-[#C2185B]" />
        Messages
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-[#FCE4EC] overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${activeChat ? 'hidden md:flex' : ''} w-full md:w-1/3 border-r border-[#FCE4EC] flex flex-col`}>
            <div className="p-3 border-b border-[#FCE4EC]">
              <input
                type="text"
                placeholder="🔍 Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 sm:p-3 bg-[#FFF0F5] rounded-lg border-none focus:ring-2 focus:ring-[#EC407A] text-sm min-h-[44px]"
              />
            </div>
            <div className="flex-1 overflow-y-scroll sidebar-scrollbar">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => {
                    setActiveChat(conv.userId);
                    markMessagesRead(conv.userId);
                  }}
                  className={`w-full p-3 sm:p-4 flex items-center gap-3 border-b border-[#FCE4EC] text-left hover:bg-[#FCE4EC] transition-colors min-h-[64px] sm:min-h-[72px] touch-manipulation ${
                    activeChat === conv.userId ? "bg-[#FFF0F5]" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      {conv.profile.name[0]}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#880E4F] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm sm:text-base text-[#4A0E25] truncate">{conv.profile.name}</h3>
                      {conv.lastMessage && (
                        <span className="text-[10px] sm:text-xs text-[#5D0F3A] flex-shrink-0 ml-2">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#5D0F3A] truncate">
                      {conv.lastMessage?.content || "Start a conversation!"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeChat ? '' : 'hidden md:flex'} flex-1 flex-col relative`}>
            {activeChat ? (
              <>
                {/* Chat Header with Safety Indicator */}
                <div className="p-3 sm:p-4 border-b border-[#FCE4EC] flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden p-2.5 hover:bg-[#FCE4EC] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                    >
                      <ArrowLeft size={20} className="text-[#880E4F]" />
                    </button>
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
                        {activeConversation?.profile.name[0]}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-[#4A0E25] truncate max-w-[100px] sm:max-w-[200px]">
                        {activeConversation?.profile.name}
                      </h3>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                      </p>
                    </div>
                    {/* Safety Indicator */}
                    <div className={`ml-1 sm:ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${safetyStatus.bgColor} ${safetyStatus.color}`}>
                      <ShieldCheck size={12} />
                      <span>{safetyScore}%</span>
                      <span className="hidden sm:inline">{safetyStatus.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={handleVideoCall}
                      className="p-2 sm:p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      title="Video Call"
                    >
                      <Video size={18} className="text-[#880E4F] sm:hidden" />
                      <Video size={20} className="text-[#880E4F] hidden sm:block" />
                    </button>
                    <button
                      onClick={() => onNavigate("profileView")}
                      className="p-2 sm:p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      title="View Profile"
                    >
                      <User size={18} className="text-[#880E4F] sm:hidden" />
                      <User size={20} className="text-[#880E4F] hidden sm:block" />
                    </button>
                    <button className="p-2 sm:p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
                      <MoreVertical size={18} className="text-[#880E4F] sm:hidden" />
                      <MoreVertical size={20} className="text-[#880E4F] hidden sm:block" />
                    </button>
                  </div>
                </div>

                {/* Security Warning Banner */}
                {currentWarning && currentWarning.isSuspicious && !dismissedWarning && (
                  <div className="mx-3 sm:mx-4 mt-2 p-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-800 flex items-center gap-1">
                          ⚠️ Security Alert: This message may contain suspicious content
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {currentWarning.alerts.map((alert, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                alert.severity === 'high' 
                                  ? 'bg-red-200 text-red-800' 
                                  : alert.severity === 'medium'
                                  ? 'bg-amber-200 text-amber-800'
                                  : 'bg-yellow-200 text-yellow-800'
                              }`}
                            >
                              {alert.message}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-red-700 mt-2">
                          Please be cautious. Never share personal or financial information.
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => setShowReportModal(true)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <AlertTriangle size={12} />
                            Report User
                          </button>
                          <button
                            onClick={() => setDismissedWarning(true)}
                            className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 custom-scrollbar pb-20 sm:pb-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[#5D0F3A]">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FCE4EC] rounded-full flex items-center justify-center mb-3">
                        <Sparkles size={20} className="text-[#C2185B] sm:hidden" />
                        <Sparkles size={24} className="text-[#C2185B] hidden sm:block" />
                      </div>
                      <p className="font-medium text-sm sm:text-base text-[#4A0E25]">Start the conversation!</p>
                      <p className="text-xs sm:text-sm mt-1">Say hello to {activeConversation?.profile.name}</p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.senderId === 'ghost-user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] p-2.5 sm:p-3 rounded-2xl ${
                              msg.senderId === 'ghost-user'
                                ? "bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-br-md"
                                : "bg-[#FFF0F5] text-[#4A0E25] rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm sm:text-base leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] sm:text-xs mt-1 flex items-center gap-1 ${
                              msg.senderId === 'ghost-user' ? "text-white/70" : "text-[#5D0F3A]"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {msg.senderId === 'ghost-user' && (
                                <span className="flex items-center ml-1">
                                  {msg.isRead ? (
                                    <CheckCheck size={12} className="text-blue-300 sm:hidden" title="Read" />
                                  ) : (
                                    <Check size={12} className="text-white/60 sm:hidden" title="Sent" />
                                  )}
                                  {msg.isRead ? (
                                    <CheckCheck size={14} className="text-blue-300 hidden sm:block" title="Read" />
                                  ) : (
                                    <Check size={14} className="text-white/60 hidden sm:block" title="Sent" />
                                  )}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-[#FFF0F5] px-4 py-2 rounded-2xl rounded-bl-md">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-[#C2185B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-[#C2185B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-[#C2185B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Icebreakers Dropdown */}
                {showIcebreakers && (
                  <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-auto sm:bottom-20 sm:left-20 bg-white rounded-xl shadow-lg border border-[#FCE4EC] p-4 z-10 max-w-md max-h-80 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-[#880E4F] font-semibold flex items-center gap-1">
                        <Sparkles size={14} /> Fun Icebreakers
                      </p>
                      <button
                        onClick={() => setShowIcebreakers(false)}
                        className="p-1 hover:bg-[#FCE4EC] rounded-lg transition-colors"
                      >
                        <X size={16} className="text-[#5D0F3A]" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5D0F3A] mb-3">
                      Start a conversation with these fun prompts! 🎉
                    </p>
                    <div className="space-y-2">
                      {icebreakers.map((icebreaker, i) => (
                        <button
                          key={i}
                          onClick={() => handleIcebreakerSelect(icebreaker.text)}
                          className="w-full text-left p-3 text-sm text-[#4A0E25] hover:bg-[#FCE4EC] rounded-lg transition-colors flex items-start gap-3 border border-transparent hover:border-[#F8BBD9] group"
                        >
                          <span className="text-lg">{icebreaker.emoji}</span>
                          <div className="flex-1">
                            <p className="text-[#4A0E25] group-hover:text-[#880E4F]">{icebreaker.text}</p>
                            <span className="text-xs text-[#AD1457] bg-[#FCE4EC] px-2 py-0.5 rounded-full mt-1 inline-block">
                              {icebreaker.category}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-[#FCE4EC] bg-white sticky bottom-0 z-10">
                  {/* AI Message Drafter Popup */}
                  {showAIMessageDrafter && activeConversation && (
                    <div className="absolute bottom-full left-3 sm:left-4 right-3 sm:right-auto mb-2 z-20 max-w-full sm:max-w-md">
                      <AIMessageDrafter
                        profile={activeConversation.profile}
                        extendedData={getExtendedProfileData(activeConversation.userId)}
                        onSelectMessage={(message) => {
                          setNewMessage(message);
                          setShowAIMessageDrafter(false);
                        }}
                        onClose={() => setShowAIMessageDrafter(false)}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setShowIcebreakers(!showIcebreakers)}
                      className="p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      title="Icebreakers"
                    >
                      <Sparkles size={18} className="text-[#C2185B]" />
                    </button>
                    <button
                      onClick={() => setShowAIMessageDrafter(!showAIMessageDrafter)}
                      className={`p-2.5 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${showAIMessageDrafter ? 'bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white' : 'hover:bg-[#FCE4EC] text-[#880E4F]'}`}
                      title="AI Draft Message"
                    >
                      <Sparkles size={18} />
                    </button>
                    <button
                      className="p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation hidden sm:flex"
                      title="Attach file"
                    >
                      <Paperclip size={18} className="text-[#AD1457]" />
                    </button>
                    <button
                      className="p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation hidden sm:flex"
                      title="Emoji"
                    >
                      <Smile size={18} className="text-[#AD1457]" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 p-2.5 sm:p-3 rounded-full border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent text-sm sm:text-base min-w-0 min-h-[44px]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-full font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] disabled:opacity-50 transition-all flex-shrink-0 shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#5D0F3A]">
                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paywall/Upgrade Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-fade-in-up shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#880E4F] to-[#C2185B] opacity-90"></div>
              <div className="relative p-6 text-white">
                <button
                  onClick={() => setShowPaywall(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Crown size={32} className="text-yellow-300" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">Premium Feature</h2>
                <p className="text-center text-white/80 text-sm">
                  Video calling is a premium feature. Upgrade to connect face-to-face with your matches!
                </p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {[
                  { icon: Video, text: "Unlimited Video Calls" },
                  { icon: Phone, text: "View Contact Details" },
                  { icon: Heart, text: "Priority Match Listing" },
                  { icon: BadgeCheck, text: "Verified Badge" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#FFF0F5] rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center">
                      <feature.icon size={16} className="text-white" />
                    </div>
                    <span className="text-[#4A0E25] font-medium text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setShowPaywall(false);
                  onNavigate("settings");
                }}
                className="w-full py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-xl font-semibold hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Crown size={18} />
                Upgrade to Premium
              </button>
              
              <button
                onClick={() => setShowPaywall(false)}
                className="w-full mt-3 py-2 text-[#5D0F3A] hover:text-[#880E4F] transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Main Video (Remote) */}
            <div className="flex-1 bg-gradient-to-br from-[#1a0a10] to-[#2d0f1a] flex items-center justify-center relative">
              <div className="text-center text-white">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl">
                  {activeConversation?.profile.name[0]}
                </div>
                <h3 className="text-2xl font-bold">{activeConversation?.profile.name}</h3>
                <p className="text-white/60 mt-1 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connecting...
                </p>
              </div>
            </div>
            
            {/* Self Video (Picture-in-Picture) */}
            <div className="absolute bottom-24 right-4 sm:right-8 w-28 h-40 sm:w-36 sm:h-52 bg-gradient-to-br from-[#3d1520] to-[#5d1f2e] rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
              <div className="w-full h-full flex items-center justify-center">
                <User size={40} className="text-white/40" />
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
              </button>
              <button
                onClick={() => setShowVideoCall(false)}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all"
              >
                <Phone size={24} className="text-white rotate-[135deg]" />
              </button>
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-4 rounded-full transition-all ${isCameraOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {isCameraOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-fade-in-up shadow-2xl">
            {reportSubmitted ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-[#4A0E25] mb-2">Report Submitted</h2>
                <p className="text-sm text-[#5D0F3A] mb-4">
                  Thank you for your report. Our team will review this and take appropriate action.
                </p>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                    setReportReason("");
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-xl font-medium"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-90"></div>
                  <div className="relative p-6 text-white">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-center mb-1">Report User</h2>
                    <p className="text-center text-white/80 text-sm">
                      Help us keep Happy Jodi Vibes safe
                    </p>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-[#5D0F3A] mb-4">
                    You are reporting <strong className="text-[#880E4F]">{activeConversation?.profile.name}</strong> for suspicious activity.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-[#4A0E25]">Select a reason:</p>
                    {[
                      'Requesting money or financial details',
                      'Sharing suspicious links',
                      'Inappropriate behavior',
                      'Fake profile / impersonation',
                      'Harassment',
                      'Other'
                    ].map((reason) => (
                      <label key={reason} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#FCE4EC] cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={reportReason === reason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="accent-[#880E4F]"
                        />
                        <span className="text-sm text-[#4A0E25]">{reason}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 py-2.5 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl font-medium hover:bg-[#FCE4EC] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (reportReason) {
                          setReportSubmitted(true);
                        }
                      }}
                      disabled={!reportReason}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle size={16} />
                      Submit Report
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROFILE PAGE
// ============================================================================

function ProfilePage({
  onNavigate,
  profile,
  updateProfile,
}: {
  onNavigate: (page: Page) => void;
  profile: typeof ghostUserProfile;
  updateProfile: (updates: Partial<typeof ghostUserProfile>) => void;
}) {
  // Use profile.isVerified which is dynamically updated from verification status
  const isVerified = profile.isVerified;
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [selectedTags, setSelectedTags] = useState<LifestyleTag[]>(profile.lifestyleTags || []);

  const handleSave = () => {
    updateProfile({ ...formData, lifestyleTags: selectedTags });
    setEditing(false);
  };

  // Toggle lifestyle tag selection
  const toggleTag = (tag: LifestyleTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Available tags for selection
  const availableTags: LifestyleTag[] = [
    'Pet Parent', 'Wanderlust', 'Work-from-Home', 'Fitness Enthusiast',
    'Tea over Coffee', 'Coffee Lover', 'Non-Smoker', 'Non-Drinker',
    'Early Bird', 'Night Owl', 'Foodie', 'Bookworm',
    'Music Lover', 'Movie Buff', 'Nature Lover', 'Spiritual',
    'Vegetarian', 'Animal Lover'
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E25] mb-4 sm:mb-6">👤 My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-[#FCE4EC] overflow-hidden">
        {/* Header - Mobile-first responsive layout */}
        <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Profile Photo - Responsive sizing */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl flex-shrink-0 ring-4 ring-white/20">
              {profile.name[0]}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{profile.name}</h2>
              <p className="text-white/80 text-sm sm:text-base mt-1">{profile.city}, {profile.state}</p>
              {/* Badges - Stack on mobile, row on larger screens */}
              <div className="flex flex-col sm:flex-row gap-2 mt-3 justify-center sm:justify-start">
                {profile.isVerified && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm inline-flex items-center justify-center gap-1">
                    <Check size={14} /> Verified
                  </span>
                )}
                {profile.isPremium && (
                  <span className="bg-yellow-500 px-3 py-1 rounded-full text-xs sm:text-sm inline-flex items-center justify-center gap-1">
                    <Crown size={14} /> Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {editing ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Education</label>
                  <input
                    type="text"
                    value={formData.education || ''}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                  />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <label className="block text-sm font-medium text-[#4A0E25] mb-1">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 sm:p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] text-base"
                />
              </div>
              
              {/* Lifestyle Tags Selection */}
              <div className="mt-3 sm:mt-4">
                <label className="block text-sm font-medium text-[#4A0E25] mb-2 sm:mb-3">Lifestyle & Interests</label>
                <p className="text-xs sm:text-sm text-[#5D0F3A] mb-2 sm:mb-3">Select tags that describe you (max 5)</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const isDisabled = !isSelected && selectedTags.length >= 5;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => !isDisabled && toggleTag(tag)}
                        disabled={isDisabled}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all border-2 touch-manipulation ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white border-transparent'
                            : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-[#880E4F] border-[#F8BBD9] hover:border-[#C2185B] hover:bg-[#FCE4EC] active:scale-95'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#5D0F3A] mt-2">{selectedTags.length}/5 tags selected</p>
              </div>
              
              {/* Action Buttons - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 sm:py-3 border border-[#F8BBD9] text-[#4A0E25] rounded-lg font-medium hover:bg-[#FCE4EC] transition-colors text-base touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md text-base touch-manipulation"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#4A0E25] mb-3 sm:mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Age</p>
                    <p className="font-semibold text-sm sm:text-base text-[#4A0E25]">{profile.age} years</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Height</p>
                    <p className="font-semibold text-sm sm:text-base text-[#4A0E25]">{profile.height} cm</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Religion</p>
                    <p className="font-semibold text-sm sm:text-base text-[#4A0E25]">{profile.religion}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Mother Tongue</p>
                    <p className="font-semibold text-sm sm:text-base text-[#4A0E25]">{profile.motherTongue}</p>
                  </div>
                </div>
              </div>

              {/* Education & Career */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#4A0E25] mb-3 sm:mb-4">Education & Career</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Education</p>
                    <p className="font-semibold text-sm sm:text-base text-[#4A0E25] truncate">{profile.education || 'Not specified'}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Occupation</p>
                    <p className="font-semibold text-sm sm:text-base text-[#4A0E25] truncate">{profile.occupation || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Lifestyle Tags */}
              {profile.lifestyleTags && profile.lifestyleTags.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#4A0E25] mb-3 sm:mb-4">Lifestyle & Interests</h3>
                  <LifestyleTagsDisplay tags={profile.lifestyleTags} maxDisplay={5} size="sm" />
                </div>
              )}

              {/* Verification Status */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#4A0E25] mb-3 sm:mb-4">Verification Status</h3>
                <div className={`p-3 sm:p-4 rounded-lg ${isVerified ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-green-500' : 'bg-amber-500'}`}>
                        {isVerified ? (
                          <ShieldCheck size={20} className="text-white" />
                        ) : (
                          <AlertCircle size={20} className="text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm sm:text-base ${isVerified ? 'text-green-800' : 'text-amber-800'}`}>
                          {isVerified ? 'Profile Verified' : 'Profile Not Verified'}
                        </p>
                        <p className={`text-xs sm:text-sm ${isVerified ? 'text-green-600' : 'text-amber-600'} line-clamp-2`}>
                          {isVerified
                            ? 'Your profile has been verified. Enjoy enhanced trust and visibility!'
                            : 'Verify your profile to get 3x more responses and unlock chat features.'}
                        </p>
                      </div>
                    </div>
                    {!isVerified && (
                      <button
                        onClick={() => onNavigate('verification')}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all touch-manipulation"
                      >
                        Verify Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#4A0E25] mb-3 sm:mb-4">About Me</h3>
                  <p className="text-sm sm:text-base text-[#5D0F3A]">{profile.bio}</p>
                </div>
              )}

              {/* Audio Introduction Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#4A0E25] mb-3 sm:mb-4 flex items-center gap-2">
                  <Mic size={18} className="text-[#C2185B]" /> Voice Introduction
                </h3>
                <AudioRecorder 
                  existingAudio={profile.audioIntro}
                  onSave={(audioData) => {
                    updateProfile({ 
                      audioIntro: {
                        id: `audio-${Date.now()}`,
                        duration: audioData.duration,
                        recordedAt: new Date(),
                        audioUrl: audioData.base64
                      }
                    });
                  }}
                />
              </div>

              {/* Download Biodata PDF */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] rounded-2xl border-2 border-[#F8BBD9]">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <FileText size={24} className="text-white sm:hidden" />
                    <FileText size={28} className="text-white hidden sm:block" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-[#4A0E25] text-base sm:text-lg">Download Biodata PDF</h3>
                    <p className="text-xs sm:text-sm text-[#5D0F3A]">Generate a traditional Indian biodata for sharing via WhatsApp</p>
                  </div>
                  <button
                    onClick={() => generateBiodataPDF(profile)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md text-base touch-manipulation"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS PAGE
// ============================================================================

// Toggle Switch Component for Settings
function SettingsToggleSwitch({ 
  enabled, 
  onChange, 
  label, 
  description 
}: { 
  enabled: boolean; 
  onChange: (value: boolean) => void; 
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#FCE4EC] last:border-0">
      <div className="flex-1">
        <p className="font-medium text-[#4A0E25]">{label}</p>
        {description && <p className="text-sm text-[#5D0F3A]">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          enabled ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// Toggle switch component for settings
function ToggleSwitch({ 
  enabled, 
  onChange, 
  label, 
  description 
}: { 
  enabled: boolean; 
  onChange: (value: boolean) => void; 
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 sm:py-4 border-b border-[#FCE4EC] last:border-0 min-h-[52px] sm:min-h-0">
      <div className="flex-1 pr-3">
        <p className="font-medium text-[#4A0E25] text-sm sm:text-base">{label}</p>
        {description && <p className="text-xs sm:text-sm text-[#5D0F3A] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors duration-200 flex-shrink-0 touch-target ${
          enabled ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B]" : "bg-gray-200"
        }`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-5 sm:translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsPage({
  onNavigate,
  profile,
  preferences,
  updateProfile,
  updatePreferences,
  incognitoMode = false,
  setIncognitoMode,
  photoPrivacyEnabled = false,
  setPhotoPrivacyEnabled,
}: {
  onNavigate: (page: Page) => void;
  profile: typeof ghostUserProfile;
  preferences: typeof ghostPartnerPreferences;
  updateProfile: (updates: Partial<typeof ghostUserProfile>) => void;
  updatePreferences: (updates: Partial<typeof ghostPartnerPreferences>) => void;
  incognitoMode?: boolean;
  setIncognitoMode?: (value: boolean) => void;
  photoPrivacyEnabled?: boolean;
  setPhotoPrivacyEnabled?: (value: boolean) => void;
}) {
  const [activeSection, setActiveSection] = useState<"account" | "preferences" | "privacy" | "premium" | "assisted">("account");
  const [prefForm, setPrefForm] = useState(preferences);
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    photoPrivacy: photoPrivacyEnabled ? "accepted" : "all",
    contactDetailsPrivacy: true,
    showOnlineStatus: true,
  });
  
  // Notification preferences state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    matchAlerts: true,
    marketingEmails: false,
  });
  
  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const navItems = [
    { id: "account" as const, label: "Account", shortLabel: "Account", icon: User },
    { id: "preferences" as const, label: "Partner Preferences", shortLabel: "Partner", icon: Heart },
    { id: "privacy" as const, label: "Privacy", shortLabel: "Privacy", icon: Lock },
    { id: "premium" as const, label: "Premium", shortLabel: "Premium", icon: Crown },
    { id: "assisted" as const, label: "Assisted Matrimony", shortLabel: "Assisted", icon: Headphones },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserX size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Deactivate Account</h3>
                  <p className="text-white/80 text-sm">Your profile will be hidden temporarily</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Your profile will be hidden from search results and other users won&apos;t be able to view it. 
                You can reactivate anytime by logging back in.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for deactivation (optional)
                </label>
                <select
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select a reason</option>
                  <option value="found_match">Found my match</option>
                  <option value="taking_break">Taking a break</option>
                  <option value="not_satisfied">Not satisfied with service</option>
                  <option value="privacy">Privacy concerns</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Account deactivated successfully!");
                    setShowDeactivateModal(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Account</h3>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Warning: Permanent Action</h4>
                    <ul className="text-sm text-red-700 mt-2 space-y-1">
                      <li>• Your profile will be permanently deleted</li>
                      <li>• All your photos and data will be removed</li>
                      <li>• Your matches and conversations will be lost</li>
                      <li>• This action cannot be reversed</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type &quot;DELETE&quot; to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmation === "DELETE") {
                      alert("Account deleted permanently!");
                      setShowDeleteModal(false);
                    }
                  }}
                  disabled={deleteConfirmation !== "DELETE"}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    deleteConfirmation === "DELETE"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Trash2 size={16} />
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tabs - Horizontal Scroll */}
      <div className="md:hidden bg-white border-b border-[#FCE4EC] p-2 sticky top-0 z-10">
        <div className="interests-tabs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`interest-tab ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white shadow-md"
                  : "bg-[#FCE4EC] text-[#4A0E25]"
              }`}
            >
              <item.icon size={16} className={activeSection === item.id ? "text-white" : "text-[#C2185B]"} />
              <span>{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Left Sidebar - Fixed on Desktop */}
      <div className="hidden md:flex w-64 bg-white border-r border-[#FCE4EC] flex-shrink-0 flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold text-[#4A0E25] mb-4">Settings</h1>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white shadow-md"
                    : "text-[#4A0E25] hover:bg-[#FCE4EC]"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeSection === item.id
                    ? "bg-white/20"
                    : "bg-[#FCE4EC]"
                }`}>
                  <item.icon size={18} className={activeSection === item.id ? "text-white" : "text-[#C2185B]"} />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right Content - Scrollable */}
      <div className="flex-1 overflow-y-auto md:h-[calc(100vh-64px)]">
        <div className="max-w-3xl mx-auto p-6">
          {/* Account Settings */}
          {activeSection === "account" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A0E25]">Account Settings</h2>
              </div>

              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#4A0E25] mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[#FCE4EC]">
                    <div>
                      <p className="font-medium text-[#4A0E25]">Email</p>
                      <p className="text-sm text-[#5D0F3A]">ghost@happyjodivibes.com</p>
                    </div>
                    <button className="text-[#C2185B] hover:underline text-sm font-medium">Change</button>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#FCE4EC]">
                    <div>
                      <p className="font-medium text-[#4A0E25]">Phone</p>
                      <p className="text-sm text-[#5D0F3A]">Not added</p>
                    </div>
                    <button className="text-[#C2185B] hover:underline text-sm font-medium">Add</button>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-[#4A0E25]">Password</p>
                      <p className="text-sm text-[#5D0F3A]">••••••••</p>
                    </div>
                    <button className="text-[#C2185B] hover:underline text-sm font-medium">Change</button>
                  </div>
                </div>
              </div>

              {/* Enhanced Notification Preferences */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Bell size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Notification Preferences</h3>
                </div>
                <div className="space-y-1">
                  <ToggleSwitch
                    enabled={notificationSettings.emailNotifications}
                    onChange={(value) => setNotificationSettings({ ...notificationSettings, emailNotifications: value })}
                    label="Email notifications"
                    description="Receive updates via email"
                  />
                  <ToggleSwitch
                    enabled={notificationSettings.smsNotifications}
                    onChange={(value) => setNotificationSettings({ ...notificationSettings, smsNotifications: value })}
                    label="SMS notifications"
                    description="Get text message alerts"
                  />
                  <ToggleSwitch
                    enabled={notificationSettings.pushNotifications}
                    onChange={(value) => setNotificationSettings({ ...notificationSettings, pushNotifications: value })}
                    label="Push notifications"
                    description="Browser and app notifications"
                  />
                  <ToggleSwitch
                    enabled={notificationSettings.matchAlerts}
                    onChange={(value) => setNotificationSettings({ ...notificationSettings, matchAlerts: value })}
                    label="Match alerts"
                    description="Get notified about new matches"
                  />
                  <ToggleSwitch
                    enabled={notificationSettings.marketingEmails}
                    onChange={(value) => setNotificationSettings({ ...notificationSettings, marketingEmails: value })}
                    label="Marketing emails"
                    description="Receive offers and promotions"
                  />
                </div>
              </div>

              {/* AI Profile Optimization */}
              <AIProfileOptimizationSection 
                profile={profile}
                extendedData={{
                  diet: 'Vegetarian',
                  drinking: 'Never',
                  smoking: 'Never',
                  familyType: 'Nuclear',
                  familyValues: 'Moderate',
                  familyStatus: 'Upper Middle',
                  manglik: 'No',
                  rashi: 'Makar (Capricorn)',
                  nakshatra: 'Uttarashada',
                  hobbies: ['Reading', 'Traveling', 'Music', 'Cooking'],
                  verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true },
                  partnerPreferences: { minAge: 24, maxAge: 32, minHeight: 155, maxHeight: 180, religions: ['Hindu'], education: ['MBA', 'B.Tech'], minIncome: 1000000, locations: ['Mumbai', 'Bangalore'], maritalStatus: ['NEVER_MARRIED'] }
                }}
                updateProfile={updateProfile}
              />

              {/* Account Status Settings */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Account Status</h3>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="w-full py-3 border border-amber-200 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserX size={18} />
                    Deactivate Account
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-3 border border-red-200 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="w-full py-3 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Partner Preferences */}
          {activeSection === "preferences" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center">
                  <Heart size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A0E25]">Partner Preferences</h2>
              </div>

              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <p className="text-[#5D0F3A] mb-6">Set your ideal partner preferences to get better match recommendations.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Min Age</label>
                    <input
                      type="number"
                      value={prefForm.minAge}
                      onChange={(e) => setPrefForm({ ...prefForm, minAge: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Max Age</label>
                    <input
                      type="number"
                      value={prefForm.maxAge}
                      onChange={(e) => setPrefForm({ ...prefForm, maxAge: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Min Height (cm)</label>
                    <input
                      type="number"
                      value={prefForm.minHeight}
                      onChange={(e) => setPrefForm({ ...prefForm, minHeight: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Max Height (cm)</label>
                    <input
                      type="number"
                      value={prefForm.maxHeight}
                      onChange={(e) => setPrefForm({ ...prefForm, maxHeight: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Religion</label>
                    <select
                      value={prefForm.religion}
                      onChange={(e) => setPrefForm({ ...prefForm, religion: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Preferred City</label>
                    <input
                      type="text"
                      value={prefForm.city}
                      onChange={(e) => setPrefForm({ ...prefForm, city: e.target.value })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A0E25] mb-1">Min Annual Income (₹)</label>
                    <input
                      type="number"
                      value={prefForm.minIncome}
                      onChange={(e) => setPrefForm({ ...prefForm, minIncome: parseInt(e.target.value) })}
                      className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    updatePreferences(prefForm);
                  }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === "privacy" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center">
                  <Lock size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A0E25]">Privacy Settings</h2>
              </div>

              {/* Profile Visibility */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Eye size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Profile Visibility</h3>
                </div>
                <p className="text-[#5D0F3A] mb-4 text-sm">Control who can see your profile on the platform.</p>
                <div className="space-y-2">
                  {[
                    { value: "public", label: "Public", desc: "Your profile is visible to all users", icon: Eye },
                    { value: "premium", label: "Premium Members Only", desc: "Only premium members can view your profile", icon: Crown },
                    { value: "hidden", label: "Hidden", desc: "Your profile is hidden from everyone", icon: EyeOff },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                        privacySettings.profileVisibility === option.value
                          ? "border-[#C2185B] bg-[#FCE4EC]"
                          : "border-[#FCE4EC] hover:border-[#F8BBD9]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={privacySettings.profileVisibility === option.value}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                        className="hidden"
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        privacySettings.profileVisibility === option.value
                          ? "bg-gradient-to-br from-[#880E4F] to-[#C2185B]"
                          : "bg-[#FCE4EC]"
                      }`}>
                        <option.icon size={18} className={privacySettings.profileVisibility === option.value ? "text-white" : "text-[#C2185B]"} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#4A0E25]">{option.label}</p>
                        <p className="text-sm text-[#5D0F3A]">{option.desc}</p>
                      </div>
                      {privacySettings.profileVisibility === option.value && (
                        <div className="w-5 h-5 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Privacy - Blur to Reveal */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Camera size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Photo Privacy</h3>
                </div>
                <p className="text-[#5D0F3A] mb-4 text-sm">Keep your photos blurred until interest is accepted. This gives you control over your digital footprint.</p>
                
                {/* Blur-to-Reveal Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FFF0F5] to-white rounded-lg border border-[#FCE4EC] mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${photoPrivacyEnabled ? "bg-gradient-to-br from-[#880E4F] to-[#C2185B]" : "bg-[#FCE4EC]"}`}>
                      {photoPrivacyEnabled ? (
                        <EyeOff size={18} className="text-white" />
                      ) : (
                        <Eye size={18} className="text-[#C2185B]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#4A0E25]">Blur Photos by Default</p>
                      <p className="text-sm text-[#5D0F3A]">Photos appear blurred until interest is accepted</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPhotoPrivacyEnabled?.(!photoPrivacyEnabled)}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                      photoPrivacyEnabled ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        photoPrivacyEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                
                {/* Preview */}
                <div className="flex gap-4 items-center justify-center p-4 bg-[#FFF0F5] rounded-lg">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#F8BBD9] to-[#FCE4EC] flex items-center justify-center mb-2 mx-auto ${photoPrivacyEnabled ? "blur-sm" : ""}`}>
                      <User size={24} className="text-[#C2185B]" />
                    </div>
                    <p className="text-xs text-[#5D0F3A]">Before Accept</p>
                  </div>
                  <ArrowRight size={20} className="text-[#C2185B]" />
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#880E4F] to-[#C2185B] flex items-center justify-center mb-2 mx-auto">
                      <User size={24} className="text-white" />
                    </div>
                    <p className="text-xs text-[#5D0F3A]">After Accept</p>
                  </div>
                </div>
              </div>

              {/* Incognito Mode - Premium Feature */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                        <Ghost size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          Incognito Mode
                          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                            PREMIUM
                          </span>
                        </h3>
                        <p className="text-slate-300 text-sm">Browse profiles privately</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                    <p className="text-slate-200 text-sm mb-3">
                      When enabled, you won&apos;t appear in the &quot;Recent Visitors&quot; list of profiles you view. 
                      Browse with complete privacy.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-slate-600/50 rounded text-xs text-slate-300 flex items-center gap-1">
                        <EyeOff size={12} /> Hidden from visitors
                      </span>
                      <span className="px-2 py-1 bg-slate-600/50 rounded text-xs text-slate-300 flex items-center gap-1">
                        <Shield size={12} /> Private browsing
                      </span>
                      <span className="px-2 py-1 bg-slate-600/50 rounded text-xs text-slate-300 flex items-center gap-1">
                        <Ghost size={12} /> Anonymous viewing
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white font-medium">
                      {incognitoMode ? "Incognito Mode Active" : "Incognito Mode Off"}
                    </span>
                    <button
                      onClick={() => setIncognitoMode?.(!incognitoMode)}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                        incognitoMode ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-slate-600"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                          incognitoMode ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  
                  {!incognitoMode && (
                    <p className="text-xs text-slate-400 mt-3 text-center">
                      Upgrade to Premium to unlock Incognito Mode
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Privacy Controls</h3>
                </div>
                <div className="space-y-1">
                  <ToggleSwitch
                    enabled={privacySettings.contactDetailsPrivacy}
                    onChange={(value) => setPrivacySettings({ ...privacySettings, contactDetailsPrivacy: value })}
                    label="Contact Details Privacy"
                    description="Hide phone number and email from non-accepted matches"
                  />
                  <ToggleSwitch
                    enabled={privacySettings.showOnlineStatus}
                    onChange={(value) => setPrivacySettings({ ...privacySettings, showOnlineStatus: value })}
                    label="Show Online Status"
                    description="Let others see when you're online"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button 
                onClick={() => {
                  setPhotoPrivacyEnabled?.(privacySettings.photoPrivacy === "accepted");
                  setSaveMessage("Privacy settings saved successfully!");
                  setShowSaveConfirmation(true);
                  setTimeout(() => setShowSaveConfirmation(false), 3000);
                }}
                className="w-full py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md"
              >
                Save Privacy Settings
              </button>
              
              {/* Save Confirmation */}
              {showSaveConfirmation && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm animate-fade-in-up">
                  <Check size={16} />
                  {saveMessage}
                </div>
              )}
            </div>
          )}

          {/* Premium Section */}
          {activeSection === "premium" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center">
                  <Crown size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A0E25]">Premium Plans</h2>
              </div>

              <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Crown size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Upgrade to Premium</h3>
                    <p className="text-white/80">Unlock all features and find your match faster</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Basic", price: "₹999", duration: "30 days", features: ["View contact details of 5 profiles", "Send 20 interests/day", "Basic filters"] },
                  { name: "Premium", price: "₹2,499", duration: "90 days", features: ["View all contact details", "Unlimited interests", "Advanced filters", "Priority support"], popular: true },
                  { name: "VIP", price: "₹4,999", duration: "180 days", features: ["All Premium features", "Profile boost", "Dedicated manager", "Video calls"] },
                ].map((plan, i) => (
                  <div
                    key={i}
                    className={`bg-white rounded-xl border p-6 shadow-sm ${plan.popular ? "border-[#880E4F] ring-2 ring-[#C2185B]" : "border-[#FCE4EC]"}`}
                  >
                    {plan.popular && (
                      <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white text-xs px-3 py-1 rounded-full inline-block mb-3">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-[#4A0E25]">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-bold text-[#C2185B]">{plan.price}</span>
                      <span className="text-[#5D0F3A]">/{plan.duration}</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-[#4A0E25]">
                          <Check size={14} className="text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white hover:from-[#5D0F3A] hover:to-[#880E4F]"
                          : "border border-[#F8BBD9] text-[#4A0E25] hover:bg-[#FCE4EC]"
                      }`}
                    >
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assisted Matrimony Section */}
          {activeSection === "assisted" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center">
                  <Headphones size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#4A0E25]">Assisted Matrimony</h2>
                  <p className="text-sm text-[#5D0F3A]">Your dedicated Relationship Manager</p>
                </div>
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <Crown size={14} /> Premium Service
                </div>
              </div>

              {/* Introduction Banner */}
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles size={24} className="text-yellow-300" />
                    <h3 className="text-xl font-bold">Personalized Matchmaking Service</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">
                    Let our expert Relationship Managers guide you through your journey to find the perfect life partner. 
                    Get hand-picked matches, personalized assistance, and dedicated support throughout your matrimony journey.
                  </p>
                </div>
              </div>

              {/* Relationship Manager Profile Card */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] p-4">
                  <p className="text-sm font-medium text-[#880E4F]">Your Dedicated Relationship Manager</p>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* RM Photo */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#FCE4EC] flex items-center justify-center shadow-lg border-4 border-white">
                          <User size={48} className="text-[#C2185B]/50" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Check size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* RM Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#4A0E25]">Priya Sharma</h3>
                          <p className="text-[#5D0F3A] text-sm">Senior Relationship Manager</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                          <Star size={16} className="text-amber-500 fill-amber-500" />
                          <span className="text-sm font-semibold text-amber-700">4.9</span>
                          <span className="text-xs text-amber-600">(128 reviews)</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#5D0F3A]">
                          <div className="w-8 h-8 bg-[#FCE4EC] rounded-lg flex items-center justify-center">
                            <Calendar size={14} className="text-[#C2185B]" />
                          </div>
                          <div>
                            <p className="text-xs text-[#880E4F]">Experience</p>
                            <p className="font-medium text-[#4A0E25]">8+ Years</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#5D0F3A]">
                          <div className="w-8 h-8 bg-[#FCE4EC] rounded-lg flex items-center justify-center">
                            <Heart size={14} className="text-[#C2185B]" />
                          </div>
                          <div>
                            <p className="text-xs text-[#880E4F]">Matches Made</p>
                            <p className="font-medium text-[#4A0E25]">450+</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#5D0F3A]">
                          <div className="w-8 h-8 bg-[#FCE4EC] rounded-lg flex items-center justify-center">
                            <Users size={14} className="text-[#C2185B]" />
                          </div>
                          <div>
                            <p className="text-xs text-[#880E4F]">Languages</p>
                            <p className="font-medium text-[#4A0E25]">Hindi, English</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#5D0F3A]">
                          <div className="w-8 h-8 bg-[#FCE4EC] rounded-lg flex items-center justify-center">
                            <MapPin size={14} className="text-[#C2185B]" />
                          </div>
                          <div>
                            <p className="text-xs text-[#880E4F]">Location</p>
                            <p className="font-medium text-[#4A0E25]">Mumbai, India</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-[#5D0F3A] mb-4">
                        "I believe every individual deserves to find their perfect match. Let me help you navigate 
                        this beautiful journey with personalized guidance and hand-picked recommendations."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Services Offered</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Heart,
                      title: "Profile Shortlisting",
                      description: "Hand-picked matches based on your preferences, family background, and compatibility",
                      color: "from-rose-400 to-pink-500"
                    },
                    {
                      icon: Users,
                      title: "Family Coordination",
                      description: "Direct communication with families, arranging introductions and facilitating discussions",
                      color: "from-violet-400 to-purple-500"
                    },
                    {
                      icon: CalendarCheck,
                      title: "Meeting Arrangements",
                      description: "Schedule and coordinate in-person or video meetings at your convenience",
                      color: "from-emerald-400 to-green-500"
                    }
                  ].map((service, i) => (
                    <div key={i} className="bg-gradient-to-br from-[#FFF0F5] to-white rounded-xl p-5 border border-[#FCE4EC] hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3 shadow-lg`}>
                        <service.icon size={24} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-[#4A0E25] mb-2">{service.title}</h4>
                      <p className="text-sm text-[#5D0F3A]">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits List */}
              <div className="bg-gradient-to-br from-[#FFF0F5] to-[#FCE4EC] rounded-xl p-6 border border-[#F8BBD9]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Award size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Benefits of Assisted Service</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: UserCheck, text: "Dedicated Personal Manager" },
                    { icon: Heart, text: "Hand-picked Quality Matches" },
                    { icon: Users, text: "Family Coordination Support" },
                    { icon: Zap, text: "Priority Support 24/7" },
                    { icon: Shield, text: "Verified Profiles Only" },
                    { icon: TrendingUp, text: "Higher Success Rate" }
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon size={16} className="text-white" />
                      </div>
                      <span className="text-[#4A0E25] font-medium text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md flex items-center justify-center gap-2">
                  <Phone size={18} />
                  Request Callback
                </button>
                <button className="flex-1 py-3 border-2 border-[#C2185B] text-[#880E4F] rounded-xl font-medium hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={18} />
                  Chat with RM
                </button>
              </div>

              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                    <Crown size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Premium Service Pricing</h4>
                    <p className="text-sm text-amber-600">Starting from ₹9,999 for 3 months</p>
                  </div>
                </div>
                <p className="text-sm text-amber-700">
                  Includes unlimited profile shortlisting, family coordination, meeting arrangements, 
                  and dedicated support. Contact us for custom packages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ProfileViewPage({
  profile,
  compatibilityScore,
  onNavigate,
  sendInterest,
  shortlistProfile,
  shortlisted,
  sentInterests,
  myPreferences,
  viewProfile,
}: {
  profile: MockProfile;
  compatibilityScore: number;
  onNavigate: (page: Page) => void;
  sendInterest: (profile: MockProfile) => void;
  shortlistProfile: (id: string) => void;
  shortlisted: string[];
  sentInterests: string[];
  myPreferences: typeof ghostPartnerPreferences;
  viewProfile: (id: string) => void;
}) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('about');
  const [showActions, setShowActions] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: 'me' | 'them'; content: string; time: Date }[]>([]);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordingTime, setVoiceRecordingTime] = useState(0);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const extendedData = getExtendedProfileData(profile.userId);
  const icebreakers = generateIcebreakers(profile.name, {
    occupation: profile.occupation,
    city: profile.city,
    education: profile.education,
    hobbies: extendedData.hobbies
  });

  // Generate mock photo gallery (since we don't have real photos)
  const photos = [
    { id: 1, url: null, caption: 'Profile Photo', isPrimary: true },
    { id: 2, url: null, caption: 'Lifestyle', isPrimary: false },
    { id: 3, url: null, caption: 'With Family', isPrimary: false },
    { id: 4, url: null, caption: 'Holiday', isPrimary: false },
    { id: 5, url: null, caption: 'Professional', isPrimary: false },
  ];

  // Open lightbox with specific photo
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  // Navigate lightbox
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    } else {
      setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }
  };

  // Get compatibility label
  const getCompatibilityLabel = (score: number) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Great Match';
    if (score >= 55) return 'Good Match';
    return 'Fair Match';
  };

  const isOnline = Date.now() - profile.lastActive.getTime() < 15 * 60 * 1000;
  const interestSent = sentInterests.includes(profile.userId);

  // Check partner preference matches
  const preferenceMatches = {
    age: profile.age >= myPreferences.minAge && profile.age <= myPreferences.maxAge,
    height: profile.height >= myPreferences.minHeight && profile.height <= myPreferences.maxHeight,
    religion: !myPreferences.religion || profile.religion === myPreferences.religion,
    income: !myPreferences.minIncome || (profile.annualIncome || 0) >= myPreferences.minIncome,
  };

  const matchCount = Object.values(preferenceMatches).filter(Boolean).length;
  const totalPreferences = Object.keys(preferenceMatches).length;

  // Get compatibility color
  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return { ring: '#10B981', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 70) return { ring: '#0EA5E9', text: 'text-sky-600', bg: 'bg-sky-50' };
    if (score >= 55) return { ring: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50' };
    return { ring: '#F43F5E', text: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const compatColor = getCompatibilityColor(compatibilityScore);

  // SecureConnect Chat Functions
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, { sender: 'me', content: chatMessage.trim(), time: new Date() }]);
      setChatMessage("");
      // Simulate reply after 1 second
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          sender: 'them', 
          content: "Thank you for your message! I'm interested to know more about you.", 
          time: new Date() 
        }]);
      }, 1500);
    }
  };

  // Auto-scroll chat messages
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // SecureConnect Call Functions
  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setShowCallModal(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate masked virtual number
  const getVirtualNumber = () => {
    const maskedNumber = `+91 XXXXX X${Math.floor(Math.random() * 9000) + 1000}`;
    return maskedNumber;
  };

  // Voice Recording Functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceRecorderRef.current = mediaRecorder;
      voiceChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        voiceChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
        // Send voice message
        const duration = voiceRecordingTime;
        setChatMessages(prev => [...prev, { 
          sender: 'me', 
          content: `🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`, 
          time: new Date() 
        }]);
        stream.getTracks().forEach(track => track.stop());
        
        // Simulate reply
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            sender: 'them', 
            content: "Thanks for your voice message! I'll listen to it soon.", 
            time: new Date() 
          }]);
        }, 1500);
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setVoiceRecordingTime(0);

      voiceTimerRef.current = setInterval(() => {
        setVoiceRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current && isRecordingVoice) {
      voiceRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (voiceTimerRef.current) {
        clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
    }
  };

  // Emoji picker
  const commonEmojis = ['😊', '❤️', '😂', '🙏', '👍', '😍', '🥰', '💕', '😘', '😊', '✨', '🌹', '💖', '🤗', '😁'];

  const addEmoji = (emoji: string) => {
    setChatMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Cleanup call timer on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Start call timer when call modal opens
  useEffect(() => {
    if (showCallModal && !isCallActive) {
      // Simulate connection delay
      setTimeout(() => {
        startCall();
      }, 2000);
    }
  }, [showCallModal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-pink-50/30 pb-24">
      {/* Photo Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
          >
            <X size={24} />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => navigateLightbox('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight size={28} />
          </button>

          {/* Main Photo */}
          <div className="relative w-full max-w-lg mx-4 aspect-square flex items-center justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD9] to-[#FCE4EC] rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/20">
              <User size={120} className="text-[#C2185B]/40" />
            </div>
            {photos[lightboxIndex]?.isPrimary && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Primary Photo
              </div>
            )}
          </div>

          {/* Caption */}
          <p className="text-white/80 text-sm mt-4">{photos[lightboxIndex]?.caption}</p>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-xl">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  lightboxIndex === i ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] flex items-center justify-center">
                  <User size={20} className="text-[#C2185B]/40" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SecureConnect® Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-2 border-[#880E4F]/20 [&>button]:hidden">
          <DialogTitle className="sr-only">SecureConnect Chat with {profile.name}</DialogTitle>
          <DialogDescription className="sr-only">End-to-end encrypted chat conversation</DialogDescription>
          {/* SecureConnect Header */}
          <div className="bg-gradient-to-r from-[#880E4F] to-[#AD1457] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              {/* Action Buttons - Circular Icons with Proper Spacing */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setShowCallModal(true);
                  }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  title="Call via SecureConnect"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  title="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* SecureConnect Badge */}
            <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <ShieldCheck size={16} className="text-green-300" />
              <span className="text-xs font-medium">SecureConnect® - Your identity is protected</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gradient-to-b from-[#FFF0F5] to-white space-y-3">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 bg-[#FCE4EC] rounded-full flex items-center justify-center mb-3">
                  <MessageCircle size={24} className="text-[#C2185B]" />
                </div>
                <p className="text-sm text-[#5D0F3A]">Start a conversation with {profile.name.split(' ')[0]}</p>
                <p className="text-xs text-[#AD1457] mt-1">Messages are encrypted end-to-end</p>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === 'me'
                          ? 'bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-br-md'
                          : 'bg-white text-[#4A0E25] rounded-bl-md shadow-sm border border-[#FCE4EC]'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>
                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatMessagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-[#FCE4EC]">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mb-2 p-2 bg-[#FFF0F5] rounded-xl border border-[#FCE4EC]">
                <div className="flex flex-wrap gap-1">
                  {commonEmojis.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => addEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Voice Recording Indicator */}
            {isRecordingVoice && (
              <div className="mb-2 p-2 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600">Recording... {Math.floor(voiceRecordingTime / 60)}:{(voiceRecordingTime % 60).toString().padStart(2, '0')}</span>
                <button
                  onClick={stopVoiceRecording}
                  className="ml-auto px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-all"
                >
                  Stop & Send
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-full transition-all ${showEmojiPicker ? 'bg-[#880E4F] text-white' : 'text-[#AD1457] hover:bg-[#FCE4EC]'}`}
              >
                <Smile size={20} />
              </button>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-[#FFF0F5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C2185B]"
              />
              <button
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onMouseLeave={() => isRecordingVoice && stopVoiceRecording()}
                className={`p-2 rounded-full transition-all ${isRecordingVoice ? 'bg-red-500 text-white' : 'text-[#AD1457] hover:bg-[#FCE4EC]'}`}
                title="Hold to record voice message"
              >
                <Mic size={20} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="p-2 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
            {/* Encrypted Badge */}
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#5D0F3A]">
              <Lock size={12} className="text-green-600" />
              <span>Calls and messages are encrypted</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SecureConnect® Call Modal */}
      <Dialog open={showCallModal} onOpenChange={(open) => {
        if (!open) endCall();
        setShowCallModal(open);
      }}>
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden border-2 border-[#880E4F]/20">
          <DialogTitle className="sr-only">SecureConnect Call with {profile.name}</DialogTitle>
          <DialogDescription className="sr-only">End-to-end encrypted voice call</DialogDescription>
          <div className="bg-gradient-to-b from-[#880E4F] to-[#5D0F3A] p-8 text-white text-center">
            {/* Profile */}
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 relative">
              <User size={48} className="text-white/80" />
              {isCallActive && (
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
              )}
            </div>
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <p className="text-white/70 text-sm mt-1">
              {!isCallActive ? 'Connecting...' : formatDuration(callDuration)}
            </p>

            {/* SecureConnect Label */}
            <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <ShieldCheck size={16} className="text-green-300" />
              <span className="text-xs font-medium">SecureConnect® - Your number is hidden</span>
            </div>

            {/* Virtual Number Display */}
            <div className="mt-4 bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60 mb-1">Virtual Number (Masked)</p>
              <p className="text-lg font-mono font-semibold tracking-wider">{getVirtualNumber()}</p>
            </div>

            {/* Call Status */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`}></div>
              <span className="text-sm text-white/80">
                {isCallActive ? 'Call Connected - Encrypted' : 'Establishing Secure Connection...'}
              </span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="bg-white p-6">
            <div className="flex items-center justify-center gap-6">
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isMuted 
                    ? 'bg-[#880E4F] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg"
              >
                <PhoneOff size={28} />
              </button>

              {/* Speaker Button */}
              <button className="w-14 h-14 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
                <Volume2 size={24} />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Tap to end call • Your real number is never shared
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section with Photo Gallery */}
      <div className="relative">
        {/* Photo Gallery - Clickable - Mobile optimized */}
        <div 
          className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-rose-200 via-pink-100 to-rose-200 cursor-pointer"
          onClick={() => openLightbox(currentPhoto)}
        >
          <div className="absolute inset-0 flex items-center justify-center group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white group-hover:scale-105 transition-transform relative">
              <User size={48} className="text-rose-400 sm:hidden" />
              <User size={56} className="text-rose-400 hidden sm:block md:hidden" />
              <User size={64} className="text-rose-400 hidden md:block" />
              {/* Gallery indicator overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-full flex items-center justify-center transition-all">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white">
                  <ImageIcon size={18} className="sm:hidden" />
                  <ImageIcon size={20} className="hidden sm:block" />
                  <span className="text-xs sm:text-sm font-medium">{photos.length} Photos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Navigation Dots */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhoto(i);
                }}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all touch-manipulation ${
                  currentPhoto === i ? 'bg-white w-4 sm:w-6' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Watermark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/10 text-white/30 text-[10px] sm:text-xs px-3 sm:px-4 py-1 rounded-full backdrop-blur-sm rotate-12 border border-white/20">
              🔒 Watermarked for Safety
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('matches');
            }}
            className="absolute top-3 sm:top-4 left-3 sm:left-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all touch-manipulation"
          >
            <ArrowRight size={18} className="rotate-180 sm:hidden" />
            <ArrowRight size={20} className="rotate-180 hidden sm:block" />
          </button>

          {/* Share & More Options */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1.5 sm:gap-2">
            <button 
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all touch-manipulation"
            >
              <Share2 size={16} className="sm:hidden" />
              <Share2 size={18} className="hidden sm:block" />
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all touch-manipulation"
            >
              <MoreVertical size={16} className="sm:hidden" />
              <MoreVertical size={18} className="hidden sm:block" />
            </button>
          </div>

        </div>

        {/* Profile Header - Three-part Row Layout */}
        <div className="relative bg-white rounded-t-3xl -mt-6 shadow-lg border-t border-rose-100">
          <div className="p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Section - Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{profile.name}</h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">
                  {profile.age} yrs • {profile.height} cm • {profile.city}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 justify-center lg:justify-start">
                  <span className="bg-rose-50 text-rose-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">{profile.religion}</span>
                  <span className="bg-violet-50 text-violet-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">{profile.motherTongue}</span>
                  <span className="bg-sky-50 text-sky-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">{profile.maritalStatus.replace('_', ' ')}</span>
                </div>
              </div>
              
              {/* Middle Section - Compact Aadhaar Verified Badge */}
              {profile.isVerified && (
                <div className="flex justify-center lg:justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                    <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                      <Check size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-green-800 text-sm">Aadhaar</span>
                      <span className="font-bold text-green-600 text-xs">Verified</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Right Section - Compatibility Score */}
              <div className="flex justify-center lg:justify-end">
                <div className="flex items-center gap-3">
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 p-1 rounded-full ${compatColor.bg}`}>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="42" 
                        stroke="#E5E7EB" 
                        strokeWidth="8" 
                        fill="none" 
                      />
                      <circle 
                        cx="50" cy="50" r="42" 
                        stroke={compatColor.ring} 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray={`${(compatibilityScore / 100) * 264} 264`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                      <span className={`text-sm sm:text-base font-bold ${compatColor.text} leading-tight`}>{compatibilityScore}%</span>
                      <span className="text-[7px] sm:text-[8px] text-gray-400 uppercase tracking-wider">Match</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${compatColor.bg} ${compatColor.text}`}>
                      {getCompatibilityLabel(compatibilityScore)}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Section Navigation - Fixed Left Side Panel */}
        </div>
      </div>

      {/* Main Layout Container with Fixed Left Sidebar */}
      <div className="flex min-h-screen">
        {/* Fixed Left Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 shadow-sm sticky top-0 h-screen overflow-y-auto">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] p-4 m-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Profile Sections</h3>
                <p className="text-white/70 text-xs">Navigate quickly</p>
              </div>
            </div>
          </div>

          {/* Navigation Items - Vertical */}
          <nav className="px-3 space-y-1.5">
            {[
              { id: 'about', label: 'About', icon: User, description: 'Personal info' },
              { id: 'education', label: 'Education', icon: GraduationCap, description: 'Career details' },
              { id: 'family', label: 'Family', icon: Users, description: 'Family background' },
              { id: 'lifestyle', label: 'Lifestyle', icon: Sparkles, description: 'Interests & habits' },
              { id: 'horoscope', label: 'Horoscope', icon: Star, description: 'Astrological info' },
              { id: 'partner', label: 'Partner Preferences', icon: Heart, description: 'What they seek' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-[#FCE4EC] hover:text-[#880E4F]'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeSection === section.id
                    ? 'bg-white/20'
                    : 'bg-white shadow-sm border border-gray-100'
                }`}>
                  <section.icon size={16} className={activeSection === section.id ? 'text-white' : 'text-[#AD1457]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{section.label}</p>
                  <p className={`text-xs truncate ${activeSection === section.id ? 'text-white/70' : 'text-gray-400'}`}>
                    {section.description}
                  </p>
                </div>
                {activeSection === section.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Back to Matches Button */}
          <div className="px-3 mt-6">
            <button
              onClick={() => onNavigate('matches')}
              className="w-full flex items-center gap-2 p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to Matches
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">

      {/* Sticky Action Bar - Mobile optimized */}
      {showActions && (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 overflow-x-auto">
            {interestSent ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm sm:text-base">
                <Check size={16} className="sm:hidden" />
                <Check size={18} className="hidden sm:block" /> Interest Sent
              </div>
            ) : (
              <button
                onClick={() => sendInterest(profile)}
                className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-md text-sm sm:text-base touch-manipulation"
              >
                <Heart size={16} className="sm:hidden" />
                <Heart size={18} className="hidden sm:block" /> Send Interest
              </button>
            )}
            <button
              onClick={() => shortlistProfile(profile.userId)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
                shortlisted.includes(profile.userId)
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              {shortlisted.includes(profile.userId) ? <Bookmark size={16} className="fill-current sm:hidden" /> : <Bookmark size={16} className="sm:hidden" />}
              {shortlisted.includes(profile.userId) ? <Bookmark size={18} className="fill-current hidden sm:block" /> : <Bookmark size={18} className="hidden sm:block" />}
              <span className="hidden sm:inline">{shortlisted.includes(profile.userId) ? 'Shortlisted' : 'Shortlist'}</span>
            </button>
            <button className="p-2 sm:px-4 sm:py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center touch-manipulation">
              <Share2 size={18} />
            </button>
            <button 
              onClick={() => setShowChatModal(true)}
              className="p-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-[#880E4F]/10 to-[#AD1457]/10 text-[#880E4F] rounded-xl font-medium hover:from-[#880E4F]/20 hover:to-[#AD1457]/20 transition-all flex items-center justify-center sm:gap-2 hidden sm:flex border border-[#880E4F]/20 touch-manipulation"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Chat</span>
              <ShieldCheck size={12} className="text-green-600 hidden sm:block" />
            </button>
            <button 
              onClick={() => setShowCallModal(true)}
              className="p-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-[#880E4F]/10 to-[#AD1457]/10 text-[#880E4F] rounded-xl font-medium hover:from-[#880E4F]/20 hover:to-[#AD1457]/20 transition-all flex items-center justify-center sm:gap-2 hidden sm:flex border border-[#880E4F]/20 touch-manipulation"
            >
              <Phone size={18} />
              <span className="hidden sm:inline">Call</span>
              <ShieldCheck size={12} className="text-green-600 hidden sm:block" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content with Tab Sections */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
        
        {/* About Section */}
        {activeSection === 'about' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-4 sm:p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <User size={18} className="sm:hidden" />
                  <User size={20} className="hidden sm:block" />
                  About Me
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {profile.bio || 'No bio available. This user hasn\'t written about themselves yet.'}
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {(extendedData.hobbies || []).map((hobby, i) => (
                  <span key={i} className="bg-pink-50 text-pink-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    ✨ {hobby}
                  </span>
                ))}
              </div>
            </section>

            {/* AI Match Insights Section - Detailed Compatibility Report */}
            <AIMatchInsightsSection 
              profile={profile}
              extendedData={extendedData}
              compatibilityScore={compatibilityScore}
              myPreferences={myPreferences}
            />

            {/* Basic Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-4 sm:p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <UserCircle size={18} className="sm:hidden" />
                  <UserCircle size={20} className="hidden sm:block" />
                  Basic Information
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="Age" value={`${profile.age} years`} />
                <InfoRow label="Height" value={`${profile.height} cm`} />
                <InfoRow label="Marital Status" value={profile.maritalStatus.replace('_', ' ')} />
                <InfoRow label="Mother Tongue" value={profile.motherTongue} />
              </div>
            </section>

            {/* Religious & Astrological Background */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} />
                  Religious & Astrological
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="Religion" value={profile.religion} />
                {profile.caste && <InfoRow label="Caste" value={profile.caste} />}
                {extendedData.gothra && <InfoRow label="Gothra" value={extendedData.gothra} />}
                {extendedData.rashi && <InfoRow label="Rashi (Moon Sign)" value={extendedData.rashi} />}
                {extendedData.nakshatra && <InfoRow label="Nakshatra (Star)" value={extendedData.nakshatra} />}
                <InfoRow label="Manglik/Kuja Dosham" value={extendedData.manglik} />
                {extendedData.birthTime && <InfoRow label="Birth Time" value={extendedData.birthTime} />}
                {extendedData.birthPlace && <InfoRow label="Birth Place" value={extendedData.birthPlace} />}
              </div>
            </section>
          </>
        )}

        {/* Education & Career Section */}
        {activeSection === 'education' && (
          <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
            <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap size={20} />
                Education & Career
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="Education" value={profile.education || 'Not specified'} />
              {extendedData.college && <InfoRow label="College" value={extendedData.college} />}
              <InfoRow label="Occupation" value={profile.occupation || 'Not specified'} />
              {extendedData.company && <InfoRow label="Company" value={extendedData.company} />}
              <InfoRow label="Annual Income" value={`₹${((profile.annualIncome || 0) / 100000).toFixed(0)} LPA`} />
            </div>
            
            {/* Career Highlights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                <Briefcase size={16} /> Career Highlights
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Working as {profile.occupation || 'Professional'} in {extendedData.company || 'a reputed organization'}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Educated from {extendedData.college || 'prestigious institution'}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Earning ₹{((profile.annualIncome || 0) / 100000).toFixed(0)} Lakhs per annum
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* Family Details Section */}
        {activeSection === 'family' && (
          <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
            <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} />
                Family Details
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {extendedData.fatherOccupation && <InfoRow label="Father's Occupation" value={extendedData.fatherOccupation} />}
              {extendedData.motherOccupation && <InfoRow label="Mother's Occupation" value={extendedData.motherOccupation} />}
              {extendedData.siblings && (
                <InfoRow 
                  label="Siblings" 
                  value={`${extendedData.siblings.brothers} Brother(s), ${extendedData.siblings.sisters} Sister(s)`} 
                />
              )}
              <InfoRow label="Family Type" value={extendedData.familyType} />
              <InfoRow label="Family Values" value={extendedData.familyValues} />
              <InfoRow label="Family Status" value={extendedData.familyStatus} />
            </div>
            
            {/* Family Summary Card */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Users size={16} /> Family Background
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Comes from a {extendedData.familyStatus.toLowerCase()} {extendedData.familyType.toLowerCase()} with {extendedData.familyValues.toLowerCase()} values. 
                {extendedData.fatherOccupation && ` Father is ${extendedData.fatherOccupation.toLowerCase()}.`}
                {extendedData.motherOccupation && ` Mother is ${extendedData.motherOccupation.toLowerCase()}.`}
                {extendedData.siblings && ` Has ${extendedData.siblings.brothers} brother(s) and ${extendedData.siblings.sisters} sister(s).`}
              </p>
            </div>
          </section>
        )}

        {/* Lifestyle Section */}
        {activeSection === 'lifestyle' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} />
                  Lifestyle
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="Diet" value={extendedData.diet} />
                <InfoRow label="Drinking" value={extendedData.drinking} />
                <InfoRow label="Smoking" value={extendedData.smoking} />
                {extendedData.bloodGroup && <InfoRow label="Blood Group" value={extendedData.bloodGroup} />}
              </div>
            </section>

            {/* Lifestyle & Values Tags */}
            {profile.lifestyleTags && profile.lifestyleTags.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
                <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Award size={20} />
                    Lifestyle & Interests
                  </h2>
                  <p className="text-sm text-white/80">Things that define {profile.name.split(' ')[0]}</p>
                </div>
                <LifestyleTagsDisplay tags={profile.lifestyleTags} maxDisplay={10} size="md" />
              </section>
            )}

            {/* Personality & Love Language */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Heart size={20} />
                  Personality & Love Language
                </h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {extendedData.personalityType && (
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <p className="text-sm text-gray-500 mb-1">MBTI Personality</p>
                    <p className="text-xl font-bold text-violet-700">{extendedData.personalityType}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {extendedData.personalityType.includes('E') ? 'Extrovert' : 'Introvert'} • 
                      {extendedData.personalityType.includes('N') ? ' Intuitive' : ' Sensing'} • 
                      {extendedData.personalityType.includes('F') ? ' Feeling' : ' Thinking'} • 
                      {extendedData.personalityType.includes('P') ? ' Perceiving' : ' Judging'}
                    </p>
                  </div>
                )}
                {extendedData.loveLanguage && (
                  <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                    <p className="text-sm text-gray-500 mb-1">Primary Love Language</p>
                    <p className="text-xl font-bold text-rose-700">{extendedData.loveLanguage}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {extendedData.loveLanguage === 'Quality Time' && 'Values undivided attention and meaningful moments'}
                      {extendedData.loveLanguage === 'Words of Affirmation' && 'Appreciates verbal encouragement and compliments'}
                      {extendedData.loveLanguage === 'Acts of Service' && 'Values helpful actions and thoughtful gestures'}
                      {extendedData.loveLanguage === 'Gifts' && 'Appreciates thoughtful presents and tokens of love'}
                      {extendedData.loveLanguage === 'Physical Touch' && 'Values physical connection and closeness'}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Voice Note Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Mic size={20} />
                  Voice Introduction
                </h2>
                <p className="text-sm text-white/80">A personal message from {profile.name.split(' ')[0]}</p>
              </div>
              
              {profile.audioIntro ? (
                <AudioPlayer duration={profile.audioIntro.duration} />
              ) : (
                <AudioPlayer duration={15} />
              )}
            </section>
          </>
        )}

        {/* Horoscope / Guna Milan Section */}
        {activeSection === 'horoscope' && (
          <GunaMilanSection 
            profile={profile}
            extendedData={extendedData}
            myProfile={{ rashi: 'Makar (Capricorn)', nakshatra: 'Uttarashada', manglik: 'No', birthTime: '10:30 AM', birthPlace: 'Mumbai' }}
          />
        )}

        {/* Partner Preferences Section */}
        {activeSection === 'partner' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Heart size={20} />
                  Partner Preferences Match
                </h2>
                <p className="text-sm text-white/80">How your profile matches their preferences</p>
              </div>
          
          <div className="space-y-4">
            <PreferenceMatchRow 
              label="Age" 
              theirPref={`${extendedData.partnerPreferences.minAge} - ${extendedData.partnerPreferences.maxAge} years`}
              yourValue={`${myPreferences.minAge} - ${myPreferences.maxAge} years`}
              matches={preferenceMatches.age}
            />
            <PreferenceMatchRow 
              label="Height" 
              theirPref={`${extendedData.partnerPreferences.minHeight} - ${extendedData.partnerPreferences.maxHeight} cm`}
              yourValue={`${profile.height} cm`}
              matches={preferenceMatches.height}
            />
            <PreferenceMatchRow 
              label="Religion" 
              theirPref={extendedData.partnerPreferences.religions.join(', ')}
              yourValue="Hindu"
              matches={preferenceMatches.religion}
            />
            <PreferenceMatchRow 
              label="Income" 
              theirPref={`Min ₹${(extendedData.partnerPreferences.minIncome / 100000).toFixed(0)}L`}
              yourValue={`₹${((profile.annualIncome || 0) / 100000).toFixed(0)}L`}
              matches={preferenceMatches.income}
            />
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Overall Match</span>
              <span className="text-rose-600 font-bold">{matchCount}/{totalPreferences} criteria met</span>
            </div>
            <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#880E4F] to-[#AD1457] rounded-full transition-all"
                style={{ width: `${(matchCount / totalPreferences) * 100}%` }}
              />
            </div>
          </div>
        </section>

            {/* Trust & Verification Breakdown */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={20} />
                  Trust & Verification
                </h2>
                <p className="text-sm text-white/80">How this profile has been verified</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <VerificationBadge label="Aadhaar Card" verified={extendedData.verifications.aadhaar} />
                <VerificationBadge label="Phone Number" verified={extendedData.verifications.phone} />
                <VerificationBadge label="Email Address" verified={extendedData.verifications.email} />
                <VerificationBadge label="LinkedIn" verified={extendedData.verifications.linkedin} />
                <VerificationBadge label="Selfie Video" verified={extendedData.verifications.selfieVideo} />
                <VerificationBadge label="Income Proof" verified={extendedData.verifications.income} />
              </div>
            </section>

            {/* Location Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Location
                </h2>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{profile.city}, {profile.state}</p>
                  <p className="text-gray-500 text-sm">{profile.country}</p>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <MapPin size={32} className="text-rose-400" />
                </div>
              </div>
            </section>

            {/* Icebreaker Prompts */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-4 sm:px-5 py-3 sm:py-3.5 rounded-t-xl -mx-6 -mt-6 mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <MessageCircle size={20} />
                  Icebreakers
                </h2>
                <p className="text-sm text-white/80">Start a conversation with {profile.name.split(' ')[0]}</p>
              </div>
              
              <div className="space-y-3">
                {icebreakers.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl text-left hover:from-amber-100 hover:to-orange-100 transition-all group border border-amber-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-amber-700">{prompt}</span>
                      <ArrowRight size={18} className="text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Similar Profiles Carousel */}
        <SimilarProfilesCarousel 
          currentProfile={profile} 
          viewProfile={viewProfile}
          shortlistProfile={shortlistProfile}
          shortlisted={shortlisted}
        />

        {/* Desktop Bottom Padding to account for fixed bar */}
        <div className="hidden md:block h-20" />
        </div>
        </main>
      </div>

      {/* Bottom Sticky Action Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-rose-100 shadow-lg z-50 md:hidden safe-area-bottom">
        <div className="max-w-4xl mx-auto px-3 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          {interestSent ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm">
              <Check size={18} className="sm:hidden" />
              <Check size={20} className="hidden sm:block" /> Sent
            </div>
          ) : (
            <button
              onClick={() => sendInterest(profile)}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-sm touch-manipulation"
            >
              <Heart size={18} className="sm:hidden" />
              <Heart size={20} className="hidden sm:block" /> Interest
            </button>
          )}
          <button
            onClick={() => shortlistProfile(profile.userId)}
            className={`p-2.5 sm:p-3 rounded-xl font-medium transition-all touch-manipulation ${
              shortlisted.includes(profile.userId)
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            {shortlisted.includes(profile.userId) ? <Bookmark size={20} className="fill-current sm:hidden" /> : <Bookmark size={20} className="sm:hidden" />}
            {shortlisted.includes(profile.userId) ? <Bookmark size={22} className="fill-current hidden sm:block" /> : <Bookmark size={22} className="hidden sm:block" />}
          </button>
          <button 
            onClick={() => setShowChatModal(true)}
            className="p-2.5 sm:p-3 bg-gradient-to-r from-[#880E4F]/10 to-[#AD1457]/10 text-[#880E4F] rounded-xl font-medium hover:from-[#880E4F]/20 hover:to-[#AD1457]/20 transition-all border border-[#880E4F]/20 touch-manipulation"
          >
            <MessageCircle size={20} className="sm:hidden" />
            <MessageCircle size={22} className="hidden sm:block" />
          </button>
          <button 
            onClick={() => setShowCallModal(true)}
            className="p-2.5 sm:p-3 bg-gradient-to-r from-[#880E4F]/10 to-[#AD1457]/10 text-[#880E4F] rounded-xl font-medium hover:from-[#880E4F]/20 hover:to-[#AD1457]/20 transition-all border border-[#880E4F]/20 touch-manipulation"
          >
            <Phone size={20} className="sm:hidden" />
            <Phone size={22} className="hidden sm:block" />
          </button>
          <button className="p-2.5 sm:p-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all touch-manipulation">
            <Share2 size={20} className="sm:hidden" />
            <Share2 size={22} className="hidden sm:block" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components for ProfileViewPage
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-rose-50/60 rounded-lg border border-rose-100/50">
      <span className="text-gray-600 text-sm text-left">{label}</span>
      <span className="text-gray-800 font-medium text-sm text-right">{value}</span>
    </div>
  );
}

function PreferenceMatchRow({ label, theirPref, yourValue, matches }: { label: string; theirPref: string; yourValue: string; matches: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-rose-50/60 rounded-lg border border-rose-100/50">
      <div>
        <p className="text-gray-800 font-medium">{label}</p>
        <p className="text-gray-500 text-sm">Their preference: {theirPref}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-sm">{yourValue}</span>
        {matches ? (
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check size={14} className="text-emerald-600" />
          </div>
        ) : (
          <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
            <X size={14} className="text-rose-600" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AI FEATURE COMPONENTS
// ============================================================================

// AI Commonalities Section - Shows at top of profile view
function AICommonalitiesSection({ 
  profile, 
  extendedData,
  myProfile,
  myExtendedData
}: { 
  profile: MockProfile;
  extendedData: ExtendedProfileData;
  myProfile: { name: string; religion: string; motherTongue: string; city: string; state: string; education?: string; occupation?: string };
  myExtendedData: ExtendedProfileData;
}) {
  const commonalities = generateAICommonalities(profile, extendedData, myProfile as typeof ghostUserProfile, myExtendedData);
  
  if (commonalities.length === 0) return null;
  
  return (
    <div className="px-4 py-3 bg-gradient-to-r from-[#880E4F]/5 via-[#AD1457]/5 to-[#C2185B]/5 border-t border-[#FCE4EC]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center">
          <Sparkles size={12} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-[#880E4F]">What you have in common</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {commonalities.map((item, i) => (
          <span 
            key={i} 
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              item.highlight 
                ? 'bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white shadow-sm' 
                : 'bg-white text-[#5D0F3A] border border-[#FCE4EC]'
            }`}
          >
            <span>{item.icon}</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

// AI Match Insights Section - Detailed compatibility report
function AIMatchInsightsSection({
  profile,
  extendedData,
  compatibilityScore,
  myPreferences
}: {
  profile: MockProfile;
  extendedData: ExtendedProfileData;
  compatibilityScore: number;
  myPreferences: typeof ghostPartnerPreferences;
}) {
  const insights = generateAICompatibilityInsights(profile, extendedData, myPreferences);
  
  const getTypeColor = (type: AICompatibilityInsight['type']) => {
    switch (type) {
      case 'value': return 'from-violet-500 to-purple-500';
      case 'lifestyle': return 'from-emerald-500 to-teal-500';
      case 'career': return 'from-blue-500 to-cyan-500';
      case 'family': return 'from-pink-500 to-rose-500';
      case 'interest': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-gray-400';
    }
  };
  
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden">
      {/* Maroon Gradient Header Strip */}
      <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-5 py-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white rounded-full"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Match Insights</h2>
              <p className="text-sm text-white/85">Why you&apos;re a {compatibilityScore}% match</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 shadow-sm">
              <Sparkles size={12} className="animate-pulse" />
              AI Powered
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-5 bg-gradient-to-b from-[#FCE4EC]/20 to-white">
        <div className="grid gap-3">
          {insights.map((insight, i) => (
            <div 
              key={i}
              className="flex items-start gap-3.5 p-4 bg-white rounded-xl border border-[#FCE4EC]/60 hover:border-[#F8BBD9]/60 hover:shadow-md transition-all group"
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${getTypeColor(insight.type)} rounded-xl flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="text-xl">{insight.icon}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed pt-2 font-medium">{insight.reason}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-[#880E4F]/5 via-[#AD1457]/5 to-[#C2185B]/5 rounded-xl border border-[#FCE4EC]/60">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={12} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#880E4F]">AI Tip:</span>
              <p className="text-sm text-[#5D0F3A] mt-0.5 leading-relaxed">
                This match has strong compatibility in family values and career goals. Consider starting a conversation about these shared interests!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// AI Message Drafter (Wingman) Component for Messages Page
function AIMessageDrafter({
  profile,
  extendedData,
  onSelectMessage,
  onClose
}: {
  profile: MockProfile;
  extendedData: ExtendedProfileData;
  onSelectMessage: (message: string) => void;
  onClose: () => void;
}) {
  const drafts = generateAIMessageDrafts(profile, extendedData);
  
  const getToneColor = (tone: AIMessageDraft['tone']) => {
    switch (tone) {
      case 'friendly': return 'from-emerald-500 to-teal-500';
      case 'thoughtful': return 'from-blue-500 to-indigo-500';
      case 'playful': return 'from-pink-500 to-rose-500';
      default: return 'from-gray-500 to-gray-400';
    }
  };
  
  const getToneLabel = (tone: AIMessageDraft['tone']) => {
    switch (tone) {
      case 'friendly': return 'Friendly';
      case 'thoughtful': return 'Thoughtful';
      case 'playful': return 'Playful';
      default: return 'Suggested';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#FCE4EC] overflow-hidden max-w-md">
      <div className="bg-gradient-to-r from-[#880E4F] to-[#AD1457] p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Wingman</h3>
              <p className="text-xs text-white/80">3 personalized messages for {profile.name.split(' ')[0]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {drafts.map((draft, i) => (
          <button
            key={i}
            onClick={() => onSelectMessage(draft.message)}
            className="w-full text-left p-3 bg-gray-50 hover:bg-[#FCE4EC] rounded-lg transition-all group border border-transparent hover:border-[#FCE4EC]"
          >
            <div className="flex items-start gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${getToneColor(draft.tone)} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="text-sm">{draft.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${getToneColor(draft.tone)} text-white`}>
                    {getToneLabel(draft.tone)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{draft.message}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">Click a message to use it • You can edit before sending</p>
      </div>
    </div>
  );
}

// AI Profile Optimization Component for Settings Page
function AIProfileOptimizationSection({
  profile,
  extendedData,
  updateProfile
}: {
  profile: typeof ghostUserProfile;
  extendedData: ExtendedProfileData;
  updateProfile: (updates: Partial<typeof ghostUserProfile>) => void;
}) {
  const { score, tips } = calculateMatchabilityScore(profile, extendedData);
  const [showTips, setShowTips] = useState(true);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'stroke-emerald-500' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', ring: 'stroke-amber-500' };
    return { text: 'text-rose-600', bg: 'bg-rose-500', ring: 'stroke-rose-500' };
  };
  
  const scoreColors = getScoreColor(score);
  
  const getImpactBadge = (impact: AIProfileTip['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center shadow-md">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#4A0E25]">Optimize My Profile</h3>
          <p className="text-sm text-gray-500">AI-powered suggestions to improve your matches</p>
        </div>
      </div>
      
      {/* Match-ability Score */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-gradient-to-r from-[#FCE4EC]/50 to-[#FFF0F5]/50 rounded-xl">
        <div className="relative">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="8" fill="none" />
            <circle 
              cx="50" cy="50" r="42" 
              className={scoreColors.ring}
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={`${(score / 100) * 264} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${scoreColors.text}`}>{score}</span>
            <span className="text-[10px] text-gray-400 uppercase">Score</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-[#4A0E25] mb-1">Match-ability Score</h4>
          <p className="text-sm text-gray-600">
            {score >= 80 
              ? "Excellent! Your profile is well optimized for finding matches." 
              : score >= 60 
              ? "Good progress! A few improvements can boost your visibility."
              : "Let's improve your profile to get more matches!"}
          </p>
        </div>
      </div>
      
      {/* Improvement Tips */}
      {tips.length > 0 && (
        <div>
          <button 
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 text-sm font-semibold text-[#880E4F] mb-3 hover:text-[#C2185B] transition-colors"
          >
            <TrendingUp size={16} />
            <span>{tips.length} Tips to Improve</span>
            <ChevronDown size={16} className={`transition-transform ${showTips ? 'rotate-180' : ''}`} />
          </button>
          
          {showTips && (
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#FCE4EC] transition-all"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-base">{tip.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{tip.tip}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${getImpactBadge(tip.impact)}`}>
                      {tip.impact} impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-[#FCE4EC] text-[#880E4F] rounded-lg text-xs font-medium hover:bg-[#F8BBD9] transition-colors flex items-center gap-1">
            <Edit3 size={12} /> Edit Bio
          </button>
          <button className="px-3 py-1.5 bg-[#FCE4EC] text-[#880E4F] rounded-lg text-xs font-medium hover:bg-[#F8BBD9] transition-colors flex items-center gap-1">
            <Camera size={12} /> Add Photos
          </button>
          <button className="px-3 py-1.5 bg-[#FCE4EC] text-[#880E4F] rounded-lg text-xs font-medium hover:bg-[#F8BBD9] transition-colors flex items-center gap-1">
            <ShieldCheck size={12} /> Get Verified
          </button>
        </div>
      </div>
    </div>
  );
}

function VerificationBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className={`p-3 rounded-xl flex items-center gap-2 ${verified ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
      {verified ? (
        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
          <Check size={14} className="text-emerald-600" />
        </div>
      ) : (
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <X size={14} className="text-gray-400" />
        </div>
      )}
      <span className={`text-sm font-medium ${verified ? 'text-emerald-700' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}

// Guna Milan (Horoscope Compatibility) Section Component
interface GunaKoota {
  name: string;
  maxScore: number;
  score: number;
  description: string;
  icon: string;
}

interface GunaMilanResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: 'Excellent' | 'Good' | 'Average' | 'Not Recommended';
  verdictColor: string;
  kootas: GunaKoota[];
}

function calculateGunaMilan(
  boyData: { rashi?: string; nakshatra?: string; manglik?: string; birthTime?: string; birthPlace?: string },
  girlData: { rashi?: string; nakshatra?: string; manglik?: string; birthTime?: string; birthPlace?: string }
): GunaMilanResult {
  // Simplified Guna Milan calculation based on Rashi and Nakshatra
  // In real implementation, this would use actual Vedic astrology algorithms
  
  const nakshatraList = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
    'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttarashada', 'Shravana',
    'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const rashiList = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
  ];

  // Extract nakshatra names
  const getNakshatraIndex = (nakshatra?: string) => {
    if (!nakshatra) return 0;
    const name = nakshatra.split(' ')[0];
    return nakshatraList.findIndex(n => name.toLowerCase().includes(n.toLowerCase())) || 0;
  };

  const getRashiIndex = (rashi?: string) => {
    if (!rashi) return 0;
    const name = rashi.split(' ')[0];
    return rashiList.findIndex(r => name.toLowerCase().includes(r.toLowerCase())) || 0;
  };

  const boyNakshatraIdx = getNakshatraIndex(boyData.nakshatra);
  const girlNakshatraIdx = getNakshatraIndex(girlData.nakshatra);
  const boyRashiIdx = getRashiIndex(boyData.rashi);
  const girlRashiIdx = getRashiIndex(girlData.rashi);

  // Calculate each Koota score (simplified logic)
  const kootas: GunaKoota[] = [
    {
      name: 'Varna',
      maxScore: 1,
      score: (boyRashiIdx % 4) <= (girlRashiIdx % 4) ? 1 : 0,
      description: 'Spiritual compatibility based on caste/varna system',
      icon: '🕉️'
    },
    {
      name: 'Vashya',
      maxScore: 2,
      score: Math.abs(boyRashiIdx - girlRashiIdx) <= 3 ? 2 : 1,
      description: 'Mutual attraction and control in relationship',
      icon: '💫'
    },
    {
      name: 'Tara',
      maxScore: 3,
      score: Math.abs(boyNakshatraIdx - girlNakshatraIdx) % 9 < 3 ? 3 : Math.abs(boyNakshatraIdx - girlNakshatraIdx) % 9 < 6 ? 2 : 1,
      description: 'Health, well-being and longevity of partners',
      icon: '⭐'
    },
    {
      name: 'Yoni',
      maxScore: 4,
      score: Math.abs(boyNakshatraIdx % 14 - girlNakshatraIdx % 14) <= 2 ? 4 : Math.abs(boyNakshatraIdx % 14 - girlNakshatraIdx % 14) <= 5 ? 2 : 1,
      description: 'Sexual compatibility and physical attraction',
      icon: '🦌'
    },
    {
      name: 'Graha Maitri',
      maxScore: 5,
      score: Math.abs(boyRashiIdx - girlRashiIdx) <= 2 ? 5 : Math.abs(boyRashiIdx - girlRashiIdx) <= 5 ? 3 : 1,
      description: 'Mental compatibility and friendship',
      icon: '🪐'
    },
    {
      name: 'Gana',
      maxScore: 6,
      score: (boyNakshatraIdx % 3) === (girlNakshatraIdx % 3) ? 6 : Math.abs((boyNakshatraIdx % 3) - (girlNakshatraIdx % 3)) === 1 ? 3 : 1,
      description: 'Temperament and nature compatibility',
      icon: '🎭'
    },
    {
      name: 'Bhakoot',
      maxScore: 7,
      score: Math.abs(boyRashiIdx - girlRashiIdx) <= 4 ? 7 : Math.abs(boyRashiIdx - girlRashiIdx) <= 6 ? 4 : 0,
      description: 'Relative position of Moon signs',
      icon: '🌙'
    },
    {
      name: 'Nadi',
      maxScore: 8,
      score: (boyNakshatraIdx % 3) !== (girlNakshatraIdx % 3) ? 8 : (boyNakshatraIdx % 3) === (girlNakshatraIdx % 3) && boyNakshatraIdx !== girlNakshatraIdx ? 4 : 0,
      description: 'Health and genes compatibility (most important)',
      icon: '🌊'
    }
  ];

  const totalScore = kootas.reduce((sum, k) => sum + k.score, 0);
  const maxScore = 36;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Determine verdict
  let verdict: GunaMilanResult['verdict'];
  let verdictColor: string;

  if (totalScore >= 28) {
    verdict = 'Excellent';
    verdictColor = 'text-emerald-600 bg-emerald-50';
  } else if (totalScore >= 20) {
    verdict = 'Good';
    verdictColor = 'text-sky-600 bg-sky-50';
  } else if (totalScore >= 14) {
    verdict = 'Average';
    verdictColor = 'text-amber-600 bg-amber-50';
  } else {
    verdict = 'Not Recommended';
    verdictColor = 'text-rose-600 bg-rose-50';
  }

  return { totalScore, maxScore, percentage, verdict, verdictColor, kootas };
}

function GunaMilanSection({
  profile,
  extendedData,
  myProfile
}: {
  profile: MockProfile;
  extendedData: ExtendedProfileData;
  myProfile: { rashi?: string; nakshatra?: string; manglik?: string; birthTime?: string; birthPlace?: string };
}) {
  const [showBirthDetailsModal, setShowBirthDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [birthDetails, setBirthDetails] = useState({
    birthTime: myProfile.birthTime || '',
    birthPlace: myProfile.birthPlace || ''
  });

  // Calculate Guna Milan
  const gunaResult = calculateGunaMilan(
    { rashi: extendedData.rashi, nakshatra: extendedData.nakshatra, manglik: extendedData.manglik },
    { rashi: myProfile.rashi, nakshatra: myProfile.nakshatra, manglik: myProfile.manglik }
  );

  const hasBirthDetails = extendedData.birthTime && extendedData.birthPlace;

  return (
    <>
      {/* Guna Milan Score Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-[#FCE4EC] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-xl flex items-center justify-center shadow-md">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Guna Milan (Horoscope Match)</h2>
            <p className="text-sm text-gray-500">Traditional Vedic astrology compatibility analysis</p>
          </div>
        </div>

        {/* Main Score Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FCE4EC] to-[#FFF0F5] rounded-2xl">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle 
                  cx="80" cy="80" r="70" 
                  stroke="#F8BBD9" 
                  strokeWidth="12" 
                  fill="none" 
                />
                <circle 
                  cx="80" cy="80" r="70" 
                  stroke="url(#gunaGradient)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray={`${(gunaResult.totalScore / gunaResult.maxScore) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gunaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#880E4F" />
                    <stop offset="50%" stopColor="#AD1457" />
                    <stop offset="100%" stopColor="#C2185B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#880E4F]">{gunaResult.totalScore}</span>
                <span className="text-lg text-gray-500">/ {gunaResult.maxScore}</span>
              </div>
            </div>
            
            {/* Gunas Matched Label - Outside Circle, Centered */}
            <p className="text-sm text-[#AD1457] font-semibold mt-3 text-center">Gunas Matched</p>
            
            {/* Compatibility Percentage */}
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-[#880E4F]">{gunaResult.percentage}% Compatible</p>
              <div className={`mt-2 px-4 py-2 rounded-full text-sm font-semibold ${gunaResult.verdictColor}`}>
                {gunaResult.verdict} Match
              </div>
            </div>
          </div>

          {/* Birth Details Card */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-violet-600" />
                <h3 className="font-semibold text-violet-800">Your Birth Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Rashi:</span> <span className="font-medium">{myProfile.rashi || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Nakshatra:</span> <span className="font-medium">{myProfile.nakshatra || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Birth Time:</span> <span className="font-medium">{myProfile.birthTime || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Birth Place:</span> <span className="font-medium">{myProfile.birthPlace || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Manglik:</span> <span className="font-medium">{myProfile.manglik || 'Not specified'}</span></div>
              </div>
              <button 
                onClick={() => setShowBirthDetailsModal(true)}
                className="mt-3 w-full py-2 text-sm text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
              >
                Update Birth Details
              </button>
            </div>

            <div className="p-4 bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] rounded-xl border border-[#F8BBD9]">
              <div className="flex items-center gap-2 mb-3">
                <Star size={18} className="text-[#AD1457]" />
                <h3 className="font-semibold text-[#880E4F]">{profile.name.split(' ')[0]}'s Birth Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Rashi:</span> <span className="font-medium">{extendedData.rashi || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Nakshatra:</span> <span className="font-medium">{extendedData.nakshatra || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Birth Time:</span> <span className="font-medium">{extendedData.birthTime || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Birth Place:</span> <span className="font-medium">{extendedData.birthPlace || 'Not specified'}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Manglik:</span> <span className="font-medium">{extendedData.manglik}</span></div>
                <div className="px-2 py-1.5 bg-white/60 rounded-lg"><span className="text-gray-500">Gothra:</span> <span className="font-medium">{extendedData.gothra || 'Not specified'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Koota Breakdown */}
        <div className="border-t border-[#FCE4EC] pt-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={18} className="text-[#AD1457]" />
            Detailed Koota Breakdown (Ashtakoota Milan)
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {gunaResult.kootas.map((koota, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#F8BBD9] hover:bg-[#FFF0F5] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{koota.icon}</span>
                  <span className={`text-sm font-bold ${koota.score >= koota.maxScore * 0.7 ? 'text-emerald-600' : koota.score >= koota.maxScore * 0.4 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {koota.score}/{koota.maxScore}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800">{koota.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{koota.description}</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${koota.score >= koota.maxScore * 0.7 ? 'bg-emerald-500' : koota.score >= koota.maxScore * 0.4 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${(koota.score / koota.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manglik Dosha Warning */}
        {(extendedData.manglik === 'Yes' || extendedData.manglik === 'Anshik') && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800">Manglik Dosha Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {extendedData.manglik === 'Yes' 
                    ? `${profile.name.split(' ')[0]} has Manglik Dosha. We recommend detailed Kundali matching to understand the implications.`
                    : `${profile.name.split(' ')[0]} has Anshik (partial) Manglik Dosha. This may have minor implications on compatibility.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Get Detailed Report Button */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#880E4F] to-[#AD1457] rounded-xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg">Get Detailed Horoscope Report</h4>
              <p className="text-white/80 text-sm">Complete Kundali matching with remedies and predictions</p>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-white text-[#880E4F] rounded-xl font-bold hover:bg-[#FCE4EC] transition-colors shadow-lg flex items-center gap-2"
            >
              <IndianRupee size={18} />
              Get Report - ₹49
            </button>
          </div>
        </div>
      </section>

      {/* Quick Compatibility Summary */}
      <section className="bg-white rounded-2xl shadow-sm border border-[#FCE4EC] p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[#AD1457]" />
          Compatibility Insights
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span className="font-semibold text-emerald-800">Strengths</span>
            </div>
            <ul className="text-sm text-emerald-700 space-y-1">
              {gunaResult.kootas.filter(k => k.score >= k.maxScore * 0.7).slice(0, 2).map((k, i) => (
                <li key={i}>• Strong {k.name} compatibility</li>
              ))}
              {gunaResult.totalScore >= 20 && <li>• Overall good horoscope match</li>}
            </ul>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <span className="font-semibold text-amber-800">Considerations</span>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              {gunaResult.kootas.filter(k => k.score < k.maxScore * 0.5).slice(0, 2).map((k, i) => (
                <li key={i}>• {k.name} may need attention</li>
              ))}
              {!hasBirthDetails && <li>• Complete birth details for accuracy</li>}
            </ul>
          </div>
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-violet-600" />
              <span className="font-semibold text-violet-800">Recommendation</span>
            </div>
            <p className="text-sm text-violet-700">
              {gunaResult.verdict === 'Excellent' && 'Highly compatible match! Proceed with confidence.'}
              {gunaResult.verdict === 'Good' && 'Good compatibility. Consider meeting to know each other better.'}
              {gunaResult.verdict === 'Average' && 'Average match. Consult family astrologer for detailed analysis.'}
              {gunaResult.verdict === 'Not Recommended' && 'Low compatibility. Detailed Kundali analysis recommended before proceeding.'}
            </p>
          </div>
        </div>
      </section>

      {/* Birth Details Update Modal */}
      {showBirthDetailsModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Update Birth Details</h3>
                <button onClick={() => setShowBirthDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Accurate birth details help calculate precise Guna Milan scores.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Time</label>
                  <input 
                    type="time"
                    value={birthDetails.birthTime}
                    onChange={(e) => setBirthDetails({...birthDetails, birthTime: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AD1457] focus:border-[#AD1457]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                  <input 
                    type="text"
                    placeholder="e.g., Mumbai"
                    value={birthDetails.birthPlace}
                    onChange={(e) => setBirthDetails({...birthDetails, birthPlace: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#AD1457] focus:border-[#AD1457]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowBirthDetailsModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowBirthDetailsModal(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all"
                >
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal for Detailed Report */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Detailed Horoscope Report</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] rounded-xl mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Detailed Kundali Report</span>
                  <span className="font-bold text-[#880E4F]">₹49</span>
                </div>
                <p className="text-xs text-gray-500">Includes complete Ashtakoota analysis, Manglik dosha remedies, and future predictions</p>
              </div>

              <div className="space-y-3 mb-4">
                <h4 className="font-semibold text-gray-800">Report Includes:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Complete 36 Guna analysis</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Manglik Dosha assessment</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Remedies & suggestions</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Future predictions</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> PDF download</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all flex items-center justify-center gap-2">
                  <CreditCard size={18} /> Pay ₹49 with Card
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Wallet size={18} /> Pay with UPI
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                🔒 Secure payment • Instant delivery • 100% money-back guarantee
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Similar Profiles Carousel Component
function SimilarProfilesCarousel({
  currentProfile,
  viewProfile,
  shortlistProfile,
  shortlisted,
}: {
  currentProfile: MockProfile;
  viewProfile: (id: string) => void;
  shortlistProfile: (id: string) => void;
  shortlisted: string[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get score color helper
  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", progress: "bg-emerald-500" };
    if (score >= 70) return { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", progress: "bg-sky-500" };
    if (score >= 55) return { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", progress: "bg-amber-500" };
    return { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", progress: "bg-rose-500" };
  };

  // Find similar profiles based on religion, city, and age range
  // Show profiles of the SAME gender (if viewing a bride, show similar brides you might like)
  const similarProfiles = useMemo(() => {
    return mockProfiles
      .filter(p => 
        p.userId !== currentProfile.userId && 
        p.gender === currentProfile.gender &&
        (
          p.religion === currentProfile.religion ||
          p.city === currentProfile.city ||
          Math.abs(p.age - currentProfile.age) <= 3
        )
      )
      .slice(0, 6)
      .map(p => ({
        ...p,
        compatibilityScore: calculateCompatibility(p, ghostPartnerPreferences),
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [currentProfile]);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (similarProfiles.length === 0) return null;

  // Determine the label based on the current profile's gender
  const profileType = currentProfile.gender === 'FEMALE' ? 'brides' : 'grooms';
  const profileGender = currentProfile.gender === 'FEMALE' ? 'her' : 'his';

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden">
      {/* Maroon Gradient Header Strip */}
      <div className="bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] px-5 py-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white rounded-full"></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <Heart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Similar {profileType.charAt(0).toUpperCase() + profileType.slice(1)} You Might Like</h2>
              <p className="text-sm text-white/85">Profiles matching {currentProfile.name.split(' ')[0]}'s preferences</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                canScrollLeft 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                canScrollRight 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Content */}
      <div className="p-5">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {similarProfiles.map((profile) => {
          const scoreColors = getScoreColor(profile.compatibilityScore);
          
          const handleViewProfile = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            viewProfile(profile.userId);
          };
          
          return (
            <div
              key={profile.userId}
              className="flex-shrink-0 w-64 bg-gradient-to-br from-gray-50 to-rose-50/30 rounded-2xl border border-rose-100 overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all cursor-pointer group"
              onClick={handleViewProfile}
            >
              {/* Photo */}
              <div className="relative h-36 bg-gradient-to-br from-rose-200/60 via-pink-100/60 to-rose-200/60 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <User size={32} className="text-rose-400" />
                </div>
                
                <div className={`absolute top-2 right-2 ${scoreColors.bg} ${scoreColors.text} px-2 py-0.5 rounded-full text-xs font-bold`}>
                  {profile.compatibilityScore}%
                </div>

                {profile.isPremium && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-1 rounded-full shadow-md">
                    <Crown size={10} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-gray-800 truncate">{profile.name}</h3>
                <p className="text-gray-500 text-sm truncate">{profile.age} yrs • {profile.city}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs">{profile.religion}</span>
                  <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-xs">{profile.motherTongue}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}
                    className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); shortlistProfile(profile.userId); }}
                    className={`p-2 rounded-lg transition-all ${
                      shortlisted.includes(profile.userId)
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500'
                    }`}
                  >
                    {shortlisted.includes(profile.userId) ? <StarOff size={18} /> : <Star size={18} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER PAGES
// ============================================================================

// Generic Page Layout Component
function InfoPageLayout({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-[#FCE4EC] overflow-hidden">
        <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon size={28} />
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Customer Support Page
function SupportPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <InfoPageLayout title="Customer Support" icon={MessageCircle}>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-[#4A0E25] mb-4">Get in Touch</h2>
          <p className="text-[#5D0F3A] mb-6">
            Our dedicated support team is here to help you with any questions or concerns. 
            We typically respond within 24 hours.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[#FFF0F5] rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-[#5D0F3A]">Call Us</p>
                <p className="font-semibold text-[#4A0E25]">+91 1800-123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#FFF0F5] rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                <Mail size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-[#5D0F3A]">Email Us</p>
                <p className="font-semibold text-[#4A0E25]">support@happyjodivibes.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#FFF0F5] rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-[#5D0F3A]">Working Hours</p>
                <p className="font-semibold text-[#4A0E25]">Mon-Sat, 9AM - 8PM IST</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-[#4A0E25] mb-4">Send us a Message</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-[#F8BBD9] rounded-lg focus:ring-2 focus:ring-[#EC407A]"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border border-[#F8BBD9] rounded-lg focus:ring-2 focus:ring-[#EC407A]"
            required
          />
          <select
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full p-3 border border-[#F8BBD9] rounded-lg focus:ring-2 focus:ring-[#EC407A]"
            required
          >
            <option value="">Select Subject</option>
            <option value="profile">Profile Issues</option>
            <option value="payment">Payment & Subscription</option>
            <option value="matches">Matches & Compatibility</option>
            <option value="safety">Safety & Security</option>
            <option value="other">Other</option>
          </select>
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={4}
            className="w-full p-3 border border-[#F8BBD9] rounded-lg focus:ring-2 focus:ring-[#EC407A]"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </InfoPageLayout>
  );
}

// Safety Tips Page
function SafetyTipsPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const tips = [
    {
      title: "Protect Your Personal Information",
      icon: Lock,
      content: "Never share sensitive personal information like your home address, financial details, or workplace location until you've met the person and established trust."
    },
    {
      title: "Verify Profiles Before Meeting",
      icon: BadgeCheck,
      content: "Look for verified profiles with the blue checkmark. Ask for video calls before meeting in person to ensure the person matches their profile photos."
    },
    {
      title: "Meet in Public Places",
      icon: MapPin,
      content: "Always choose public, well-lit locations for your first few meetings. Inform a friend or family member about your meeting plans and location."
    },
    {
      title: "Report Suspicious Behavior",
      icon: Shield,
      content: "If someone asks for money, makes you uncomfortable, or seems suspicious, report them immediately using the 'Report' button on their profile."
    },
    {
      title: "Take Your Time",
      icon: Clock,
      content: "Don't rush into sharing contact details or meeting in person. Build trust through conversations on our platform first."
    },
    {
      title: "Trust Your Instincts",
      icon: Heart,
      content: "If something feels wrong, it probably is. Your safety is our priority. Don't hesitate to end conversations that make you uncomfortable."
    }
  ];

  return (
    <InfoPageLayout title="Safety Tips" icon={Shield}>
      <p className="text-[#5D0F3A] mb-6">
        Your safety is our top priority. Please follow these guidelines to ensure a safe and positive experience on Happy Jodi Vibes.
      </p>
      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div key={i} className="p-4 bg-[#FFF0F5] rounded-xl border border-[#FCE4EC]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center flex-shrink-0">
                <tip.icon size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#4A0E25] mb-2">{tip.title}</h3>
                <p className="text-[#5D0F3A] text-sm">{tip.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-[#880E4F] to-[#C2185B] rounded-xl text-white">
        <p className="font-semibold mb-2">Need Help?</p>
        <p className="text-sm text-white/90 mb-3">If you encounter any safety issues, please contact our support team immediately.</p>
        <button
          onClick={() => onNavigate('support')}
          className="px-4 py-2 bg-white text-[#880E4F] rounded-lg font-medium hover:bg-[#FCE4EC] transition-colors"
        >
          Contact Support
        </button>
      </div>
    </InfoPageLayout>
  );
}

// FAQ Page
function FAQPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "How do I create a profile?",
      answer: "Click on 'Register Free' and fill in your basic details including name, age, gender, and preferences. You can then complete your profile by adding photos, education, occupation, and family details."
    },
    {
      question: "How does the matching algorithm work?",
      answer: "Our AI-powered matching algorithm considers factors like age, location, religion, education, income, and partner preferences to calculate a compatibility score. Profiles with higher compatibility scores are shown first."
    },
    {
      question: "What are the benefits of Premium membership?",
      answer: "Premium members can view contact details, send unlimited interests, use advanced filters, get priority listing in searches, and access dedicated customer support."
    },
    {
      question: "How do I send an interest to someone?",
      answer: "Visit any profile and click the 'Send Interest' button. You can optionally add a personal message. The recipient will be notified and can accept or decline your interest."
    },
    {
      question: "How do I start messaging with someone?",
      answer: "You can only message profiles that have accepted your interest request. Once accepted, go to the Messages page to start your conversation."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we use end-to-end encryption for all communications. Your contact details are only shared with profiles you've accepted. We never sell or share your data with third parties."
    },
    {
      question: "How do I report a fake profile?",
      answer: "Click on the 'More' button (three dots) on any profile and select 'Report'. Choose the reason for reporting and submit. Our team will investigate within 24 hours."
    },
    {
      question: "Can I hide my profile temporarily?",
      answer: "Yes, go to Settings > Privacy and change your profile visibility to 'Hidden'. Your profile won't appear in searches until you change it back."
    }
  ];

  return (
    <InfoPageLayout title="Frequently Asked Questions" icon={Sparkles}>
      <p className="text-[#5D0F3A] mb-6">
        Find answers to common questions about using Happy Jodi Vibes. Can't find what you're looking for? <button onClick={() => onNavigate('support')} className="text-[#C2185B] hover:underline">Contact our support team</button>.
      </p>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-[#FCE4EC] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-4 text-left flex items-center justify-between bg-[#FFF0F5] hover:bg-[#FFE4E1] transition-colors"
            >
              <span className="font-medium text-[#4A0E25]">{faq.question}</span>
              <ChevronDown size={20} className={`text-[#C2185B] transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="p-4 bg-white border-t border-[#FCE4EC]">
                <p className="text-[#5D0F3A]">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}

// About Us Page
function AboutPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const stats = [
    { value: "5M+", label: "Active Profiles" },
    { value: "2M+", label: "Successful Matches" },
    { value: "98%", label: "Success Rate" },
    { value: "15+", label: "Years of Trust" }
  ];

  return (
    <InfoPageLayout title="About Us" icon={Users}>
      <div className="prose prose-pink max-w-none">
        <p className="text-[#5D0F3A] text-lg mb-6">
          Happy Jodi Vibes is India's most trusted matrimonial platform, dedicated to helping millions of people find their perfect life partner. Since our inception, we've been at the forefront of combining traditional matchmaking values with modern technology.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-4 bg-[#FFF0F5] rounded-xl">
              <div className="text-2xl font-bold text-[#C2185B]">{stat.value}</div>
              <div className="text-sm text-[#5D0F3A]">{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-[#4A0E25] mb-4">Our Mission</h2>
        <p className="text-[#5D0F3A] mb-6">
          Our mission is to empower individuals and families in their search for a compatible life partner through a safe, reliable, and technologically advanced platform that respects cultural values and traditions.
        </p>

        <h2 className="text-xl font-semibold text-[#4A0E25] mb-4">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            { title: "Trust", desc: "We verify profiles to ensure authenticity and safety" },
            { title: "Privacy", desc: "Your personal information is protected with us" },
            { title: "Innovation", desc: "AI-powered matching for better compatibility" },
            { title: "Service", desc: "24/7 customer support for all your needs" }
          ].map((value, i) => (
            <div key={i} className="p-4 bg-[#FFF0F5] rounded-xl">
              <h3 className="font-semibold text-[#4A0E25]">{value.title}</h3>
              <p className="text-sm text-[#5D0F3A]">{value.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-[#4A0E25] mb-4">Our Team</h2>
        <p className="text-[#5D0F3A]">
          We're a team of 500+ passionate individuals working across technology, customer service, and operations to ensure you have the best matchmaking experience. Our team understands the importance of finding the right life partner and works tirelessly to make it happen.
        </p>
      </div>
    </InfoPageLayout>
  );
}

// Careers Page
function CareersPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const jobs = [
    { title: "Senior Software Engineer", dept: "Engineering", location: "Mumbai", type: "Full-time" },
    { title: "Product Manager", dept: "Product", location: "Bangalore", type: "Full-time" },
    { title: "UX Designer", dept: "Design", location: "Mumbai", type: "Full-time" },
    { title: "Customer Success Manager", dept: "Operations", location: "Delhi", type: "Full-time" },
    { title: "Data Scientist", dept: "Data", location: "Bangalore", type: "Full-time" },
    { title: "Content Writer", dept: "Marketing", location: "Remote", type: "Full-time" }
  ];

  return (
    <InfoPageLayout title="Careers" icon={Briefcase}>
      <p className="text-[#5D0F3A] mb-6">
        Join our team and help millions of people find their perfect life partner. We're always looking for talented individuals who share our passion for making meaningful connections.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { icon: TrendingUp, title: "Growth", desc: "Fast career growth opportunities" },
          { icon: Heart, title: "Culture", desc: "Inclusive and supportive workplace" },
          { icon: GraduationCap, title: "Learning", desc: "Continuous learning programs" },
          { icon: Award, title: "Benefits", desc: "Competitive salary and benefits" }
        ].map((perk, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-[#FFF0F5] rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
              <perk.icon size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#4A0E25]">{perk.title}</h3>
              <p className="text-sm text-[#5D0F3A]">{perk.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#4A0E25] mb-4">Open Positions</h2>
      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div key={i} className="p-4 border border-[#FCE4EC] rounded-xl hover:border-[#C2185B] transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-[#4A0E25]">{job.title}</h3>
                <p className="text-sm text-[#5D0F3A]">{job.dept} • {job.location} • {job.type}</p>
              </div>
              <button className="px-4 py-2 bg-[#880E4F] text-white text-sm rounded-lg hover:bg-[#5D0F3A] transition-colors">
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}

// Contact Page
function ContactPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const offices = [
    { city: "Mumbai", address: "Happy Jodi Vibes, 123 Business Park, Andheri East, Mumbai 400069", phone: "+91 22 1234 5678" },
    { city: "Bangalore", address: "Happy Jodi Vibes, Tech Park, Whitefield, Bangalore 560066", phone: "+91 80 1234 5678" },
    { city: "Delhi", address: "Happy Jodi Vibes, Cyber Hub, Gurugram 122002", phone: "+91 124 123 4567" }
  ];

  return (
    <InfoPageLayout title="Contact Us" icon={Mail}>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-[#4A0E25] mb-4">Our Offices</h2>
          <div className="space-y-4">
            {offices.map((office, i) => (
              <div key={i} className="p-4 bg-[#FFF0F5] rounded-xl">
                <h3 className="font-semibold text-[#4A0E25] mb-2">{office.city}</h3>
                <p className="text-sm text-[#5D0F3A] mb-2">{office.address}</p>
                <p className="text-sm text-[#C2185B] flex items-center gap-2">
                  <Phone size={14} /> {office.phone}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#4A0E25] mb-4">Quick Contact</h2>
          <div className="space-y-4">
            <div className="p-4 bg-[#FFF0F5] rounded-xl">
              <h3 className="font-semibold text-[#4A0E25] mb-2">Customer Support</h3>
              <p className="text-sm text-[#5D0F3A] mb-2">For general inquiries and support</p>
              <p className="text-[#C2185B]">support@happyjodivibes.com</p>
            </div>
            <div className="p-4 bg-[#FFF0F5] rounded-xl">
              <h3 className="font-semibold text-[#4A0E25] mb-2">Business Inquiries</h3>
              <p className="text-sm text-[#5D0F3A] mb-2">For partnerships and business</p>
              <p className="text-[#C2185B]">business@happyjodivibes.com</p>
            </div>
            <div className="p-4 bg-[#FFF0F5] rounded-xl">
              <h3 className="font-semibold text-[#4A0E25] mb-2">Press & Media</h3>
              <p className="text-sm text-[#5D0F3A] mb-2">For media and press inquiries</p>
              <p className="text-[#C2185B]">press@happyjodivibes.com</p>
            </div>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}

// Terms of Use Page
function TermsPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <InfoPageLayout title="Terms of Use" icon={Lock}>
      <div className="prose prose-pink max-w-none text-[#5D0F3A]">
        <p className="text-sm mb-6">Last updated: January 2024</p>
        
        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">By accessing and using Happy Jodi Vibes, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use our services.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">2. User Registration</h2>
        <p className="mb-4">You must be at least 18 years old to create an account. You agree to provide accurate and complete information during registration and to keep your account information updated.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">3. User Conduct</h2>
        <p className="mb-2">You agree not to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Provide false information in your profile</li>
          <li>Use the platform for any illegal purpose</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Share inappropriate or offensive content</li>
          <li>Attempt to access other users' accounts</li>
        </ul>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">4. Profile Verification</h2>
        <p className="mb-4">We reserve the right to verify profiles and documents submitted by users. Profiles found to contain false information will be suspended or removed.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">5. Payment & Refunds</h2>
        <p className="mb-4">Premium membership fees are non-refundable except in cases of technical issues or at our discretion. All prices are in Indian Rupees unless otherwise specified.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">6. Termination</h2>
        <p className="mb-4">We may terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">7. Contact</h2>
        <p>For questions about these Terms, please contact us at <button onClick={() => onNavigate('contact')} className="text-[#C2185B] hover:underline">legal@happyjodivibes.com</button></p>
      </div>
    </InfoPageLayout>
  );
}

// Privacy Policy Page
function PrivacyPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <InfoPageLayout title="Privacy Policy" icon={Shield}>
      <div className="prose prose-pink max-w-none text-[#5D0F3A]">
        <p className="text-sm mb-6">Last updated: January 2024</p>
        
        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">1. Information We Collect</h2>
        <p className="mb-4">We collect information you provide directly, including name, email, phone number, photos, education, occupation, and family details. We also collect usage data and device information.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="mb-2">Your information is used to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Provide and improve our matchmaking services</li>
          <li>Calculate compatibility scores</li>
          <li>Send notifications and updates</li>
          <li>Ensure platform safety and security</li>
          <li>Provide customer support</li>
        </ul>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">3. Information Sharing</h2>
        <p className="mb-4">We do not sell your personal information. We share your profile with other users based on your privacy settings. Contact details are only shared with profiles you've accepted.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">4. Data Security</h2>
        <p className="mb-4">We use industry-standard encryption and security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">5. Your Rights</h2>
        <p className="mb-4">You have the right to access, correct, or delete your personal data. You can manage your privacy settings from your account or contact us for assistance.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">6. Cookies</h2>
        <p className="mb-4">We use cookies to enhance your experience. You can manage cookie preferences through your browser settings. See our <button onClick={() => onNavigate('cookies')} className="text-[#C2185B] hover:underline">Cookie Policy</button> for details.</p>
      </div>
    </InfoPageLayout>
  );
}

// Verification Page
function VerificationPage({
  onNavigate,
  verificationStatus,
  updateVerificationStatus,
  digilockerData,
  updateDigilockerData
}: {
  onNavigate: (page: Page) => void;
  verificationStatus: {
    aadhaar: 'pending' | 'verified';
    linkedin: 'pending' | 'verified';
    selfie: 'pending' | 'verified';
    manual: 'pending' | 'verified';
    digilocker: 'pending' | 'verified';
    liveness: 'pending' | 'verified';
  };
  updateVerificationStatus: (type: 'aadhaar' | 'linkedin' | 'selfie' | 'manual' | 'digilocker' | 'liveness', status: 'pending' | 'verified') => void;
  digilockerData?: {
    education: { degree: string; institution: string; year: string; verified: boolean }[];
    employment: { company: string; designation: string; duration: string; verified: boolean }[];
  };
  updateDigilockerData?: (data: {
    education: { degree: string; institution: string; year: string; verified: boolean }[];
    employment: { company: string; designation: string; duration: string; verified: boolean }[];
  }) => void;
}) {
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);

  // Aadhaar state
  const [aadhaarStep, setAadhaarStep] = useState<'input' | 'otp' | 'success'>('input');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // LinkedIn state
  const [linkedinStep, setLinkedinStep] = useState<'connect' | 'verifying' | 'success'>('connect');

  // Selfie state with Liveness Check
  const [selfieStep, setSelfieStep] = useState<'capture' | 'liveness' | 'uploading' | 'success'>('capture');
  const [livenessAction, setLivenessAction] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [livenessComplete, setLivenessComplete] = useState(false);
  
  // Liveness actions
  const livenessActions = [
    { instruction: "Please blink slowly", icon: "👁️", action: "blink" },
    { instruction: "Turn your head slightly left", icon: "←", action: "turn_left" },
    { instruction: "Turn your head slightly right", icon: "→", action: "turn_right" },
    { instruction: "Smile naturally", icon: "😊", action: "smile" },
  ];

  // Manual visit state
  const [manualStep, setManualStep] = useState<'form' | 'submitted' | 'success'>('form');
  const [manualForm, setManualForm] = useState({
    address: '',
    city: '',
    pincode: '',
    preferredDate: '',
    preferredTime: '',
  });

  // DigiLocker state
  const [digilockerStep, setDigilockerStep] = useState<'connect' | 'authorizing' | 'fetching' | 'success'>('connect');

  const verificationOptions = [
    {
      id: 'aadhaar',
      title: 'Aadhaar e-KYC',
      description: 'Verify your identity using Aadhaar OTP authentication',
      icon: ShieldCheck,
      badge: 'Govt Verified',
      badgeColor: 'bg-green-500',
      time: '2-3 mins',
      benefit: 'Get a "Govt Verified" badge on your profile',
      prominent: true,
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Verification',
      description: 'Verify your professional identity via LinkedIn',
      icon: Linkedin,
      badge: 'Professional',
      badgeColor: 'bg-blue-600',
      time: '1-2 mins',
      benefit: 'Boost credibility with professional verification',
    },
    {
      id: 'selfie',
      title: 'Selfie Verification + Liveness',
      description: 'Take a selfie with liveness check to prevent fraud',
      icon: Camera,
      badge: 'Photo Verified',
      badgeColor: 'bg-purple-500',
      time: '2 mins',
      benefit: 'AI-powered anti-catfishing protection with liveness check',
    },
    {
      id: 'digilocker',
      title: 'DigiLocker Verification',
      description: 'Pull verified education & employment certificates',
      icon: FileText,
      badge: 'Gold Trust',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      time: '2-3 mins',
      benefit: 'Get "Gold Trust" badge with verified credentials',
      isGold: true,
    },
    {
      id: 'manual',
      title: 'Manual Visit Verification',
      description: 'Request a physical verification visit (Premium)',
      icon: Home,
      badge: 'Premium',
      badgeColor: 'bg-amber-500',
      time: '3-5 days',
      benefit: 'Highest trust level with in-person verification',
    },
  ];

  // Aadhaar handlers
  const handleAadhaarSubmit = () => {
    if (aadhaarNumber.replace(/\s/g, '').length >= 12) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setAadhaarStep('otp');
      }, 1500);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length >= 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setAadhaarStep('success');
        updateVerificationStatus('aadhaar', 'verified');
      }, 2000);
    }
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  // LinkedIn handler
  const handleLinkedInConnect = () => {
    setLinkedinStep('verifying');
    setTimeout(() => {
      setLinkedinStep('success');
      updateVerificationStatus('linkedin', 'verified');
    }, 2500);
  };

  // Selfie handler with liveness check
  const handleSelfieCapture = () => {
    setSelfieStep('liveness');
    setCountdown(5);
    setLivenessAction(0);
  };

  // Countdown timer for liveness check
  useEffect(() => {
    if (selfieStep === 'liveness' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1 && livenessAction < livenessActions.length - 1) {
          setLivenessAction(livenessAction + 1);
          setCountdown(5);
        } else if (countdown === 1 && livenessAction === livenessActions.length - 1) {
          setLivenessComplete(true);
          setSelfieStep('uploading');
          setTimeout(() => {
            setSelfieStep('success');
            updateVerificationStatus('selfie', 'verified');
            updateVerificationStatus('liveness', 'verified');
          }, 2000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selfieStep, countdown, livenessAction, updateVerificationStatus, livenessActions.length]);

  // DigiLocker handler
  const handleDigiLockerConnect = () => {
    setDigilockerStep('authorizing');
    setTimeout(() => {
      setDigilockerStep('fetching');
      setTimeout(() => {
        setDigilockerStep('success');
        updateVerificationStatus('digilocker', 'verified');
        // Mock DigiLocker data
        if (updateDigilockerData) {
          updateDigilockerData({
            education: [
              { degree: "B.Tech Computer Science", institution: "IIT Delhi", year: "2019", verified: true },
              { degree: "Higher Secondary", institution: "Delhi Public School", year: "2015", verified: true },
            ],
            employment: [
              { company: "Google India", designation: "Software Engineer", duration: "2020 - Present", verified: true },
              { company: "Microsoft", designation: "Intern", duration: "2019", verified: true },
            ]
          });
        }
      }, 2000);
    }, 2000);
  };

  // Manual visit handler
  const handleManualSubmit = () => {
    if (manualForm.address && manualForm.city && manualForm.pincode) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setManualStep('submitted');
        updateVerificationStatus('manual', 'verified');
      }, 2000);
    }
  };

  const countVerified = Object.values(verificationStatus).filter(s => s === 'verified').length;

  // Aadhaar verification flow
  if (selectedVerification === 'aadhaar') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => { setSelectedVerification(null); setAadhaarStep('input'); setAadhaarNumber(''); setOtp(''); }}
            className="flex items-center gap-2 text-[#880E4F] mb-6 hover:underline"
          >
            <ArrowLeft size={20} /> Back to verification options
          </button>

          <Card className="border-2 border-[#FCE4EC] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <CardTitle>Aadhaar e-KYC Verification</CardTitle>
                  <p className="text-white/80 text-sm">Secure identity verification</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {aadhaarStep === 'input' && (
                <div className="space-y-6">
                  <div className="bg-[#FCE4EC] rounded-xl p-4 flex items-start gap-3">
                    <Lock size={20} className="text-[#880E4F] mt-0.5" />
                    <p className="text-sm text-[#5D0F3A]">
                      Your Aadhaar data is encrypted and secure. We only verify your identity, your Aadhaar number is not stored.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-2">Enter your 12-digit Aadhaar Number</label>
                    <Input
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                      placeholder="XXXX XXXX XXXX"
                      className="text-lg tracking-wider text-center border-2 border-[#F8BBD9] focus:border-[#C2185B]"
                      maxLength={14}
                    />
                    <p className="text-xs text-[#5D0F3A] mt-2 text-center">{aadhaarNumber.replace(/\s/g, '').length}/12 digits entered</p>
                  </div>
                  <Button
                    onClick={handleAadhaarSubmit}
                    disabled={aadhaarNumber.replace(/\s/g, '').length < 12 || isLoading}
                    className="w-full bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3 rounded-xl font-semibold"
                  >
                    {isLoading ? <><Loader2 className="animate-spin mr-2" size={18} /> Sending OTP...</> : 'Send OTP to Aadhaar Mobile'}
                  </Button>
                </div>
              )}

              {aadhaarStep === 'otp' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">OTP Sent Successfully</p>
                      <p className="text-xs text-green-600">Enter the 6-digit OTP sent to your Aadhaar registered mobile</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A0E25] mb-4 text-center">Enter 6-digit OTP</label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                          <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button
                    onClick={handleOtpSubmit}
                    disabled={otp.length < 6 || isLoading}
                    className="w-full bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3 rounded-xl font-semibold"
                  >
                    {isLoading ? <><Loader2 className="animate-spin mr-2" size={18} /> Verifying...</> : 'Verify & Complete'}
                  </Button>
                  <p className="text-xs text-center text-[#5D0F3A]">
                    Didn&apos;t receive OTP? <button className="text-[#C2185B] font-medium hover:underline">Resend OTP</button>
                  </p>
                </div>
              )}

              {aadhaarStep === 'success' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4A0E25]">Verification Complete!</h3>
                    <p className="text-[#5D0F3A] mt-2">Your profile is now Govt Verified</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full inline-flex items-center gap-2">
                    <ShieldCheck size={18} /> Govt Verified
                  </div>
                  <Button onClick={() => setSelectedVerification(null)} className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white px-8">
                    Back to Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // LinkedIn verification flow
  if (selectedVerification === 'linkedin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => { setSelectedVerification(null); setLinkedinStep('connect'); }} className="flex items-center gap-2 text-[#880E4F] mb-6 hover:underline">
            <ArrowLeft size={20} /> Back to verification options
          </button>
          <Card className="border-2 border-[#FCE4EC] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Linkedin size={24} />
                </div>
                <div>
                  <CardTitle>LinkedIn Verification</CardTitle>
                  <p className="text-white/80 text-sm">Professional identity verification</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {linkedinStep === 'connect' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                    <Briefcase size={20} className="text-[#0077B5] mt-0.5" />
                    <p className="text-sm text-[#1E3A5F]">
                      We&apos;ll verify your professional profile through LinkedIn. Your work experience and education will be validated.
                    </p>
                  </div>
                  <div className="bg-[#FFF0F5] rounded-xl p-4">
                    <h4 className="font-semibold text-[#4A0E25] mb-2">What gets verified:</h4>
                    <ul className="space-y-2 text-sm text-[#5D0F3A]">
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Current employment</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Education qualifications</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Professional credentials</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleLinkedInConnect}
                    className="w-full bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Linkedin size={18} /> Connect with LinkedIn
                  </Button>
                </div>
              )}
              {linkedinStep === 'verifying' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="animate-spin w-12 h-12 text-[#0077B5] mx-auto" />
                  <p className="text-[#5D0F3A]">Connecting to LinkedIn...</p>
                  <p className="text-xs text-[#5D0F3A]">Please wait while we verify your profile</p>
                </div>
              )}
              {linkedinStep === 'success' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-[#0077B5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4A0E25]">Professional Verified!</h3>
                    <p className="text-[#5D0F3A] mt-2">Your LinkedIn profile is now linked</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white px-4 py-2 rounded-full inline-flex items-center gap-2">
                    <Linkedin size={18} /> Professional
                  </div>
                  <Button onClick={() => setSelectedVerification(null)} className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white px-8">
                    Back to Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Selfie verification flow with Liveness Check
  if (selectedVerification === 'selfie') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => { setSelectedVerification(null); setSelfieStep('capture'); setLivenessAction(0); setCountdown(5); }} className="flex items-center gap-2 text-[#880E4F] mb-6 hover:underline">
            <ArrowLeft size={20} /> Back to verification options
          </button>
          <Card className="border-2 border-[#FCE4EC] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Camera size={24} />
                </div>
                <div>
                  <CardTitle>Selfie + Liveness Verification</CardTitle>
                  <p className="text-white/80 text-sm">AI-powered anti-catfishing protection</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selfieStep === 'capture' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles size={20} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-800 font-medium">Liveness Detection Enabled</p>
                      <p className="text-xs text-purple-600 mt-1">We&apos;ll ask you to perform simple actions to prove you&apos;re a real person, not a photo.</p>
                    </div>
                  </div>
                  <div className="bg-[#FFF0F5] rounded-xl p-6 text-center relative overflow-hidden">
                    {/* Face outline */}
                    <div className="w-40 h-40 mx-auto border-4 border-dashed border-purple-400 rounded-full flex items-center justify-center mb-4 bg-white/50">
                      <div className="text-center">
                        <User size={48} className="text-purple-300 mx-auto" />
                      </div>
                    </div>
                    <p className="text-sm text-[#5D0F3A] mb-2 font-medium">Position your face in the circle</p>
                    <p className="text-xs text-[#5D0F3A]">Ensure good lighting and a clear view of your face</p>
                  </div>
                  {/* Liveness preview */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
                    <p className="text-xs text-purple-700 font-medium mb-2">You will be asked to:</p>
                    <div className="flex flex-wrap gap-2">
                      {livenessActions.map((action, i) => (
                        <span key={i} className="bg-white px-2 py-1 rounded-lg text-xs text-purple-700 flex items-center gap-1">
                          {action.icon} {action.instruction.replace("Please ", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleSelfieCapture}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Camera size={18} /> Start Liveness Check
                  </Button>
                </div>
              )}
              {selfieStep === 'liveness' && (
                <div className="space-y-6">
                  {/* Liveness check UI */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-purple-800">Liveness Check in Progress</span>
                    </div>
                    {/* Countdown timer */}
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E9D5FF" strokeWidth="8" />
                        <circle 
                          cx="50" cy="50" r="45" fill="none" stroke="#9333EA" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(countdown / 5) * 283} 283`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-purple-700">{countdown}</span>
                      </div>
                    </div>
                    {/* Current action prompt */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-200 animate-pulse">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-2xl">{livenessActions[livenessAction].icon}</span>
                        <span className="text-lg font-semibold text-purple-800">{livenessActions[livenessAction].instruction}</span>
                      </div>
                    </div>
                    {/* Progress indicators */}
                    <div className="flex justify-center gap-2 mt-4">
                      {livenessActions.map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-8 h-1.5 rounded-full transition-all ${
                            i < livenessAction ? 'bg-green-500' : 
                            i === livenessAction ? 'bg-purple-500 animate-pulse' : 
                            'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-purple-600 mt-2">Step {livenessAction + 1} of {livenessActions.length}</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-[#5D0F3A]">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span>Liveness detection prevents catfishing</span>
                  </div>
                </div>
              )}
              {selfieStep === 'uploading' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="animate-spin w-12 h-12 text-purple-600 mx-auto" />
                  <p className="text-[#5D0F3A] font-medium">Analyzing your selfie...</p>
                  <p className="text-xs text-[#5D0F3A]">AI is comparing with your profile photos</p>
                  <div className="bg-purple-50 rounded-lg p-3 mt-4">
                    <p className="text-xs text-purple-700 flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      Liveness check passed - You are a real person!
                    </p>
                  </div>
                </div>
              )}
              {selfieStep === 'success' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4A0E25]">Photo + Liveness Verified!</h3>
                    <p className="text-[#5D0F3A] mt-2">Your identity has been confirmed as a real person</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-full inline-flex items-center justify-center gap-2">
                      <Camera size={18} /> Photo Verified
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full inline-flex items-center justify-center gap-2">
                      <ShieldCheck size={18} /> Liveness Verified
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      Your profile is now protected against catfishing
                    </p>
                  </div>
                  <Button onClick={() => setSelectedVerification(null)} className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white px-8">
                    Back to Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // DigiLocker verification flow
  if (selectedVerification === 'digilocker') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => { setSelectedVerification(null); setDigilockerStep('connect'); }} className="flex items-center gap-2 text-[#880E4F] mb-6 hover:underline">
            <ArrowLeft size={20} /> Back to verification options
          </button>
          <Card className="border-2 border-[#FCE4EC] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <CardTitle>DigiLocker Verification</CardTitle>
                  <p className="text-white/80 text-sm">Government-backed document vault</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {digilockerStep === 'connect' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 flex items-start gap-3 border border-amber-200">
                    <Award size={20} className="text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Get Gold Trust Badge</p>
                      <p className="text-xs text-amber-600 mt-1">Verify your education and employment through DigiLocker to get the prestigious Gold Trust badge.</p>
                    </div>
                  </div>
                  <div className="bg-[#FFF0F5] rounded-xl p-4">
                    <h4 className="font-semibold text-[#4A0E25] mb-3">What you can verify:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#FCE4EC]">
                        <GraduationCap size={20} className="text-[#880E4F] mt-0.5" />
                        <div>
                          <p className="font-medium text-[#4A0E25] text-sm">Education Certificates</p>
                          <p className="text-xs text-[#5D0F3A]">Degrees, diplomas, mark sheets from verified institutions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#FCE4EC]">
                        <Briefcase size={20} className="text-[#880E4F] mt-0.5" />
                        <div>
                          <p className="font-medium text-[#4A0E25] text-sm">Employment Records</p>
                          <p className="text-xs text-[#5D0F3A]">EPF records, experience certificates from employers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <p className="text-xs text-amber-700">DigiLocker is a Government of India initiative for secure document access</p>
                  </div>
                  <Button
                    onClick={handleDigiLockerConnect}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FileText size={18} /> Connect with DigiLocker
                  </Button>
                </div>
              )}
              {digilockerStep === 'authorizing' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="animate-spin w-12 h-12 text-amber-500 mx-auto" />
                  <p className="text-[#5D0F3A]">Connecting to DigiLocker...</p>
                  <p className="text-xs text-[#5D0F3A]">Please authorize access to your documents</p>
                </div>
              )}
              {digilockerStep === 'fetching' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="animate-spin w-12 h-12 text-amber-500 mx-auto" />
                  <p className="text-[#5D0F3A]">Fetching your verified documents...</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <CheckCircle2 size={14} /> Education certificates found
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <CheckCircle2 size={14} /> Employment records found
                    </div>
                  </div>
                </div>
              )}
              {digilockerStep === 'success' && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-lg ring-4 ring-amber-200">
                      <CheckCircle2 size={40} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#4A0E25] mt-4">Gold Trust Verified!</h3>
                    <p className="text-[#5D0F3A] mt-2">Your credentials have been verified</p>
                  </div>
                  
                  {/* Verified Education */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={18} className="text-green-600" />
                      <h4 className="font-semibold text-green-800">Verified Education</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 bg-white p-2 rounded-lg">
                        <CheckCircle2 size={14} className="text-green-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">B.Tech Computer Science</p>
                          <p className="text-xs text-gray-500">IIT Delhi • 2019</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white p-2 rounded-lg">
                        <CheckCircle2 size={14} className="text-green-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Higher Secondary</p>
                          <p className="text-xs text-gray-500">Delhi Public School • 2015</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verified Employment */}
                  <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase size={18} className="text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Verified Employment</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 bg-white p-2 rounded-lg">
                        <CheckCircle2 size={14} className="text-blue-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Software Engineer</p>
                          <p className="text-xs text-gray-500">Google India • 2020 - Present</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white p-2 rounded-lg">
                        <CheckCircle2 size={14} className="text-blue-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Intern</p>
                          <p className="text-xs text-gray-500">Microsoft • 2019</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gold Trust Badge Preview */}
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl p-4 text-center text-white">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award size={24} />
                      <span className="font-bold text-lg">Gold Trust</span>
                    </div>
                    <p className="text-xs text-white/90">Your profile now displays the Gold Trust badge</p>
                  </div>

                  <Button onClick={() => setSelectedVerification(null)} className="w-full bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3 rounded-xl">
                    Back to Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Manual visit verification flow
  if (selectedVerification === 'manual') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => { setSelectedVerification(null); setManualStep('form'); }} className="flex items-center gap-2 text-[#880E4F] mb-6 hover:underline">
            <ArrowLeft size={20} /> Back to verification options
          </button>
          <Card className="border-2 border-[#FCE4EC] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Home size={24} />
                </div>
                <div>
                  <CardTitle>Manual Visit Verification</CardTitle>
                  <p className="text-white/80 text-sm">Premium in-person verification</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {manualStep === 'form' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
                    <Crown size={20} className="text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Our verification officer will visit your address to verify your identity in person.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4A0E25] mb-1">Address</label>
                      <Input
                        value={manualForm.address}
                        onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                        placeholder="Enter your full address"
                        className="border-2 border-[#F8BBD9] focus:border-[#C2185B]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#4A0E25] mb-1">City</label>
                        <Input
                          value={manualForm.city}
                          onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                          placeholder="City"
                          className="border-2 border-[#F8BBD9] focus:border-[#C2185B]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4A0E25] mb-1">Pincode</label>
                        <Input
                          value={manualForm.pincode}
                          onChange={(e) => setManualForm({ ...manualForm, pincode: e.target.value })}
                          placeholder="Pincode"
                          className="border-2 border-[#F8BBD9] focus:border-[#C2185B]"
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#4A0E25] mb-1">Preferred Date</label>
                        <Input
                          type="date"
                          value={manualForm.preferredDate}
                          onChange={(e) => setManualForm({ ...manualForm, preferredDate: e.target.value })}
                          className="border-2 border-[#F8BBD9] focus:border-[#C2185B]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4A0E25] mb-1">Preferred Time</label>
                        <select
                          value={manualForm.preferredTime}
                          onChange={(e) => setManualForm({ ...manualForm, preferredTime: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#F8BBD9] focus:border-[#C2185B]"
                        >
                          <option value="">Select time</option>
                          <option value="morning">Morning (9AM - 12PM)</option>
                          <option value="afternoon">Afternoon (12PM - 4PM)</option>
                          <option value="evening">Evening (4PM - 7PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualForm.address || !manualForm.city || !manualForm.pincode || isLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-white py-3 rounded-xl font-semibold"
                  >
                    {isLoading ? <><Loader2 className="animate-spin mr-2" size={18} /> Submitting...</> : 'Request Visit'}
                  </Button>
                </div>
              )}
              {manualStep === 'submitted' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4A0E25]">Visit Requested!</h3>
                    <p className="text-[#5D0F3A] mt-2">Our officer will contact you within 24 hours</p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white px-4 py-2 rounded-full inline-flex items-center gap-2">
                    <Home size={18} /> Visit Scheduled
                  </div>
                  <Button onClick={() => setSelectedVerification(null)} className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white px-8">
                    Back to Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main verification page
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-[#880E4F] mb-6 hover:underline">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4A0E25]">Verify Your Profile</h1>
          <p className="text-[#5D0F3A] mt-2 max-w-lg mx-auto">
            Complete verification to build trust and get better matches. Verified profiles get 3x more responses!
          </p>
        </div>

        {/* Current Verification Status */}
        <Card className="mb-6 border-2 border-[#FCE4EC]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FCE4EC] rounded-full flex items-center justify-center">
                  <User size={20} className="text-[#880E4F]" />
                </div>
                <div>
                  <p className="font-semibold text-[#4A0E25]">Profile Verification</p>
                  <p className="text-sm text-[#5D0F3A]">Complete all verifications for maximum trust</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {countVerified > 0 ? (
                  <Badge className="bg-green-500 text-white">
                    <Check size={12} className="mr-1" /> {countVerified} Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50">
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Options */}
        <div className="grid gap-4 md:grid-cols-2">
          {verificationOptions.map((option) => {
            const isVerified = verificationStatus[option.id] === 'verified';
            const isAadhaar = option.id === 'aadhaar';
            const isDigiLocker = option.id === 'digilocker';
            return (
              <Card
                key={option.id}
                className={`border-2 ${
                  isVerified && isDigiLocker ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50' :
                  isVerified ? 'border-green-300 bg-green-50/30' : 
                  isAadhaar ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' :
                  'border-[#FCE4EC]'
                } hover:border-[#C2185B] transition-all cursor-pointer hover:shadow-lg group relative overflow-hidden`}
                onClick={() => !isVerified && setSelectedVerification(option.id)}
              >
                {/* Aadhaar Prominent Indicator */}
                {isAadhaar && !isVerified && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> RECOMMENDED
                  </div>
                )}
                {/* Gold Trust Badge for DigiLocker */}
                {isDigiLocker && !isVerified && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                    <Award size={12} /> PREMIUM
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 ${
                      isVerified && isDigiLocker ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                      isVerified ? 'bg-green-500' : 
                      isAadhaar ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      isDigiLocker ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                      'bg-gradient-to-br from-[#880E4F] to-[#C2185B]'
                    } rounded-xl flex items-center justify-center shadow-md ${!isVerified && 'group-hover:scale-110'} transition-transform`}>
                      {isVerified ? <Check size={24} className="text-white" /> : <option.icon size={24} className="text-white" />}
                    </div>
                    <Badge className={`${
                      isVerified && isDigiLocker ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                      isVerified ? 'bg-green-500' : 
                      isAadhaar ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      isDigiLocker ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                      option.badgeColor
                    } text-white`}>
                      {isVerified ? (isDigiLocker ? 'Gold Trust' : 'Verified') : option.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-[#4A0E25] text-lg mb-1">{option.title}</h3>
                  <p className="text-sm text-[#5D0F3A] mb-3">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#880E4F] flex items-center gap-1">
                      <Clock size={12} /> {option.time}
                    </span>
                    {!isVerified && <ChevronRight size={20} className="text-[#C2185B] group-hover:translate-x-1 transition-transform" />}
                  </div>
                  <div className={`mt-3 p-2 rounded-lg ${isAadhaar ? 'bg-green-100' : isDigiLocker ? 'bg-amber-100' : 'bg-[#FFF0F5]'}`}>
                    <p className="text-xs text-[#5D0F3A] flex items-center gap-1">
                      <Sparkles size={12} className={isAadhaar ? 'text-green-600' : isDigiLocker ? 'text-amber-600' : 'text-[#C2185B]'} /> {option.benefit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Benefits */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#880E4F] to-[#C2185B] rounded-2xl text-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BadgeCheck size={22} /> Why Get Verified?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="font-semibold">3x More Responses</p>
                <p className="text-sm text-white/80">Verified profiles get priority</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart size={18} />
              </div>
              <div>
                <p className="font-semibold">Build Trust</p>
                <p className="text-sm text-white/80">Stand out from the crowd</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div>
                <p className="font-semibold">Stay Safe</p>
                <p className="text-sm text-white/80">Identity verification matters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cookie Policy Page
function CookiesPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <InfoPageLayout title="Cookie Policy" icon={Settings}>
      <div className="prose prose-pink max-w-none text-[#5D0F3A]">
        <p className="text-sm mb-6">Last updated: January 2024</p>
        
        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">What Are Cookies?</h2>
        <p className="mb-4">Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how you use our platform.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">Types of Cookies We Use</h2>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-[#FFF0F5] rounded-xl">
            <h3 className="font-semibold text-[#4A0E25]">Essential Cookies</h3>
            <p className="text-sm">Required for the website to function properly. These enable login, security features, and basic functionality.</p>
          </div>
          <div className="p-4 bg-[#FFF0F5] rounded-xl">
            <h3 className="font-semibold text-[#4A0E25]">Analytics Cookies</h3>
            <p className="text-sm">Help us understand how visitors interact with our website, allowing us to improve our services.</p>
          </div>
          <div className="p-4 bg-[#FFF0F5] rounded-xl">
            <h3 className="font-semibold text-[#4A0E25]">Preference Cookies</h3>
            <p className="text-sm">Remember your settings and preferences to provide a personalized experience.</p>
          </div>
          <div className="p-4 bg-[#FFF0F5] rounded-xl">
            <h3 className="font-semibold text-[#4A0E25]">Marketing Cookies</h3>
            <p className="text-sm">Used to deliver relevant advertisements based on your interests.</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">Managing Cookies</h2>
        <p className="mb-4">You can control and manage cookies through your browser settings. Note that disabling certain cookies may affect the functionality of our website.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">Third-Party Cookies</h2>
        <p className="mb-4">We may use third-party services that set their own cookies, including Google Analytics for website analytics and social media platforms for sharing features.</p>

        <h2 className="text-lg font-semibold text-[#4A0E25] mt-6 mb-3">Contact Us</h2>
        <p>For questions about our Cookie Policy, please contact us at <button onClick={() => onNavigate('contact')} className="text-[#C2185B] hover:underline">privacy@happyjodivibes.com</button></p>
      </div>
    </InfoPageLayout>
  );
}
