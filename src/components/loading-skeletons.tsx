"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Hero Section Skeleton
export function HeroSkeleton() {
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
export function TrustBadgesSkeleton() {
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
export function SuccessStoriesSkeleton() {
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
export function FeaturesSkeleton() {
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
export function CTASkeleton() {
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
export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
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
        {/* Main Content */}
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
export function SearchSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Filter Sidebar */}
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
        {/* Results Grid */}
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
export function MessagesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6 h-[70vh]">
        {/* Conversations List */}
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
        {/* Chat Area */}
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
export function ProfileSkeleton() {
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
export function PageSkeleton() {
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

// Full Home Page Skeleton (combines all home sections)
export function HomePageSkeleton() {
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
