import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WaitlistTimerSection } from "@/components/promo/WaitlistTimerSection";
import { TestimonialsCarouselSection } from "@/components/promo/TestimonialsCarouselSection";
import { BenefitsSection } from "@/components/promo/BenefitsSection";
import { FAQSection } from "@/components/promo/FAQSection";
import { CTASection } from "@/components/promo/CTASection";
import { Star, Users, MapPin, Sparkles, Camera } from "lucide-react";

export default function PromoPage() {
  return (
    <>
      {/* Top Bar - Launch Message */}
      <div className="sticky top-0 z-50 bg-[#111] text-white text-[13px] md:text-[13.5px] tracking-wide">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 h-9 flex items-center justify-center gap-2">
          <span className="hidden md:inline">\uD83D\uDE80 Launching in Cyberjaya & KL — Join 500+ early waitlist</span>
          <span className="md:hidden">\uD83D\uDE80 Launching in Cyberjaya & KL — 500+ on waitlist</span>
          <span className="ml-2 hidden md:flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
        </div>
      </div>

      {/* Header - Nav and Waitlist CTA */}
      <header className="sticky top-9 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="https://leish.my" target="_blank" rel="noopener" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#111] text-white grid place-items-center font-bold text-[14px] tracking-tighter">
                L
              </div>
              <span className="font-black tracking-[-0.02em] text-[20px]">LEISH!</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-black/60">
              <a href="#how" className="hover:text-black transition">How it Works</a>
              <a href="#artists" className="hover:text-black transition">For Artists</a>
              <a href="#reviews" className="hover:text-black transition">Reviews</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[12px] font-medium bg-black/[0.04] rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D8D]"></div>
              Cyberjaya HQ
            </div>
            <a href="#waitlist" className="h-9 px-4 rounded-full bg-[#111] text-white text-[13.5px] font-semibold grid place-items-center hover:bg-black transition">
              Join Waitlist
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-[1280px] px-4 md:pt-14 pb-10 md:pb-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-start">
            <div className="pt-2 md:pt-6">
              <div className="inline-flex items-center gap-2 bg-[#FFF0F5] border border-[#FF4D8D]/15 rounded-full px-3.5 py-1.5 text-[12px] font-medium">
                <span className="flex items-center gap-1">
                  {/* Star icon for rating */}
                  <Star className="w-3.5 h-3.5" /> 4.9 from 500+ reviews
                </span>
                <span className="w-px h-3 bg-black/10"></span>
                <span className="text-black/60">Trusted in KL & Selangor</span>
              </div>
              <h1 className="mt-6 font-[700] tracking-[-0.04em] leading-[0.9] text-[42px] md:text-[68px]">
                Book Beauty.
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">Anywhere.</span>
                  <span className="absolute bottom-[8px] md:bottom-[14px] left-0 right-0 h-[10px] md:h-[14px] bg-[#FF4D8D]/20 -rotate-[1deg]"></span>
                </span>
              </h1>
              <p className="mt-5 text-[32px] md:text-[42px] font-[300] tracking-[-0.03em] text-black/70">
                Your Beauty, Perfected.
              </p>
              <p className="mt-5 text-[17px] md:text-[19px] leading-[1.5] text-black/60 max-w-[520px]">
                Discover top-rated makeup artists and studios, check real-time availability, and book in minutes.
              </p>
              <div className="mt-8 flex gap-6 md:gap-10 border-y border-black/[0.06] py-5">
                <div>
                  <div className="text-[28px] font-bold tracking-tight leading-none">24+</div>
                  <div className="text-[11px] uppercase tracking-widest font-semibold text-black/40 mt-1">Happy Clients</div>
                </div>
                <div>
                  <div className="text-[28px] font-bold tracking-tight leading-none">4+</div>
                  <div className="text-[11px] uppercase tracking-widest font-semibold text-black/40 mt-1">Pro Artists</div>
                </div>
                <div>
                  <div className="text-[28px] font-bold tracking-tight leading-none">33+</div>
                  <div className="text-[11px] uppercase tracking-widest font-semibold text-black/40 mt-1">Bookings</div>
                </div>
                <div className="hidden md:block w-px bg-black/10 self-stretch"></div>
                <div className="hidden md:flex items-center gap-2 text-[13px] text-black/60 leading-tight">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#FFD6E5] border-2 border-white grid place-items-center text-[10px] font-bold">
                      A
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#111] border-2 border-white grid place-items-center text-[10px] font-bold text-white">
                      M
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#EAEAEA] border-2 border-white grid place-items-center text-[10px] font-bold">
                      F
                    </div>
                  </div>
                  Loved by women
                  <br />
                  20–35 in KL
                </div>
              </div>
            </div>
            {/* Right side of hero - could be an image or illustration, but in HTML it's empty? Actually the HTML has nothing here, so we leave it blank for now */}
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how" className="mt-8 grid grid-cols-3 gap-3">
          {/* We'll map over the three steps */}
          {/* Step 1: Browse Artists */}
          <div className="rounded-2xl bg-black/[0.02] border border-black/[0.04] p-4">
            <div className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center mb-3">
              {/* Users icon */}
              <Users className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[13.5px] leading-tight">Browse Artists</div>
            <div className="text-[12px] text-black/50 mt-1 leading-snug">Verified portfolios</div>
          </div>
          {/* Step 2: Book Instantly */}
          <div className="rounded-2xl bg-black/[0.02] border border-black/[0.04] p-4">
            <div className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center mb-3">
              {/* MapPin icon */}
              <MapPin className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[13.5px] leading-tight">Book Instantly</div>
            <div className="text-[12px] text-black/50 mt-1 leading-snug">Real-time slots</div>
          </div>
          {/* Step 3: Get Glam */}
          <div className="rounded-2xl bg-black/[0.02] border border-black/[0.04] p-4">
            <div className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center mb-3">
              {/* Sparkles icon */}
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[13.5px] leading-tight">Get Glam</div>
            <div className="text-[12px] text-black/50 mt-1 leading-snug">Show up & slay</div>
          </div>
        </section>

        {/* Waitlist Section with Countdown Timer and Form */}
        <section id="waitlist" className="mt-8">
          <WaitlistTimerSection />
        </section>

        {/* Testimonials Section */}
        <section id="reviews" className="mt-8">
          <TestimonialsCarouselSection />
        </section>

        {/* Benefits Section */}
        <section className="bg-[#FAFAF9] border-y border-black/[0.06]">
          <BenefitsSection />
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section - RM50 welcome gift */}
        <section className="mx-auto max-w-[1280px] px-4 md:px-8 py-12 md:py-20">
          <div className="rounded-2xl bg-[#111] text-white p-5 md:p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">
              {/* Gift icon - we'll use Package if available, otherwise we'll keep as is or use a star? */}
              {/* Since we don't have a gift icon in the imported set, we'll use a star for now or leave the text? Let's use a star from the imported set. */}
              <Star className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[14px]">RM50 welcome gift for early waitlist</div>
              <div className="text-[12px] text-white/60">
                Auto-applied at checkout. No code needed if you join from this page.
              </div>
            </div>
            <a href="#waitlist" className="h-9 px-4 rounded-full bg-white text-black text-[13px] font-semibold grid place-items-center">
              Claim
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-black/10">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-10 md:py-14">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-between">
              <div>
                <a href="https://leish.my" target="_blank" rel="noopener" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#111] text-white grid place-items-center font-bold text-[14px]">
                    L
                  </div>
                  <span className="font-black tracking-[-0.02em] text-[18px]">LEISH!</span>
                </a>
                <p className="mt-3 text-[13px] leading-[1.5] text-black/60 max-w-[320px]">
                  Malaysia's beauty booking marketplace. Book top-rated MUAs, hijab stylists & bridal pros — anywhere in Cyberjaya, KL & Selangor.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[12px]">
                  <a href="https://instagram.com/leish.my" target="_blank" rel="noopener" className="h-8 w-8 rounded-full bg-black/[0.06] grid place-items-center hover:bg-black hover:text-white transition">
                    {/* Instagram icon */}
                    <Camera className="w-4 h-4" />
                  </a>
                  <a href="https://leish.my" target="_blank" rel="noopener" className="h-8 px-3 rounded-full bg-black/[0.06] grid place-items-center text-[12px] font-medium hover:bg-black hover:text-white transition">
                    TikTok @leish.my
                  </a>
                  <span className="h-8 px-3 rounded-full bg-[#FFF0F5] border border-[#FF4D8D]/20 grid place-items-center text-[12px] font-medium text-[#FF4D8D]">
                    Cyberjaya HQ
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-[13px]">
                <div>
                  <div className="font-semibold">Platform</div>
                  <div className="mt-3 space-y-2 text-black/60">
                    <a href="https://leish.my" target="_blank" rel="noopener" className="block hover:text-black">Browse Artists</a>
                    <a href="#how" target="_blank" rel="noopener" className="block hover:text-black">How it Works</a>
                    <a href="#reviews" target="_blank" rel="noopener" className="block hover:text-black">Reviews</a>
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Early Access</div>
                  <div className="mt-3 space-y-2 text-black/60">
                    <a href="#waitlist" target="_blank" rel="noopener" className="block hover:text-black">Join as Client</a>
                    <a href="#waitlist" target="_blank" rel="noopener" className="block hover:text-black">Join as Artist</a>
                    <span className="block">RM50 Off Code: LEISH50</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="font-semibold">Live Site</div>
                  <div className="mt-3 rounded-2xl border border-black/10 p-3 bg-[#FFFCFE]">
                    <a href="https://leish.my" target="_blank" rel="noopener" className="text-[13px] font-semibold hover:underline">
                      Leish! — Beauty Booking Marketplace
                    </a>
                    <div className="mt-1 text-[11px] text-black/50">
                      Official booking platform • leish.my • Cyberjaya, Selangor, Malaysia
                    </div>
                    <a href="https://leish.my" target="_blank" rel="noopener" className="mt-3 inline-flex h-8 px-3 rounded-full bg-[#111] text-white text-[12px] font-semibold items-center gap-1">
                      Open live site
                      {/* ArrowRight icon */}
                      <span className="w-3 h-3">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-black/10 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-[11px] text-black/40">
              <span>
                © {new Date().getFullYear()} LEISH! Beauty • Made for Malaysian women who love to slay • Deployable to Vercel • Next.js ready
              </span>
              <span className="flex items-center gap-3">
                <span>Privacy • Terms</span>
                <span className="w-1 h-1 rounded-full bg-black/20"></span>
                <span className="flex items-center gap-1">
                  {/* MapPin icon */}
                  <MapPin className="w-3 h-3" />
                  Cyberjaya, Selangor
                </span>
              </span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}