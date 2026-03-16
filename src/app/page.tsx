"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Montserrat } from "next/font/google";
import { 
  mockProfiles, mockInteractions, mockMessages, ghostUserProfile, 
  ghostPartnerPreferences, getMatchesForGhost, filterProfiles,
  calculateCompatibility,
  type MockProfile, type MockInteraction, type MockMessage 
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
  Bell, Menu, Ghost, LogOut, UserPlus, ArrowRight, Filter, Grid, List,
  Facebook, Instagram, Twitter, Linkedin, Camera, Edit3, Trash2, Plus,
  Minus, Clock, TrendingUp, Award, BadgeCheck, Crown, HeartHandshake,
  MessagesSquare, UserCheck, UserX, Ban, MoreVertical, ChevronDown, UserCircle,
  Grid3X3, StarOff, HeartOff, ShieldCheck, Share2, Mic, Play, ChevronLeft,
  Video, VideoOff, Zap, Gift, AlertTriangle, Volume2, VolumeX, CreditCard, Wallet,
  Building, IndianRupee, CheckCircle2, XCircle, Loader2, RefreshCw, Upload,
  Image as ImageIcon, FileText, Info, HelpCircle, ExternalLink, Pause, Sliders,
  Inbox, Smile, Paperclip, CheckCheck
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

type Page = "home" | "login" | "register" | "dashboard" | "profile" | "search" | "matches" | "interests" | "messages" | "settings" | "profileView" | "support" | "safety" | "faq" | "about" | "careers" | "contact" | "terms" | "privacy" | "cookies";

interface AppState {
  currentPage: Page;
  ghostMode: boolean;
  interactions: MockInteraction[];
  messages: MockMessage[];
  shortlisted: string[];
  blocked: string[];
  notifications: { id: string; type: string; message: string; read: boolean }[];
  profile: typeof ghostUserProfile;
  preferences: typeof ghostPartnerPreferences;
  activeChat: string | null;
  viewingProfileId: string | null;
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

function MatrimonyApp() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<AppState>({
    currentPage: "home",
    ghostMode: false,
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
  });

  const isAuthenticated = status === "authenticated" || state.ghostMode;

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

  const renderPage = () => {
    // Public pages (accessible without authentication)
    if (effectivePage === "home") return <HomePage onNavigate={setCurrentPage} />;
    if (effectivePage === "login") return <LoginPage onNavigate={setCurrentPage} />;
    if (effectivePage === "register") return <RegisterPage onNavigate={setCurrentPage} />;
    
    // Footer pages (publicly accessible)
    if (effectivePage === "support") return <SupportPage onNavigate={setCurrentPage} />;
    if (effectivePage === "safety") return <SafetyTipsPage onNavigate={setCurrentPage} />;
    if (effectivePage === "faq") return <FAQPage onNavigate={setCurrentPage} />;
    if (effectivePage === "about") return <AboutPage onNavigate={setCurrentPage} />;
    if (effectivePage === "careers") return <CareersPage onNavigate={setCurrentPage} />;
    if (effectivePage === "contact") return <ContactPage onNavigate={setCurrentPage} />;
    if (effectivePage === "terms") return <TermsPage onNavigate={setCurrentPage} />;
    if (effectivePage === "privacy") return <PrivacyPage onNavigate={setCurrentPage} />;
    if (effectivePage === "cookies") return <CookiesPage onNavigate={setCurrentPage} />;
    
    if (!isAuthenticated) {
      return <LoginPage onNavigate={setCurrentPage} />;
    }

    switch (effectivePage) {
      case "dashboard":
        return (
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
          />
        );
      case "profile":
        return (
          <ProfilePage
            onNavigate={setCurrentPage}
            profile={state.profile}
            updateProfile={updateProfile}
          />
        );
      case "search":
        return (
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
        );
      case "matches":
        return (
          <MatchesPage
            onNavigate={setCurrentPage}
            getMatches={getMatchesForGhost}
            sendInterest={sendInterest}
            shortlistProfile={shortlistProfile}
            shortlisted={state.shortlisted}
            viewProfile={viewProfile}
          />
        );
      case "interests":
        return (
          <InterestsPage
            onNavigate={setCurrentPage}
            interactions={state.interactions}
            acceptInterest={acceptInterest}
            declineInterest={declineInterest}
            shortlisted={state.shortlisted}
            shortlistProfile={shortlistProfile}
            viewProfile={viewProfile}
          />
        );
      case "messages":
        return (
          <MessagesPage
            onNavigate={setCurrentPage}
            conversations={conversations}
            messages={state.messages}
            sendMessage={sendMessage}
            markMessagesRead={markMessagesRead}
            activeChat={state.activeChat}
            setActiveChat={(id) => setState(prev => ({ ...prev, activeChat: id }))}
          />
        );
      case "settings":
        return (
          <SettingsPage
            onNavigate={setCurrentPage}
            profile={state.profile}
            preferences={state.preferences}
            updateProfile={updateProfile}
            updatePreferences={updatePreferences}
          />
        );
      case "profileView":
        const viewingProfile = state.viewingProfileId 
          ? mockProfiles.find(p => p.userId === state.viewingProfileId)
          : null;
        if (!viewingProfile) {
          return (
            <MatchesPage
              onNavigate={setCurrentPage}
              getMatches={getMatchesForGhost}
              sendInterest={sendInterest}
              shortlistProfile={shortlistProfile}
              shortlisted={state.shortlisted}
              viewProfile={viewProfile}
            />
          );
        }
        const matchScore = calculateCompatibility(viewingProfile, state.preferences);
        return (
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
        );
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF0F5] to-white">
      <Header
        currentPage={effectivePage}
        onNavigate={setCurrentPage}
        ghostMode={state.ghostMode}
        setGhostMode={(v) => setState(prev => ({ ...prev, ghostMode: v }))}
        unreadNotifications={unreadNotifications}
      />
      {state.ghostMode && (
        <div className="bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white text-center py-2 text-sm font-medium animate-pulse">
          👻 GHOST MODE ACTIVE - Testing without authentication
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
}

function Header({ currentPage, onNavigate, ghostMode, setGhostMode, unreadNotifications }: HeaderProps) {
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#880E4F] to-[#AD1457] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <HeartHandshake size={24} className="text-[#880E4F] fill-[#C2185B]" />
            </div>
            <span className="text-xl font-bold text-white">Happy Jodi Vibes</span>
          </button>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
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

          <div className="flex items-center gap-4">
            {/* Ghost Mode Button */}
            <button
              onClick={() => setGhostMode(!ghostMode)}
              className={`p-2 rounded-lg transition-all ${
                ghostMode
                  ? "bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-lg ring-2 ring-[#F8BBD9] animate-pulse"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
              title={ghostMode ? "Disable Ghost Mode" : "Enable Ghost Mode (Admin Testing)"}
            >
              <Ghost size={22} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {unreadNotifications > 0 && (
                  <div className="bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs px-2 py-1 rounded-full animate-bounce flex items-center gap-1">
                    <Bell size={12} />
                    {unreadNotifications}
                  </div>
                )}
                <button
                  onClick={() => onNavigate("profile")}
                  className="hidden sm:flex items-center gap-2 bg-white hover:bg-[#FCE4EC] px-4 py-2 rounded-full transition-colors shadow-md border border-[#FCE4EC]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#880E4F] to-[#C2185B] flex items-center justify-center shadow-sm">
                    {ghostMode ? <Ghost size={16} className="text-white" /> : <User size={16} className="text-white" />}
                  </div>
                  <span className="text-[#880E4F] font-bold text-sm">{ghostMode ? "Ghost User" : "My Profile"}</span>
                </button>
                <button
                  onClick={() => onNavigate("settings")}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
                {!ghostMode && (
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate("login")}
                  className="text-white/90 hover:text-white text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="bg-white text-[#880E4F] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FCE4EC] transition-colors flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Register Free
                </button>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-sm flex items-center gap-3 ${
                  currentPage === item.page
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
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
    <footer className="bg-gradient-to-b from-[#5D0F3A] to-[#2D0817] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-3 text-[#F8BBD9]">Need Help?</h4>
            <ul className="space-y-2 text-sm text-[#F8BBD9]">
              <li><button onClick={() => onNavigate("support")} className="hover:text-white flex items-center gap-2 text-left"><MessageCircle size={14} /> Customer Support</button></li>
              <li><button onClick={() => onNavigate("safety")} className="hover:text-white flex items-center gap-2 text-left"><Shield size={14} /> Safety Tips</button></li>
              <li><button onClick={() => onNavigate("faq")} className="hover:text-white flex items-center gap-2 text-left"><Sparkles size={14} /> FAQs</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-[#F8BBD9]">Company</h4>
            <ul className="space-y-2 text-sm text-[#F8BBD9]">
              <li><button onClick={() => onNavigate("about")} className="hover:text-white flex items-center gap-2 text-left"><Users size={14} /> About Us</button></li>
              <li><button onClick={() => onNavigate("careers")} className="hover:text-white flex items-center gap-2 text-left"><Briefcase size={14} /> Careers</button></li>
              <li><button onClick={() => onNavigate("contact")} className="hover:text-white flex items-center gap-2 text-left"><Mail size={14} /> Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-[#F8BBD9]">Privacy</h4>
            <ul className="space-y-2 text-sm text-[#F8BBD9]">
              <li><button onClick={() => onNavigate("terms")} className="hover:text-white flex items-center gap-2 text-left"><Lock size={14} /> Terms of Use</button></li>
              <li><button onClick={() => onNavigate("privacy")} className="hover:text-white flex items-center gap-2 text-left"><Shield size={14} /> Privacy Policy</button></li>
              <li><button onClick={() => onNavigate("cookies")} className="hover:text-white flex items-center gap-2 text-left"><Settings size={14} /> Cookie Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-[#F8BBD9]">Connect</h4>
            <p className="text-sm text-[#F8BBD9] flex items-center gap-2"><Mail size={14} /> support@happyjodivibes.com</p>
            <div className="flex gap-3 mt-3">
              <span className="w-9 h-9 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
                <Facebook size={16} className="text-white" />
              </span>
              <span className="w-9 h-9 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
                <Instagram size={16} className="text-white" />
              </span>
              <span className="w-9 h-9 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
                <Twitter size={16} className="text-white" />
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-[#880E4F] mt-6 pt-6 text-center text-sm text-[#EC407A] flex items-center justify-center gap-2">
          © 2024 Happy Jodi Vibes. All rights reserved. | Made with 
          <Heart size={16} className="text-[#C2185B] fill-[#C2185B]" />
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
          
          {/* Floating animated elements - using deterministic values to avoid hydration errors */}
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center py-12 md:py-8">
          {/* Logo Badge */}
          <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow">
              <HeartHandshake size={36} className="text-[#880E4F] md:size-10" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-[#4A0E25] mb-4 drop-shadow-sm animate-fade-in-up">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] bg-clip-text text-transparent">
              Life Partner
            </span>
          </h1>
          <p className="text-base md:text-xl text-[#5D0F3A] mb-10 md:mb-14 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            India&apos;s Most Trusted Matrimony Service with AI-Powered Matching. 
            Join millions who found their happily ever after.
          </p>

          {/* Quick Search / Register Widget - Enhanced Prominence */}
          <div className="relative max-w-5xl mx-auto animate-fade-in-up animation-delay-200">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-3xl blur-sm opacity-40"></div>
            
            <div className="relative bg-white/98 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border-2 border-[#FCE4EC]">
              {/* Enhanced Header */}
              <div className="flex flex-col items-center mb-5 md:mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-lg flex items-center justify-center shadow-md">
                    <Search size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-[#4A0E25]">Find Your Perfect Match</h2>
                  <div className="w-8 h-8 bg-gradient-to-br from-[#AD1457] to-[#EC407A] rounded-lg flex items-center justify-center shadow-md">
                    <Heart size={16} className="text-white" />
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
              
              <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
                {/* Profile Created For */}
                <div className="relative">
                  <select
                    value={searchForm.profileFor}
                    onChange={(e) => setSearchForm({ ...searchForm, profileFor: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-sm whitespace-nowrap min-w-[130px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8"
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
                <div className="relative">
                  <select
                    value={searchForm.gender}
                    onChange={(e) => setSearchForm({ ...searchForm, gender: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-sm whitespace-nowrap min-w-[110px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8"
                  >
                    <option value="">Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AD1457] pointer-events-none" />
                </div>

                {/* Age */}
                <div className="relative">
                  <select
                    value={searchForm.age}
                    onChange={(e) => setSearchForm({ ...searchForm, age: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-sm whitespace-nowrap min-w-[110px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8"
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
                <div className="relative">
                  <select
                    value={searchForm.religion}
                    onChange={(e) => setSearchForm({ ...searchForm, religion: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-sm whitespace-nowrap min-w-[120px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8"
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
                <div className="relative">
                  <select
                    value={searchForm.motherTongue}
                    onChange={(e) => setSearchForm({ ...searchForm, motherTongue: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#F8BBD9] bg-gradient-to-r from-[#FFF0F5] to-white focus:ring-2 focus:ring-[#EC407A] focus:border-[#C2185B] text-sm whitespace-nowrap min-w-[140px] cursor-pointer hover:border-[#C2185B] transition-colors appearance-none pr-8"
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
                  className="relative group bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white font-semibold py-3 px-8 rounded-xl hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm whitespace-nowrap overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <UserPlus size={18} />
                  Register Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="mt-5 text-[#880E4F] text-xs md:text-sm flex items-center justify-center gap-2">
                <Users size={14} className="text-[#C2185B]" />
                Join <span className="font-semibold text-[#880E4F]">5 million+</span> happy couples who found their life partner
              </p>
            </div>
          </div>

          {/* Trust Indicators - Enhanced with Visual Badges */}
          <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-4 md:gap-6 animate-fade-in-up animation-delay-300 relative">
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
                <div className="relative flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-[#FCE4EC]">
                  <div className={`w-12 h-12 bg-gradient-to-br ${badge.gradient} rounded-xl flex items-center justify-center shadow-md ring-2 ring-white/50`}>
                    <badge.icon size={22} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xl font-bold bg-gradient-to-r ${badge.gradient} bg-clip-text text-transparent`}>{badge.value}</span>
                    <span className="text-[#4A0E25] font-medium text-xs md:text-sm">{badge.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-10 md:mt-14 grid grid-cols-3 gap-4 md:gap-6 max-w-lg mx-auto">
            {[
              { value: "5M+", label: "Profiles", icon: Users },
              { value: "2M+", label: "Matches", icon: Heart },
              { value: "98%", label: "Success", icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="relative group">
                {/* Glowing hover effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border-[0.5px] border-[#F8BBD9]/50 hover:border-[#C2185B]/30 hover:shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] transition-all duration-500 group-hover:-translate-y-1">
                  <div className="w-10 h-10 bg-[#FCE4EC] rounded-full flex items-center justify-center mx-auto mb-2">
                    <stat.icon size={20} style={{ stroke: 'url(#maroonGradient)' }} />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-[#C2185B]">{stat.value}</div>
                  <div className="text-xs md:text-sm text-[#5D0F3A]">{stat.label}</div>
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
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#4A0E25] mb-3">Three Simple Steps</h2>
            <p className="text-base md:text-lg text-[#5D0F3A] max-w-2xl mx-auto">
              Find your perfect life partner in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: "1", icon: Edit3, title: "Create Profile", desc: "Sign up and create your detailed profile in minutes. Add photos, preferences, and more." },
              { step: "2", icon: Search, title: "Find Matches", desc: "Search and get AI-powered personalized matches based on your preferences." },
              { step: "3", icon: HeartHandshake, title: "Connect", desc: "Send interests, chat with matches, and find your perfect life partner." },
            ].map((feature, i) => (
              <div key={i} className="relative group">
                {/* Glowing hover effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-[2rem] blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative p-6 md:p-8 bg-white rounded-[2rem] border-[0.5px] border-[#F8BBD9]/50 hover:border-[#C2185B]/30 hover:shadow-[0_20px_60px_-15px_rgba(136,14,79,0.3)] transition-all duration-500 text-center group-hover:-translate-y-1">
                  {/* Step Pill - Combined */}
                  <div className="flex justify-center mb-5">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white px-5 py-2 rounded-full shadow-lg">
                      <span className="font-bold text-sm md:text-base uppercase tracking-wider">Step {feature.step}</span>
                    </div>
                  </div>
                  {/* Icon Container */}
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-[#FCE4EC] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon size={32} style={{ stroke: 'url(#maroonGradient)' }} />
                  </div>
                  {/* Title - Centered */}
                  <h3 className="text-lg md:text-xl font-bold text-[#4A0E25] mb-2">{feature.title}</h3>
                  {/* Description - Centered */}
                  <p className="text-sm md:text-base text-[#5D0F3A]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Enhanced */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-[#FFF0F5] to-white relative">
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#4A0E25] mb-3">Trusted by Millions</h2>
            <p className="text-base md:text-lg text-[#5D0F3A]">Features that make us India&apos;s favorite matrimony platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl border-[0.5px] border-[#F8BBD9]/50 p-4 md:p-6 hover:border-[#C2185B]/30 hover:shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] transition-all duration-500 hover:-translate-y-1">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FCE4EC] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                    <badge.icon size={24} style={{ stroke: 'url(#maroonGradient2)' }} />
                  </div>
                  <h3 className="font-bold text-[#4A0E25] mb-1 text-sm md:text-base">{badge.title}</h3>
                  <p className="text-xs md:text-sm text-[#5D0F3A]">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Carousel */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-block bg-gradient-to-r from-[#FCE4EC] to-[#FFF0F5] text-[#C2185B] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Success Stories
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#4A0E25] mb-3">Real Couples, Real Stories</h2>
            <p className="text-base md:text-lg text-[#5D0F3A]">See how Happy Jodi Vibes brought people together</p>
          </div>

          {/* Carousel Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => scrollCarousel('left')}
              className="w-10 h-10 md:w-12 md:h-12 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} className="text-[#880E4F]" />
            </button>
            <div className="flex gap-2">
              {successStories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentTestimonial === i ? 'w-6 bg-[#C2185B]' : 'bg-[#F8BBD9]'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => scrollCarousel('right')}
              className="w-10 h-10 md:w-12 md:h-12 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight size={20} className="text-[#880E4F]" />
            </button>
          </div>

          {/* Stories Carousel */}
          <div 
            ref={carouselRef}
            className="flex gap-5 md:gap-8 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {successStories.map((story, i) => (
              <div 
                key={story.id}
                className={`group flex-shrink-0 w-80 md:w-96 bg-white rounded-3xl transition-all duration-300 ease-out ${
                  currentTestimonial === i 
                    ? 'ring-2 ring-[#C2185B] shadow-[0_20px_50px_-12px_rgba(136,14,79,0.25)] scale-[1.02]' 
                    : 'shadow-[0_8px_30px_-12px_rgba(136,14,79,0.15)] hover:shadow-[0_16px_40px_-12px_rgba(136,14,79,0.25)] hover:scale-[1.01]'
                }`}
              >
                {/* Card Top Decoration */}
                <div className="relative h-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-t-3xl"></div>
                
                {/* Card Content */}
                <div className="p-6 md:p-8 relative">
                  {/* Decorative Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-[#880E4F]">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>

                  {/* Photo placeholder with enhanced styling */}
                  <div className="flex items-center justify-center mb-5">
                    <div className="relative">
                      {/* Outer ring decoration */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] rounded-full scale-[1.15] opacity-60"></div>
                      
                      {/* Avatar */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white">
                        {story.names.split(' & ')[0][0]} & {story.names.split(' & ')[1][0]}
                      </div>
                      
                      {/* Heart badge */}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white group-hover:scale-110 transition-transform duration-300">
                        <Heart size={14} className="text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Couple Names - Enhanced typography */}
                  <h3 className="font-bold text-[#4A0E25] text-center text-xl mb-2 tracking-wide">
                    {story.names}
                  </h3>
                  
                  {/* Location & Marriage Date */}
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-5 px-2">
                    <div className="flex items-center gap-1.5 text-[#C2185B] text-sm whitespace-nowrap">
                      <MapPin size={14} className="text-[#AD1457] flex-shrink-0" />
                      <span className="font-medium">{story.location}</span>
                    </div>
                    <span className="text-[#F8BBD9] text-lg">•</span>
                    <div className="flex items-center gap-1.5 text-[#880E4F] text-sm whitespace-nowrap">
                      <Heart size={12} className="text-[#AD1457] fill-[#AD1457] flex-shrink-0" />
                      <span className="font-medium">{story.married}</span>
                    </div>
                  </div>
                  
                  {/* Story Quote - Enhanced styling */}
                  <div className="relative bg-gradient-to-br from-[#FFF0F5] to-[#FCE4EC]/50 rounded-2xl p-5 pt-6 border border-[#FCE4EC] mb-5">
                    {/* Opening quote mark */}
                    <span className="absolute -top-1 left-4 text-2xl text-[#C2185B] font-serif">"</span>
                    <p className="text-sm md:text-base text-[#5D0F3A] italic leading-relaxed text-center">
                      {story.story}
                    </p>
                    {/* Closing quote mark */}
                    <span className="absolute -bottom-1 right-4 text-2xl text-[#C2185B] font-serif">"</span>
                  </div>

                  {/* Star Rating - Enhanced */}
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star 
                        key={j} 
                        size={16} 
                        className="text-amber-400 fill-amber-400 drop-shadow-sm group-hover:scale-110 transition-transform duration-200" 
                        style={{ transitionDelay: `${j * 50}ms` }}
                      />
                    ))}
                    <span className="ml-2 text-xs text-[#5D0F3A] font-medium">5.0</span>
                  </div>
                </div>

                {/* Card Bottom Decoration */}
                <div className="px-6 pb-5 md:px-8 md:pb-6">
                  {/* Verified Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-[#AD1457] bg-[#FCE4EC]/50 rounded-full py-2.5 px-5 group-hover:bg-[#FCE4EC] transition-colors duration-300 whitespace-nowrap">
                    <BadgeCheck size={14} className="text-[#880E4F] flex-shrink-0" />
                    <span className="font-medium">Verified Happy Couple</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[#5D0F3A] via-[#880E4F] to-[#C2185B] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: '5%', top: '10%', size: 20 },
            { left: '15%', top: '30%', size: 28 },
            { left: '25%', top: '15%', size: 24 },
            { left: '35%', top: '45%', size: 32 },
            { left: '45%', top: '25%', size: 18 },
            { left: '55%', top: '60%', size: 26 },
            { left: '65%', top: '35%', size: 30 },
            { left: '75%', top: '70%', size: 22 },
            { left: '85%', top: '20%', size: 28 },
            { left: '95%', top: '50%', size: 24 },
            { left: '10%', top: '80%', size: 20 },
            { left: '20%', top: '55%', size: 34 },
            { left: '30%', top: '85%', size: 18 },
            { left: '40%', top: '5%', size: 26 },
            { left: '50%', top: '75%', size: 30 },
            { left: '60%', top: '40%', size: 22 },
            { left: '70%', top: '90%', size: 28 },
            { left: '80%', top: '65%', size: 24 },
            { left: '90%', top: '10%', size: 20 },
            { left: '3%', top: '40%', size: 32 },
          ].map((heart, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-10"
              style={{
                left: heart.left,
                top: heart.top,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <Heart size={heart.size} className="text-white fill-white" />
            </div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Soulmate?</h2>
          <p className="text-base md:text-lg text-[#FFE4E1] mb-8">Register now and start your journey to finding the perfect life partner</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate("register")}
              className="bg-white text-[#880E4F] font-semibold px-8 py-4 rounded-xl text-base md:text-lg hover:bg-[#FCE4EC] transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Register Free
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl text-base md:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} className="rotate-180" />
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your password"
                    required
                  />
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
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C2185B]" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full p-3 pl-10 rounded-xl border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent"
                      placeholder="Confirm password"
                      required
                    />
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
  getMatches, shortlistProfile, shortlisted, viewProfile
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
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'visitors'>('overview');
  const matchesCarouselRef = useRef<HTMLDivElement>(null);

  const pendingInterests = interactions.filter(i => i.status === 'PENDING' && i.senderId !== 'ghost-user');
  const acceptedInterests = interactions.filter(i => i.status === 'ACCEPTED');
  const sentInterests = interactions.filter(i => i.senderId === 'ghost-user' && i.type === 'INTEREST');

  // Get top matches for daily recommendations
  const dailyMatches = useMemo(() => {
    return getMatches().slice(0, 10);
  }, [getMatches]);

  // Recent visitors mock data - using deterministic times to avoid hydration issues
  const recentVisitors = useMemo(() => {
    return mockProfiles
      .filter(p => p.gender !== profile.gender)
      .slice(0, 6)
      .map((p, index) => ({
        ...p,
        visitedAt: new Date(Date.now() - (index + 1) * 2 * 60 * 60 * 1000) // 2, 4, 6, 8, 10, 12 hours ago
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
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
            <h1 className="text-xl md:text-2xl font-bold text-[#4A0E25]">
              Welcome back, {session?.user?.name?.split(' ')[0] || profile.name.split(' ')[0]}!
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

      {/* Profile Completion Widget - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Profile Completion Card - Enhanced with Actionable Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#FCE4EC]">
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
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#FFF0F5] hover:bg-[#FCE4EC] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F8BBD9] flex items-center justify-center group-hover:bg-[#C2185B] transition-colors">
                      <Plus size={12} className="text-[#880E4F] group-hover:text-white" />
                    </div>
                    <span className="text-xs text-[#4A0E25] font-medium">{step.actionText}</span>
                  </div>
                  <span className="text-xs font-bold text-[#C2185B] bg-white px-2 py-0.5 rounded-full">{step.action}</span>
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
            className="w-full mt-3 text-sm text-[#C2185B] font-medium hover:underline flex items-center justify-center gap-1"
          >
            Complete Profile <ArrowRight size={14} />
          </button>
        </div>

        {/* Activity Snapshot - Enhanced */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#FCE4EC]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#4A0E25] flex items-center gap-2">
              <TrendingUp size={16} className="text-[#C2185B]" />
              Activity Snapshot
            </h3>
            <button 
              onClick={() => setActiveTab('activity')}
              className="text-xs text-[#C2185B] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Profile Views', value: 24, subtext: '+12 today', icon: Eye, color: 'from-[#880E4F] to-[#AD1457]' },
              { label: 'Interests Received', value: pendingInterests.length, subtext: 'new', icon: Heart, color: 'from-[#AD1457] to-[#C2185B]' },
              { label: 'Interests Sent', value: sentInterests.length, subtext: 'pending', icon: Send, color: 'from-[#C2185B] to-[#EC407A]' },
              { label: 'Visitors', value: recentVisitors.length, subtext: 'this week', icon: User, color: 'from-[#880E4F] to-[#C2185B]' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#FFF0F5] hover:bg-[#FCE4EC] transition-colors cursor-pointer">
                <div className={`w-9 h-9 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <item.icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#4A0E25]">{item.value}</p>
                  <p className="text-[10px] text-[#5D0F3A]">{item.label}</p>
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
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#FCE4EC]">
          <h3 className="text-sm font-medium text-[#5D0F3A] mb-3">Quick Stats</h3>
          <div className="space-y-3">
            {[
              { label: 'Profile Views This Week', value: 45, change: '+12%', positive: true },
              { label: 'Interests Accepted', value: acceptedInterests.length, change: '+2', positive: true },
              { label: 'Pending Requests', value: sentInterests.filter(i => i.status === 'PENDING').length, change: '0', positive: true },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-[#5D0F3A]">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#4A0E25]">{stat.value}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${stat.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'activity' as const, label: 'Activity', icon: TrendingUp },
          { id: 'visitors' as const, label: 'Visitors', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 ease-out whitespace-nowrap transform ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-lg shadow-[#880E4F]/25 scale-[1.02] ring-2 ring-[#F8BBD9]/50'
                : 'bg-gradient-to-b from-[#FFF0F5] to-[#FCE4EC] text-[#5D0F3A] hover:bg-gradient-to-b hover:from-[#FCE4EC] hover:to-[#F8BBD9] hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C2185B]/50 border border-[#F8BBD9]/50'
            }`}
          >
            <tab.icon size={18} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Daily Match Recommendations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#4A0E25] flex items-center gap-2">
                  <Sparkles size={20} className="text-[#C2185B]" />
                  Daily Recommendations
                </h2>
                <p className="text-sm text-[#5D0F3A]">AI-powered matches based on your preferences</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollMatches('left')}
                  className="w-9 h-9 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={18} className="text-[#880E4F]" />
                </button>
                <button
                  onClick={() => scrollMatches('right')}
                  className="w-9 h-9 bg-[#FCE4EC] hover:bg-[#F8BBD9] rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={18} className="text-[#880E4F]" />
                </button>
              </div>
            </div>
            
            <div 
              ref={matchesCarouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dailyMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-sm border border-[#FCE4EC] overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => viewProfile(match.userId)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <User size={32} className="text-rose-400" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        match.compatibilityScore >= 85 ? 'bg-emerald-500' :
                        match.compatibilityScore >= 70 ? 'bg-sky-500' :
                        match.compatibilityScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      {match.compatibilityScore}%
                    </div>
                    {match.isPremium && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-1.5 rounded-full shadow-md">
                        <Crown size={12} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 truncate">{match.name}</h3>
                    <p className="text-gray-500 text-sm truncate">{match.age} yrs • {match.city}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs">{match.religion}</span>
                      <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-xs">{match.motherTongue}</span>
                    </div>
                    {/* Skip and Like Buttons */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          // Skip action - just visual feedback
                        }}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <X size={16} /> Skip
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          shortlistProfile(match.userId); 
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                          shortlisted.includes(match.userId)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] shadow-md'
                        }`}
                      >
                        {shortlisted.includes(match.userId) ? (
                          <>
                            <Check size={16} /> Liked
                          </>
                        ) : (
                          <>
                            <Heart size={16} /> Like
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
              <div className="p-4 border-b border-[#FCE4EC] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#4A0E25] flex items-center gap-2">
                  <HeartHandshake size={20} className="text-[#C2185B]" />
                  Recent Interests Received
                  <span className="bg-[#C2185B] text-white text-xs px-2 py-0.5 rounded-full">{pendingInterests.length}</span>
                </h2>
                <button
                  onClick={() => onNavigate("interests")}
                  className="text-sm text-[#C2185B] hover:underline flex items-center gap-1 font-medium"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-[#FFE4E1]">
                {pendingInterests.slice(0, 3).map((interest) => (
                  <div key={interest.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {interest.profile.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#4A0E25]">{interest.profile.name}</h3>
                          {interest.profile.isVerified && <BadgeCheck size={16} className="text-green-500" />}
                        </div>
                        <p className="text-sm text-[#5D0F3A]">
                          {interest.profile.age} yrs • {interest.profile.city} • {interest.profile.education}
                        </p>
                        {interest.message && (
                          <p className="text-sm text-[#C2185B] italic mt-1 line-clamp-1">&quot;{interest.message}&quot;</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => onNavigate("interests")}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-xl text-sm font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-md flex items-center justify-center gap-1"
                      >
                        <Check size={16} /> Accept
                      </button>
                      <button
                        onClick={() => onNavigate("interests")}
                        className="flex-1 sm:flex-none px-4 py-2 border border-[#F8BBD9] text-[#5D0F3A] rounded-xl text-sm font-medium hover:bg-[#FCE4EC] transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={16} /> Decline
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
        className="w-full flex items-center justify-between p-4 hover:bg-[#FFF0F5] transition-colors"
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

// Saved Search Type
interface SavedSearch {
  id: string;
  name: string;
  filters: typeof ghostFilters;
  createdAt: Date;
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
  savedSearches,
  loadSavedSearch,
  deleteSavedSearch,
  setShowSaveSearchModal,
}: {
  filters: typeof ghostFilters;
  setFilters: React.Dispatch<React.SetStateAction<typeof ghostFilters>>;
  activeFilterCount: number;
  clearFilters: () => void;
  savedSearches: SavedSearch[];
  loadSavedSearch: (saved: SavedSearch) => void;
  deleteSavedSearch: (id: string) => void;
  setShowSaveSearchModal: (show: boolean) => void;
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
          <button onClick={clearFilters} className="text-sm text-[#C2185B] hover:underline">
            Clear All
          </button>
        )}
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="p-4 border-b border-[#FCE4EC] bg-gradient-to-r from-[#FFF0F5] to-white">
          <h4 className="text-sm font-medium text-[#5D0F3A] mb-2 flex items-center gap-2">
            <Bookmark size={14} className="text-[#C2185B]" />
            Saved Searches
          </h4>
          <div className="space-y-2">
            {savedSearches.map((search) => (
              <div 
                key={search.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#F8BBD9] hover:border-[#C2185B] cursor-pointer transition-colors group"
              >
                <span 
                  className="text-sm text-[#4A0E25] flex-1 truncate"
                  onClick={() => loadSavedSearch(search)}
                >
                  {search.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSavedSearch(search.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accordion Filters */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Gender */}
        <AccordionFilter title="Gender" icon={User} defaultOpen={true}>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, gender: filters.gender === 'MALE' ? '' : 'MALE' })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                filters.gender === 'MALE' 
                  ? 'bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white' 
                  : 'bg-[#FCE4EC] text-[#4A0E25] hover:bg-[#F8BBD9]'
              }`}
            >
              Groom
            </button>
            <button
              onClick={() => setFilters({ ...filters, gender: filters.gender === 'FEMALE' ? '' : 'FEMALE' })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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
              className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
              min="18"
            />
            <span className="text-[#5D0F3A]">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAge}
              onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
              className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
              min="18"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
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
              className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
              min="120"
              max="220"
            />
            <span className="text-[#5D0F3A]">to</span>
            <input
              type="number"
              placeholder="Max (cm)"
              value={filters.maxHeight}
              onChange={(e) => setFilters({ ...filters, maxHeight: e.target.value })}
              className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
              min="120"
              max="220"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
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
            className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
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
            className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
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
              <label key={rel} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#FCE4EC] cursor-pointer">
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
            className="w-full p-2 rounded-lg border border-[#F8BBD9] text-sm"
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
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Malayalam', 'Urdu'].map((lang) => (
              <label key={lang} className="flex items-center gap-2 p-1.5 rounded hover:bg-[#FCE4EC] cursor-pointer">
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
              <label key={income.value} className="flex items-center gap-2 p-1.5 rounded hover:bg-[#FCE4EC] cursor-pointer">
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

      {/* Save Search Button */}
      <div className="p-4 border-t border-[#FCE4EC]">
        <button
          onClick={() => setShowSaveSearchModal(true)}
          disabled={activeFilterCount === 0}
          className="w-full py-2.5 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-xl text-sm font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Bookmark size={16} />
          Save This Search
        </button>
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
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: '1', name: 'Hindu Brides 25-30', filters: { ...ghostFilters, gender: 'FEMALE', religion: 'Hindu', minAge: '25', maxAge: '30' }, createdAt: new Date() },
    { id: '2', name: 'Muslim Grooms Mumbai', filters: { ...ghostFilters, gender: 'MALE', religion: 'Muslim', city: 'Mumbai' }, createdAt: new Date() },
  ]);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

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

  const saveSearch = () => {
    if (newSearchName.trim()) {
      setSavedSearches([...savedSearches, {
        id: Date.now().toString(),
        name: newSearchName,
        filters: { ...filters },
        createdAt: new Date()
      }]);
      setNewSearchName("");
      setShowSaveSearchModal(false);
    }
  };

  const loadSavedSearch = (saved: SavedSearch) => {
    setFilters(saved.filters);
    setShowMobileFilters(false);
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id));
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
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-[#F8BBD9] rounded-xl text-sm"
          >
            <Filter size={18} className="text-[#C2185B]" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#C2185B] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
          <FilterSidebarContent
            filters={filters}
            setFilters={setFilters}
            activeFilterCount={activeFilterCount}
            clearFilters={clearFilters}
            savedSearches={savedSearches}
            loadSavedSearch={loadSavedSearch}
            deleteSavedSearch={deleteSavedSearch}
            setShowSaveSearchModal={setShowSaveSearchModal}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#FFF0F5] overflow-y-auto animate-fade-in-up">
              <div className="sticky top-0 bg-[#FFF0F5] p-4 border-b border-[#FCE4EC] flex items-center justify-between z-10">
                <h3 className="font-bold text-[#4A0E25]">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-[#FCE4EC] rounded-lg">
                  <X size={20} className="text-[#5D0F3A]" />
                </button>
              </div>
              <FilterSidebarContent
                filters={filters}
                setFilters={setFilters}
                activeFilterCount={activeFilterCount}
                clearFilters={clearFilters}
                savedSearches={savedSearches}
                loadSavedSearch={loadSavedSearch}
                deleteSavedSearch={deleteSavedSearch}
                setShowSaveSearchModal={setShowSaveSearchModal}
              />
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

      {/* Interest Modal */}
      {showInterestModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in-up">
            <h2 className="text-xl font-bold text-[#4A0E25] mb-4">Send Interest to {selectedProfile.name}</h2>
            <textarea
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Add a personal message (optional)..."
              className="w-full p-3 border border-[#F8BBD9] rounded-xl h-24 focus:ring-2 focus:ring-[#EC407A]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={confirmSendInterest}
                className="flex-1 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3 rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F]"
              >
                Send Interest
              </button>
              <button
                onClick={() => {
                  setShowInterestModal(false);
                  setInterestMessage("");
                  setSelectedProfile(null);
                }}
                className="flex-1 border border-[#F8BBD9] py-3 rounded-xl font-medium hover:bg-[#FCE4EC]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <h2 className="text-xl font-bold text-[#4A0E25] mb-4">Save Search</h2>
            <input
              type="text"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              placeholder="Enter a name for this search..."
              className="w-full p-3 border border-[#F8BBD9] rounded-xl focus:ring-2 focus:ring-[#EC407A]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveSearch}
                disabled={!newSearchName.trim()}
                className="flex-1 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white py-3 rounded-xl font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveSearchModal(false);
                  setNewSearchName("");
                }}
                className="flex-1 border border-[#F8BBD9] py-3 rounded-xl font-medium hover:bg-[#FCE4EC]"
              >
                Cancel
              </button>
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
                        <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                          <ShieldCheck size={12} /> Verified
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
                              <ShieldCheck size={16} className="text-emerald-500" />
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
}: {
  onNavigate: (page: Page) => void;
  interactions: MockInteraction[];
  acceptInterest: (id: string) => void;
  declineInterest: (id: string) => void;
  shortlisted: string[];
  shortlistProfile: (id: string) => void;
  viewProfile: (id: string) => void;
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

  const handleSendInterestFromShortlist = (profile: MockProfile) => {
    // Navigate to search page to send interest
    // In a real app, this would call the sendInterest function
    onNavigate("search");
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E25] mb-4 sm:mb-6 flex items-center gap-2">
        <Heart size={28} className="text-[#C2185B]" />
        Interests
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-md border border-[#FCE4EC] overflow-x-auto">
        {[
          { id: "received" as const, label: "Received", count: receivedInterests.length },
          { id: "sent" as const, label: "Sent", count: sentInterests.length },
          { id: "accepted" as const, label: "Accepted", count: acceptedInterests.length },
          { id: "shortlisted" as const, label: "Shortlisted", count: shortlistedInteractions.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap transform focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-lg shadow-[#880E4F]/25 scale-[1.02] focus:ring-[#C2185B]"
                : "bg-gradient-to-b from-[#FFF0F5] to-[#FCE4EC] text-[#5D0F3A] hover:bg-gradient-to-b hover:from-[#FCE4EC] hover:to-[#F8BBD9] hover:scale-[1.02] hover:shadow-md focus:ring-[#C2185B]/50 border border-[#F8BBD9]/50"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            {tab.count > 0 && (
              <span className={`ml-1.5 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? "bg-white/25 text-white" : "bg-gradient-to-r from-[#FCE4EC] to-[#F8BBD9] text-[#880E4F]"
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
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSendInterestFromShortlist(interaction.profile); }}
                        className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-lg text-xs sm:text-sm font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Heart size={14} /> Send Interest
                      </button>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Icebreaker suggestions
  const icebreakers = [
    "Hi! I noticed we have similar interests. Would love to know more about you!",
    "Your profile caught my attention. What do you enjoy doing in your free time?",
    "Hello! I see you're from the same city. How do you like it there?",
    "Hi! Your profession sounds interesting. What inspired you to choose this field?",
    "Hey! I loved reading your bio. What's your favorite travel destination?",
  ];

  const filteredConversations = conversations.filter(c =>
    c.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatMessages = activeChat
    ? messages.filter(m => m.senderId === activeChat || m.receiverId === activeChat)
    : [];

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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#4A0E25] mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-[#C2185B] sm:w-7 sm:h-7 md:w-8 md:h-8" />
        <span>Messages</span>
      </h1>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-[#FCE4EC] overflow-hidden h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] md:h-[calc(100vh-280px)] min-h-[350px] sm:min-h-[400px] md:min-h-[450px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[280px] lg:w-[320px] xl:w-[360px] border-r border-[#FCE4EC] flex-col flex-shrink-0`}>
            <div className="p-2 sm:p-3 border-b border-[#FCE4EC]">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 sm:p-2.5 text-sm sm:text-base bg-[#FFF0F5] rounded-lg border-none focus:ring-2 focus:ring-[#EC407A] min-h-[40px] sm:min-h-[44px]"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => {
                    setActiveChat(conv.userId);
                    markMessagesRead(conv.userId);
                  }}
                  className={`w-full p-3 sm:p-4 flex items-start gap-2 sm:gap-3 border-b border-[#FCE4EC] text-left hover:bg-[#FCE4EC] transition-colors min-h-[72px] sm:min-h-[80px] ${
                    activeChat === conv.userId ? "bg-[#FFF0F5]" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      {conv.profile.name[0]}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-[#880E4F] rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-medium text-[#4A0E25] text-sm sm:text-base truncate flex-shrink-0">{conv.profile.name}</h3>
                      {conv.lastMessage && (
                        <span className="text-[10px] sm:text-xs text-[#5D0F3A] flex-shrink-0 whitespace-nowrap">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#5D0F3A] line-clamp-2 mt-0.5 leading-tight">
                      {conv.lastMessage?.content || "Start a conversation!"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-2 sm:p-3 md:p-4 border-b border-[#FCE4EC] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden p-1.5 sm:p-2 hover:bg-[#FCE4EC] rounded-lg flex-shrink-0"
                    >
                      <ChevronLeft size={20} className="text-[#880E4F]" />
                    </button>
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {activeConversation?.profile.name[0]}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-[#4A0E25] text-sm sm:text-base truncate">
                        {activeConversation?.profile.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
                    <button
                      onClick={handleVideoCall}
                      className="p-1.5 sm:p-2 hover:bg-[#FCE4EC] rounded-lg transition-colors min-h-[36px] sm:min-h-[40px] min-w-[36px] sm:min-w-[40px] flex items-center justify-center"
                      title="Video Call"
                    >
                      <Video size={16} className="text-[#880E4F] sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={() => onNavigate("profileView")}
                      className="p-1.5 sm:p-2 hover:bg-[#FCE4EC] rounded-lg transition-colors min-h-[36px] sm:min-h-[40px] min-w-[36px] sm:min-w-[40px] flex items-center justify-center"
                      title="View Profile"
                    >
                      <User size={16} className="text-[#880E4F] sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-[#FCE4EC] rounded-lg transition-colors min-h-[36px] sm:min-h-[40px] min-w-[36px] sm:min-w-[40px] flex items-center justify-center">
                      <MoreVertical size={16} className="text-[#880E4F] sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[#5D0F3A] p-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FCE4EC] rounded-full flex items-center justify-center mb-3">
                        <Sparkles size={24} className="text-[#C2185B] sm:w-7 sm:h-7" />
                      </div>
                      <p className="font-medium text-[#4A0E25] text-sm sm:text-base">Start the conversation!</p>
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
                            className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl ${
                              msg.senderId === 'ghost-user'
                                ? "bg-gradient-to-r from-[#880E4F] to-[#AD1457] text-white rounded-br-sm sm:rounded-br-md"
                                : "bg-[#FFF0F5] text-[#4A0E25] rounded-bl-sm sm:rounded-bl-md"
                            }`}
                          >
                            <p className="text-xs sm:text-sm md:text-base break-words">{msg.content}</p>
                            <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1 ${
                              msg.senderId === 'ghost-user' ? "text-white/70" : "text-[#5D0F3A]"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {msg.senderId === 'ghost-user' && (
                                <span className="flex items-center ml-0.5">
                                  {msg.isRead ? (
                                    <CheckCheck size={12} className="text-blue-300 sm:w-3.5 sm:h-3.5" title="Read" />
                                  ) : (
                                    <Check size={12} className="text-white/60 sm:w-3.5 sm:h-3.5" title="Sent" />
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
                          <div className="bg-[#FFF0F5] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl rounded-bl-sm sm:rounded-bl-md">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C2185B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C2185B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#C2185B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
                  <div className="absolute bottom-16 sm:bottom-20 left-2 right-2 sm:left-4 sm:right-4 md:left-6 md:right-auto md:bottom-20 md:left-24 bg-white rounded-lg sm:rounded-xl shadow-lg border border-[#FCE4EC] p-2 sm:p-3 z-10 max-w-sm md:max-w-md">
                    <p className="text-[10px] sm:text-xs text-[#880E4F] font-medium mb-1.5 sm:mb-2 flex items-center gap-1">
                      <Sparkles size={10} className="sm:w-3 sm:h-3" /> Suggested Icebreakers
                    </p>
                    <div className="space-y-1 sm:space-y-2 max-h-48 overflow-y-auto">
                      {icebreakers.map((text, i) => (
                        <button
                          key={i}
                          onClick={() => handleIcebreakerSelect(text)}
                          className="w-full text-left p-1.5 sm:p-2 text-xs sm:text-sm text-[#4A0E25] hover:bg-[#FCE4EC] rounded-lg transition-colors"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-2 sm:p-3 md:p-4 border-t border-[#FCE4EC] bg-white">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setShowIcebreakers(!showIcebreakers)}
                      className="p-1.5 sm:p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors flex-shrink-0 min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center"
                      title="Icebreakers"
                    >
                      <Sparkles size={16} className="text-[#C2185B] sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      className="p-1.5 sm:p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors flex-shrink-0 min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center"
                      title="Attach file"
                    >
                      <Paperclip size={16} className="text-[#AD1457] sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      className="p-1.5 sm:p-2.5 hover:bg-[#FCE4EC] rounded-lg transition-colors flex-shrink-0 min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center"
                      title="Emoji"
                    >
                      <Smile size={16} className="text-[#AD1457] sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 p-2 sm:p-2.5 md:p-3 rounded-full border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A] focus:border-transparent text-xs sm:text-sm md:text-base min-w-0 min-h-[36px] sm:min-h-[44px]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 sm:p-2.5 md:px-4 md:py-3 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-full font-medium hover:from-[#5D0F3A] hover:via-[#880E4F] hover:to-[#AD1457] disabled:opacity-50 transition-all flex-shrink-0 min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] md:min-w-[52px] flex items-center justify-center shadow-md"
                    >
                      <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#5D0F3A]">
                <div className="text-center p-4">
                  <div className="text-4xl sm:text-5xl mb-4">💬</div>
                  <p className="text-sm sm:text-base">Select a conversation to start messaging</p>
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
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    updateProfile(formData);
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#4A0E25] mb-6">👤 My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-[#FCE4EC] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#880E4F] to-[#C2185B] p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              {profile.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-white/80">{profile.city}, {profile.state}</p>
              <div className="flex gap-2 mt-2">
                {profile.isVerified && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✓ Verified</span>
                )}
                {profile.isPremium && (
                  <span className="bg-yellow-500 px-3 py-1 rounded-full text-sm">⭐ Premium</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A0E25] mb-1">Education</label>
                  <input
                    type="text"
                    value={formData.education || ''}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#4A0E25] mb-1">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-[#F8BBD9] focus:ring-2 focus:ring-[#EC407A]"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 border border-[#F8BBD9] text-[#4A0E25] rounded-lg font-medium hover:bg-[#FCE4EC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className="text-base font-semibold text-[#4A0E25] mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs text-[#5D0F3A]">Age</p>
                    <p className="font-medium text-[#4A0E25] text-sm">{profile.age} years</p>
                  </div>
                  <div className="p-3 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs text-[#5D0F3A]">Height</p>
                    <p className="font-medium text-[#4A0E25] text-sm">{profile.height} cm</p>
                  </div>
                  <div className="p-3 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs text-[#5D0F3A]">Religion</p>
                    <p className="font-medium text-[#4A0E25] text-sm">{profile.religion}</p>
                  </div>
                  <div className="p-3 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs text-[#5D0F3A]">Mother Tongue</p>
                    <p className="font-medium text-[#4A0E25] text-sm">{profile.motherTongue}</p>
                  </div>
                </div>
              </div>

              {/* Education & Career */}
              <div>
                <h3 className="text-base font-semibold text-[#4A0E25] mb-3">Education & Career</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs text-[#5D0F3A]">Education</p>
                    <p className="font-medium text-[#4A0E25] text-sm">{profile.education || 'Not specified'}</p>
                  </div>
                  <div className="p-3 bg-[#FFF0F5] rounded-lg">
                    <p className="text-xs text-[#5D0F3A]">Occupation</p>
                    <p className="font-medium text-[#4A0E25] text-sm">{profile.occupation || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="text-base font-semibold text-[#4A0E25] mb-3">About Me</h3>
                  <p className="text-sm text-[#5D0F3A]">{profile.bio}</p>
                </div>
              )}

              <button
                onClick={() => setEditing(true)}
                className="w-full py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md"
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

function SettingsPage({
  onNavigate,
  profile,
  preferences,
  updateProfile,
  updatePreferences,
}: {
  onNavigate: (page: Page) => void;
  profile: typeof ghostUserProfile;
  preferences: typeof ghostPartnerPreferences;
  updateProfile: (updates: Partial<typeof ghostUserProfile>) => void;
  updatePreferences: (updates: Partial<typeof ghostPartnerPreferences>) => void;
}) {
  const [activeSection, setActiveSection] = useState<"account" | "preferences" | "privacy" | "premium">("account");
  const [prefForm, setPrefForm] = useState(preferences);
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    photoPrivacy: "all",
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
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const navItems = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "preferences" as const, label: "Partner Preferences", icon: Heart },
    { id: "privacy" as const, label: "Privacy", icon: Lock },
    { id: "premium" as const, label: "Premium", icon: Crown },
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

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white border-b border-[#FCE4EC] p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white"
                  : "bg-[#FCE4EC] text-[#4A0E25]"
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
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

              {/* Photo Privacy */}
              <div className="bg-white rounded-xl border border-[#FCE4EC] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-lg flex items-center justify-center">
                    <Camera size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A0E25]">Photo Privacy</h3>
                </div>
                <p className="text-[#5D0F3A] mb-4 text-sm">Control who can see your photos.</p>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Show to all", desc: "All users can see your photos" },
                    { value: "accepted", label: "Show to accepted only", desc: "Only accepted matches can see your photos" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                        privacySettings.photoPrivacy === option.value
                          ? "border-[#C2185B] bg-[#FCE4EC]"
                          : "border-[#FCE4EC] hover:border-[#F8BBD9]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="photoPrivacy"
                        value={option.value}
                        checked={privacySettings.photoPrivacy === option.value}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, photoPrivacy: e.target.value })}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#4A0E25]">{option.label}</p>
                        <p className="text-sm text-[#5D0F3A]">{option.desc}</p>
                      </div>
                      {privacySettings.photoPrivacy === option.value && (
                        <div className="w-5 h-5 bg-gradient-to-br from-[#880E4F] to-[#C2185B] rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
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
              <button className="w-full py-3 bg-gradient-to-r from-[#880E4F] to-[#C2185B] text-white rounded-lg font-medium hover:from-[#5D0F3A] hover:to-[#880E4F] transition-all shadow-md">
                Save Privacy Settings
              </button>
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
  const extendedData = getExtendedProfileData(profile.userId);
  const icebreakers = generateIcebreakers(profile.name, {
    occupation: profile.occupation,
    city: profile.city,
    education: profile.education,
    hobbies: extendedData.hobbies
  });

  // Generate inline SVG avatar placeholders (no external dependency)
  const avatarSeed = profile.name.replace(/\s+/g, '').toLowerCase();
  const avatarColors = ['FCE4EC', 'F8BBD9', 'E1BEE7', 'FFCDD2', 'F3E5F5'];
  const initial = profile.name.charAt(0).toUpperCase();
  
  const generateAvatarSVG = (color: string, text: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#${color}"/>
      <circle cx="50" cy="38" r="20" fill="#880E4F" opacity="0.3"/>
      <ellipse cx="50" cy="85" rx="30" ry="25" fill="#880E4F" opacity="0.3"/>
      <text x="50" y="55" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#880E4F" text-anchor="middle">${text}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const photos = [
    { id: 1, url: generateAvatarSVG(avatarColors[0], initial), caption: 'Profile Photo', isPrimary: true },
    { id: 2, url: generateAvatarSVG(avatarColors[1], initial), caption: 'Lifestyle', isPrimary: false },
    { id: 3, url: generateAvatarSVG(avatarColors[2], initial), caption: 'With Family', isPrimary: false },
    { id: 4, url: generateAvatarSVG(avatarColors[3], initial), caption: 'Holiday', isPrimary: false },
    { id: 5, url: generateAvatarSVG(avatarColors[4], initial), caption: 'Professional', isPrimary: false },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-pink-50/30 pb-24">
      {/* Photo Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 active:scale-95 transition-all duration-200 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  lightboxIndex === i ? 'border-white scale-110 shadow-lg' : 'border-white/30 hover:border-white/60 hover:scale-105 active:scale-95'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9]"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section with Photo Gallery */}
      <div className="relative">
        {/* Photo Gallery - Clickable */}
        <div 
          className="relative h-80 md:h-96 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 cursor-pointer overflow-hidden"
          onClick={() => openLightbox(currentPhoto)}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#880E4F]/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-[#C2185B]/10 to-transparent rounded-full blur-3xl" />
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center group">
            {/* Main circular avatar with enhanced glow */}
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 bg-gradient-to-br from-[#880E4F]/20 via-[#AD1457]/15 to-[#C2185B]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              {/* Inner glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-br from-white/60 to-white/30 rounded-full" />
              
              {/* Main photo container - larger and more prominent */}
              <div className="relative w-48 h-48 md:w-56 md:h-56 bg-white rounded-full flex items-center justify-center shadow-[0_8px_40px_-12px_rgba(136,14,79,0.35)] border-4 border-white group-hover:scale-[1.02] transition-transform duration-300 ease-out overflow-hidden">
                <img 
                  key={currentPhoto}
                  src={photos[currentPhoto].url} 
                  alt={profile.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* Gallery indicator overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 rounded-full flex items-center justify-center transition-all duration-300">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <ImageIcon size={18} />
                    <span className="text-sm font-semibold tracking-wide">{photos.length} Photos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Navigation Arrow - Enhanced */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
              }}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#880E4F] hover:bg-white hover:scale-110 active:scale-95 hover:shadow-xl shadow-lg border border-[#F8BBD9]/50 transition-all duration-200 z-10 group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2"
              aria-label="Previous photo"
            >
              <ChevronLeft size={26} className="md:w-7 md:h-7 group-hover/btn:-translate-x-0.5 transition-transform duration-200" />
            </button>
          )}

          {/* Right Navigation Arrow - Enhanced */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#880E4F] hover:bg-white hover:scale-110 active:scale-95 hover:shadow-xl shadow-lg border border-[#F8BBD9]/50 transition-all duration-200 z-10 group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2"
              aria-label="Next photo"
            >
              <ChevronRight size={26} className="md:w-7 md:h-7 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </button>
          )}

          {/* Photo Navigation Dots - More Elegant */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-[#F8BBD9]/40">
            <span className="text-xs font-medium text-[#880E4F] mr-1">{currentPhoto + 1}</span>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500 mr-2">{photos.length}</span>
            <div className="flex gap-1.5">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhoto(i);
                  }}
                  className={`rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] ${
                    currentPhoto === i
                      ? 'bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] w-6 h-2 shadow-md'
                      : 'bg-gray-300 hover:bg-[#C2185B]/50 w-2 h-2 hover:scale-125 active:scale-110'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Watermark Overlay - More subtle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/5 text-white/40 text-[10px] px-3 py-0.5 rounded-full backdrop-blur-sm rotate-12 border border-white/10 tracking-wide">
              🔒 Protected
            </div>
          </div>

          {/* Back Button - Enhanced */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('matches');
            }}
            className="absolute top-4 left-4 w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#880E4F] hover:bg-white hover:scale-110 active:scale-95 shadow-lg border border-[#F8BBD9]/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2"
          >
            <ArrowRight size={20} className="rotate-180" />
          </button>

          {/* Share & More Options - Enhanced */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#880E4F] hover:bg-white hover:scale-110 active:scale-95 shadow-lg border border-[#F8BBD9]/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-[#880E4F] hover:bg-white hover:scale-110 active:scale-95 shadow-lg border border-[#F8BBD9]/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2"
            >
              <MoreVertical size={18} />
            </button>
          </div>

        </div>

        {/* Profile Header */}
        <div className="relative bg-white rounded-t-3xl -mt-6 shadow-xl border-t border-rose-100">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Name with status badges - Enhanced typography */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{profile.name}</h1>
                  <div className="flex items-center gap-1.5">
                    {profile.isPremium && (
                      <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Crown size={11} /> Premium
                      </span>
                    )}
                    {profile.isVerified && (
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-emerald-200/50">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                    {isOnline && (
                      <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Online
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Subtle divider */}
                <div className="h-px bg-gradient-to-r from-rose-100 via-rose-50 to-transparent mt-2.5 mb-2.5" />
                
                {/* Info line - refined typography */}
                <p className="text-gray-600 text-sm md:text-base font-medium">
                  <span className="text-gray-800">{profile.age} yrs</span>
                  <span className="text-gray-300 mx-2">•</span>
                  <span>{profile.height} cm</span>
                  <span className="text-gray-300 mx-2">•</span>
                  <span className="text-[#880E4F]">{profile.city}</span>
                </p>
                
                {/* Attribute pills - refined with better spacing */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-gradient-to-r from-rose-50 to-pink-50 text-[#880E4F] px-3 py-1.5 rounded-full text-xs font-medium border border-rose-100/50 shadow-sm">{profile.religion}</span>
                  <span className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 px-3 py-1.5 rounded-full text-xs font-medium border border-violet-100/50 shadow-sm">{profile.motherTongue}</span>
                  <span className="bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 px-3 py-1.5 rounded-full text-xs font-medium border border-sky-100/50 shadow-sm">{profile.maritalStatus.replace('_', ' ')}</span>
                  {profile.occupation && (
                    <span className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-100/50 shadow-sm">{profile.occupation}</span>
                  )}
                </div>
                
                {/* Match Score - Enhanced badge design */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`relative px-4 py-2 rounded-xl ${compatColor.bg} flex items-center gap-2.5 shadow-md border border-current/10 overflow-hidden group`}
                       style={{ borderColor: compatColor.text.replace('text-', '').replace('-700', '-200') }}>
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-bold ${compatColor.text}`}>{compatibilityScore}%</span>
                      <span className={`text-xs font-medium ${compatColor.text} opacity-80`}>Match</span>
                    </div>
                    <div className={`w-px h-4 ${compatColor.text.replace('text-', 'bg-').replace('-700', '-300')}`} />
                    <span className={`text-xs font-medium ${compatColor.text} opacity-70`}>{getCompatibilityLabel(compatibilityScore)}</span>
                  </div>
                </div>
              </div>
              
              {/* Profile Photo Thumbnail - with subtle border/glow */}
              <div className="relative flex-shrink-0">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[#880E4F]/20 to-[#C2185B]/20 rounded-xl blur-md" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white bg-gradient-to-br from-rose-50 to-pink-50">
                  <img
                    key={`thumb-${currentPhoto}`}
                    src={photos[currentPhoto].url}
                    alt={profile.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs - Enhanced */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'about', label: 'About', icon: User },
                { id: 'education', label: 'Education & Career', icon: GraduationCap },
                { id: 'family', label: 'Family Details', icon: Users },
                { id: 'lifestyle', label: 'Lifestyle', icon: Sparkles },
                { id: 'partner', label: 'Partner Preferences', icon: Heart },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ease-out transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    activeSection === section.id
                      ? 'bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white shadow-lg shadow-[#880E4F]/30 scale-[1.02] ring-2 ring-[#F8BBD9]/40'
                      : 'bg-white text-[#5D0F3A] hover:bg-gradient-to-br hover:from-[#FCE4EC] hover:to-[#FFF0F5] hover:scale-[1.02] hover:shadow-md border border-[#F8BBD9]/60 hover:border-[#C2185B]/40'
                  }`}
                >
                  {/* Active indicator glow */}
                  {activeSection === section.id && (
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  )}
                  <section.icon 
                    size={16} 
                    className={`transition-transform duration-300 flex-shrink-0 ${activeSection === section.id ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'}`} 
                  />
                  <span className="hidden sm:inline whitespace-nowrap">{section.label}</span>
                  <span className="sm:hidden whitespace-nowrap">{section.label.split(' ')[0]}</span>
                  {/* Touch ripple effect placeholder */}
                  <span className="absolute inset-0 rounded-2xl active:bg-white/10 pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar - Enhanced */}
      {showActions && (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-[#F8BBD9]/50 shadow-[0_4px_20px_-8px_rgba(136,14,79,0.15)]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {interestSent ? (
              <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 text-emerald-700 rounded-2xl font-semibold border border-emerald-200/80 shadow-sm">
                <Check size={20} className="text-emerald-600" /> Interest Sent
              </div>
            ) : (
              <button
                onClick={() => sendInterest(profile)}
                className="relative flex-1 py-3.5 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-2xl font-semibold hover:from-[#6B0D3C] hover:via-[#880E4F] hover:to-[#AD1457] active:from-[#4A0E25] active:via-[#6B0D3C] active:to-[#880E4F] transition-all duration-300 ease-out flex items-center justify-center gap-2.5 shadow-lg shadow-[#880E4F]/35 hover:shadow-xl hover:shadow-[#880E4F]/45 active:shadow-md active:shadow-[#880E4F]/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-[52px] overflow-hidden group"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <Heart size={20} className="transition-transform duration-200 group-hover:scale-110 group-active:scale-90 relative z-10" />
                <span className="relative z-10">Send Interest</span>
              </button>
            )}
            <button
              onClick={() => shortlistProfile(profile.userId)}
              className={`relative px-5 py-3.5 rounded-2xl font-semibold transition-all duration-300 ease-out flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-h-[52px] hover:scale-[1.02] active:scale-[0.98] ${
                shortlisted.includes(profile.userId)
                  ? 'bg-gradient-to-br from-amber-100 via-amber-200 to-amber-100 text-amber-800 border-2 border-amber-300/80 shadow-md shadow-amber-200/40 focus-visible:ring-amber-400 hover:shadow-lg hover:shadow-amber-300/50'
                  : 'bg-white text-[#880E4F] hover:bg-gradient-to-br hover:from-[#FCE4EC] hover:to-[#FFF0F5] shadow-sm hover:shadow-md focus-visible:ring-[#C2185B] border border-[#F8BBD9]/80 hover:border-[#C2185B]/50'
              }`}
            >
              {shortlisted.includes(profile.userId) ? (
                <Bookmark size={20} className="fill-amber-600 text-amber-600 transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <Bookmark size={20} className="transition-transform duration-200 group-hover:scale-110" />
              )}
              <span className="hidden sm:inline">{shortlisted.includes(profile.userId) ? 'Shortlisted' : 'Shortlist'}</span>
            </button>
            <button className="relative px-5 py-3.5 bg-white text-[#880E4F] rounded-2xl font-semibold hover:bg-gradient-to-br hover:from-[#FCE4EC] hover:to-[#FFF0F5] transition-all duration-300 ease-out flex items-center gap-2.5 md:hidden shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2 min-h-[52px] border border-[#F8BBD9]/80 hover:border-[#C2185B]/50">
              <Share2 size={20} className="transition-transform duration-200 group-hover:scale-110" />
            </button>
            <button className="relative px-5 py-3.5 bg-white text-[#880E4F] rounded-2xl font-semibold hover:bg-gradient-to-br hover:from-[#FCE4EC] hover:to-[#FFF0F5] transition-all duration-300 ease-out flex items-center gap-2.5 hidden md:flex shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2 min-h-[52px] border border-[#F8BBD9]/80 hover:border-[#C2185B]/50">
              <MessageCircle size={20} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button className="relative px-5 py-3.5 bg-white text-[#880E4F] rounded-2xl font-semibold hover:bg-gradient-to-br hover:from-[#FCE4EC] hover:to-[#FFF0F5] transition-all duration-300 ease-out flex items-center gap-2.5 hidden md:flex shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2185B] focus-visible:ring-offset-2 min-h-[52px] border border-[#F8BBD9]/80 hover:border-[#C2185B]/50">
              <Phone size={20} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden sm:inline">Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content with Tab Sections */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* About Section */}
        {activeSection === 'about' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center shadow-md">
                  <User size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">About Me</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {profile.bio || 'No bio available. This user hasn\'t written about themselves yet.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(extendedData.hobbies || []).map((hobby, i) => (
                  <span key={i} className="bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                    ✨ {hobby}
                  </span>
                ))}
              </div>
            </section>

            {/* Basic Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-sky-200/50">
                    <UserCircle size={20} className="text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Basic Information</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Personal details & background</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <InfoRow label="Age" value={`${profile.age} years`} />
                  <InfoRow label="Height" value={`${profile.height} cm`} />
                  <InfoRow label="Marital Status" value={profile.maritalStatus.replace('_', ' ')} />
                  <InfoRow label="Mother Tongue" value={profile.motherTongue} />
                </div>
              </div>
            </section>

            {/* Religious & Astrological Background */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-violet-200/50">
                    <Sparkles size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Religious & Astrological</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Spiritual background & beliefs</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <InfoRow label="Religion" value={profile.religion} />
                  {profile.caste && <InfoRow label="Caste" value={profile.caste} />}
                  {extendedData.gothra && <InfoRow label="Gothra" value={extendedData.gothra} />}
                  {extendedData.rashi && <InfoRow label="Rashi" value={extendedData.rashi} />}
                  {extendedData.nakshatra && <InfoRow label="Nakshatra" value={extendedData.nakshatra} />}
                  <InfoRow label="Manglik" value={extendedData.manglik} />
                  {extendedData.birthTime && <InfoRow label="Birth Time" value={extendedData.birthTime} />}
                  {extendedData.birthPlace && <InfoRow label="Birth Place" value={extendedData.birthPlace} />}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Education & Career Section */}
        {activeSection === 'education' && (
          <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
            {/* Header with gradient accent */}
            <div className="relative px-5 pt-5 pb-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-rose-500" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center shadow-md ring-1 ring-[#880E4F]/20">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Education & Career</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Academic & professional background</p>
                </div>
              </div>
              {/* Subtle separator line */}
              <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="px-5 pb-5 pt-2">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <InfoRow label="Education" value={profile.education || 'Not specified'} />
                {extendedData.college && <InfoRow label="College" value={extendedData.college} />}
                <InfoRow label="Occupation" value={profile.occupation || 'Not specified'} />
                {extendedData.company && <InfoRow label="Company" value={extendedData.company} />}
                <InfoRow label="Annual Income" value={`₹${((profile.annualIncome || 0) / 100000).toFixed(0)} LPA`} />
              </div>
            </div>
            
            {/* Career Highlights */}
            <div className="mx-5 mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2 text-sm">
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
          <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
            {/* Header with gradient accent */}
            <div className="relative px-5 pt-5 pb-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-amber-200/50">
                  <Users size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Family Details</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Family background & values</p>
                </div>
              </div>
              {/* Subtle separator line */}
              <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="px-5 pb-5 pt-2">
              <div className="grid sm:grid-cols-2 gap-2.5">
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
            </div>
            
            {/* Family Summary Card */}
            <div className="mx-5 mb-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm">
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
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-rose-200/50">
                    <Sparkles size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Lifestyle</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Habits & preferences</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <InfoRow label="Diet" value={extendedData.diet} />
                  <InfoRow label="Drinking" value={extendedData.drinking} />
                  <InfoRow label="Smoking" value={extendedData.smoking} />
                  {extendedData.bloodGroup && <InfoRow label="Blood Group" value={extendedData.bloodGroup} />}
                </div>
              </div>
            </section>

            {/* Personality & Love Language */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-red-400" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-pink-200/50">
                    <Heart size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Personality & Love Language</h2>
                    <p className="text-xs text-gray-400 mt-0.5">What makes them unique</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="grid sm:grid-cols-2 gap-3">
                  {extendedData.personalityType && (
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 transition-all duration-300 hover:shadow-md hover:border-violet-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium">MBTI Personality</p>
                      <p className="text-xl font-bold text-violet-700 tracking-tight">{extendedData.personalityType}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {extendedData.personalityType.includes('E') ? 'Extrovert' : 'Introvert'} • 
                        {extendedData.personalityType.includes('N') ? ' Intuitive' : ' Sensing'} • 
                        {extendedData.personalityType.includes('F') ? ' Feeling' : ' Thinking'} • 
                        {extendedData.personalityType.includes('P') ? ' Perceiving' : ' Judging'}
                      </p>
                    </div>
                  )}
                  {extendedData.loveLanguage && (
                    <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100 transition-all duration-300 hover:shadow-md hover:border-rose-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Primary Love Language</p>
                      <p className="text-xl font-bold text-rose-700 tracking-tight">{extendedData.loveLanguage}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {extendedData.loveLanguage === 'Quality Time' && 'Values undivided attention and meaningful moments'}
                        {extendedData.loveLanguage === 'Words of Affirmation' && 'Appreciates verbal encouragement and compliments'}
                        {extendedData.loveLanguage === 'Acts of Service' && 'Values helpful actions and thoughtful gestures'}
                        {extendedData.loveLanguage === 'Gifts' && 'Appreciates thoughtful presents and tokens of love'}
                        {extendedData.loveLanguage === 'Physical Touch' && 'Values physical connection and closeness'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Voice Note Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-sky-200/50">
                    <Mic size={20} className="text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Voice Introduction</h2>
                    <p className="text-xs text-gray-400 mt-0.5">A personal message from {profile.name.split(' ')[0]}</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 flex items-center gap-4 border border-sky-100">
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all text-sky-600 hover:text-sky-700 hover:scale-105 transform">
                    <Play size={20} />
                  </button>
                  <div className="flex-1">
                    <div className="flex gap-0.5 items-center h-10">
                      {[30, 50, 70, 40, 60, 80, 45, 55, 75, 35, 65, 85, 40, 50, 60, 70, 45, 55, 65, 75, 35, 45, 55, 65, 40, 50, 60, 70, 50, 60, 70, 80, 45, 55, 65, 75, 40, 50, 60, 70].map((height, i) => (
                        <div
                          key={i}
                          className="w-1 bg-sky-300 rounded-full transition-all hover:bg-sky-400"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-gray-500 font-medium">
                      <span>0:00</span>
                      <span>0:15</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Partner Preferences Section */}
        {activeSection === 'partner' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#880E4F] via-[#AD1457] to-rose-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#880E4F] to-[#AD1457] rounded-xl flex items-center justify-center shadow-md ring-1 ring-[#880E4F]/20">
                    <Heart size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Partner Preferences Match</h2>
                    <p className="text-xs text-gray-400 mt-0.5">How your profile matches their preferences</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
          
          {/* Content */}
          <div className="px-5 pb-5 pt-2 space-y-2">
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
          
          <div className="mx-5 mb-5 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold text-sm">Overall Match</span>
              <span className="text-rose-600 font-bold text-sm">{matchCount}/{totalPreferences} criteria met</span>
            </div>
            <div className="mt-2 h-2 bg-white rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#880E4F] to-[#AD1457] rounded-full transition-all"
                style={{ width: `${(matchCount / totalPreferences) * 100}%` }}
              />
            </div>
          </div>
        </section>

            {/* Trust & Verification Breakdown */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-emerald-200/50">
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Trust & Verification</h2>
                    <p className="text-xs text-gray-400 mt-0.5">How this profile has been verified</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <VerificationBadge label="Aadhaar Card" verified={extendedData.verifications.aadhaar} />
                  <VerificationBadge label="Phone Number" verified={extendedData.verifications.phone} />
                  <VerificationBadge label="Email Address" verified={extendedData.verifications.email} />
                  <VerificationBadge label="LinkedIn" verified={extendedData.verifications.linkedin} />
                  <VerificationBadge label="Selfie Video" verified={extendedData.verifications.selfieVideo} />
                  <VerificationBadge label="Income Proof" verified={extendedData.verifications.income} />
                </div>
              </div>
            </section>

            {/* Location Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-red-400" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-rose-200/50">
                    <MapPin size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Location</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Where they're based</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold text-lg">{profile.city}, {profile.state}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{profile.country}</p>
                  </div>
                  <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center ring-1 ring-rose-200/30">
                    <MapPin size={32} className="text-rose-400" />
                  </div>
                </div>
              </div>
            </section>

            {/* Icebreaker Prompts */}
            <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200/60">
              {/* Header with gradient accent */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-amber-200/50">
                    <MessageCircle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Icebreakers</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Start a conversation with {profile.name.split(' ')[0]}</p>
                  </div>
                </div>
                {/* Subtle separator line */}
                <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="px-5 pb-5 pt-2">
                <div className="space-y-2.5">
                  {icebreakers.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      className="relative w-full p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl text-left hover:from-amber-100 hover:via-orange-100 hover:to-amber-100 active:from-amber-150 active:via-orange-150 transition-all duration-200 ease-out group border border-amber-100/80 hover:border-amber-200/80 hover:shadow-md active:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
                    >
                      {/* Shimmer effect on hover */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out pointer-events-none" />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-gray-700 group-hover:text-amber-800 font-medium transition-colors">{prompt}</span>
                        <ArrowRight size={18} className="text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </button>
                  ))}
                </div>
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

      </div>

      {/* Bottom Sticky Action Bar - Mobile Only - Enhanced for Touch */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/[0.98] backdrop-blur-lg border-t border-[#F8BBD9]/60 shadow-[0_-8px_30px_-12px_rgba(136,14,79,0.2)] z-50 md:hidden safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-3">
          {interestSent ? (
            <div className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 text-emerald-700 rounded-2xl font-semibold border border-emerald-200/80 shadow-sm">
              <Check size={22} className="text-emerald-600" /> Interest Sent
            </div>
          ) : (
            <button
              onClick={() => sendInterest(profile)}
              className="relative flex-1 py-4 bg-gradient-to-br from-[#880E4F] via-[#AD1457] to-[#C2185B] text-white rounded-2xl font-semibold active:from-[#4A0E25] active:via-[#6B0D3C] active:to-[#880E4F] transition-all duration-200 ease-out flex items-center justify-center gap-2.5 shadow-xl shadow-[#880E4F]/40 active:shadow-lg active:shadow-[#880E4F]/35 active:scale-[0.98] min-h-[60px] overflow-hidden"
            >
              {/* Touch ripple effect overlay */}
              <span className="absolute inset-0 active:bg-white/10 pointer-events-none rounded-2xl" />
              <Heart size={22} className="transition-transform duration-150 active:scale-90 relative z-10" />
              <span className="relative z-10 text-base">Send Interest</span>
            </button>
          )}
          <button
            onClick={() => shortlistProfile(profile.userId)}
            className={`relative p-4 rounded-2xl font-semibold transition-all duration-200 ease-out min-h-[60px] min-w-[60px] flex items-center justify-center active:scale-95 ${
              shortlisted.includes(profile.userId)
                ? 'bg-gradient-to-br from-amber-100 via-amber-200 to-amber-100 text-amber-800 border-2 border-amber-300/80 shadow-lg shadow-amber-200/40 active:shadow-md'
                : 'bg-white text-[#880E4F] border border-[#F8BBD9]/80 shadow-sm active:shadow-xs active:bg-[#FCE4EC]'
            }`}
          >
            {/* Touch ripple effect overlay */}
            <span className="absolute inset-0 active:bg-[#880E4F]/5 pointer-events-none rounded-2xl" />
            {shortlisted.includes(profile.userId) ? (
              <Bookmark size={24} className="fill-amber-600 text-amber-600 relative z-10" />
            ) : (
              <Bookmark size={24} className="relative z-10" />
            )}
          </button>
          <button className="relative p-4 bg-white text-[#880E4F] rounded-2xl font-semibold transition-all duration-200 ease-out shadow-sm border border-[#F8BBD9]/80 min-h-[60px] min-w-[60px] flex items-center justify-center active:scale-95 active:shadow-xs active:bg-[#FCE4EC]">
            {/* Touch ripple effect overlay */}
            <span className="absolute inset-0 active:bg-[#880E4F]/5 pointer-events-none rounded-2xl" />
            <Share2 size={24} className="relative z-10" />
          </button>
        </div>
        {/* Safe area spacer for iOS devices */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Desktop Bottom Padding to account for fixed bar */}
      <div className="hidden md:block h-20" />
    </div>
  );
}

// Helper Components for ProfileViewPage

// Icon mapping for different field types
const fieldIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'Age': Calendar,
  'Height': Ruler,
  'Marital Status': Heart,
  'Mother Tongue': Globe,
  'Religion': Sparkles,
  'Caste': Users,
  'Gothra': Star,
  'Rashi': Star,
  'Nakshatra': Star,
  'Manglik': Sparkles,
  'Birth Time': Clock,
  'Birth Place': MapPin,
  'Education': GraduationCap,
  'College': Building,
  'Occupation': Briefcase,
  'Company': Building,
  'Annual Income': IndianRupee,
  "Father's Occupation": User,
  "Mother's Occupation": User,
  'Siblings': Users,
  'Family Type': Users,
  'Family Values': Heart,
  'Family Status': Award,
  'Diet': Heart,
  'Drinking': Heart,
  'Smoking': Heart,
  'Blood Group': Heart,
};

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  const IconComponent = icon || fieldIcons[label];
  
  return (
    <div className="group relative flex items-center gap-2 py-2.5 px-3.5 bg-gradient-to-r from-gray-50/80 to-gray-50/40 rounded-xl hover:from-rose-50/80 hover:to-pink-50/40 transition-all duration-300 ease-out hover:shadow-sm hover:shadow-rose-100/50 border border-transparent hover:border-rose-100/50 hover:-translate-y-0.5">
      {/* Subtle background pattern on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_right_center,rgba(136,14,79,0.03),transparent_70%)]" />
      
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 group-hover:bg-white shadow-sm group-hover:shadow transition-all duration-300">
          <IconComponent size={14} className="text-gray-400 group-hover:text-[#880E4F] transition-colors duration-300" />
        </div>
      )}
      
      {/* Label */}
      <span className="text-gray-500 text-sm w-24 shrink-0 font-medium leading-relaxed group-hover:text-gray-600 transition-colors">{label}</span>
      
      {/* Separator */}
      <span className="text-gray-300 group-hover:text-rose-300 transition-colors duration-300">:</span>
      
      {/* Value */}
      <span className="text-gray-800 font-semibold text-sm flex-1 leading-relaxed group-hover:text-[#880E4F] transition-colors duration-300">{value}</span>
      
      {/* Subtle right accent on hover */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-4 bg-gradient-to-b from-[#880E4F] to-[#AD1457] rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function PreferenceMatchRow({ label, theirPref, yourValue, matches }: { label: string; theirPref: string; yourValue: string; matches: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <p className="text-gray-800 font-medium text-sm">{label}</p>
        <p className="text-gray-500 text-xs">Pref: {theirPref}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-xs">{yourValue}</span>
        {matches ? (
          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check size={12} className="text-emerald-600" />
          </div>
        ) : (
          <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
            <X size={12} className="text-rose-600" />
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className={`p-2 rounded-lg flex items-center gap-1.5 ${verified ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
      {verified ? (
        <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
          <Check size={10} className="text-emerald-600" />
        </div>
      ) : (
        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
          <X size={10} className="text-gray-400" />
        </div>
      )}
      <span className={`text-xs font-medium ${verified ? 'text-emerald-700' : 'text-gray-500'}`}>{label}</span>
    </div>
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
  const similarProfiles = useMemo(() => {
    return mockProfiles
      .filter(p => 
        p.userId !== currentProfile.userId && 
        p.gender !== currentProfile.gender &&
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

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-rose-100/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Similar Profiles You Might Like</h2>
            <p className="text-sm text-gray-500">Based on {currentProfile.name.split(' ')[0]}'s preferences</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ArrowRight size={18} className="rotate-180" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              canScrollRight 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {similarProfiles.map((profile) => {
          const scoreColors = getScoreColor(profile.compatibilityScore);
          return (
            <div
              key={profile.userId}
              className="flex-shrink-0 w-64 bg-gradient-to-br from-gray-50 to-rose-50/30 rounded-2xl border border-rose-100 overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all cursor-pointer group"
              onClick={() => viewProfile(profile.userId)}
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
                    onClick={(e) => { e.stopPropagation(); viewProfile(profile.userId); }}
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
