import { Check, Clock, DollarSign, Medal, Star, ThumbsUp, CreditCard, Trophy, Package, User } from "lucide-react";

export function BenefitsSection() {
  return (
    <section className="bg-[#FAFAF9] border-y border-black/[0.06]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-black/10 px-3 py-1 text-[11px] font-semibold tracking-widest uppercase">
            {/* We'll use a sparkle icon for the Why Join Early? */}
            <span className="w-3 h-3">
              {/* Since we don't have a sparkle in the imported icons, we'll use Star for now or leave as is? Let's use Star from lucide */}
              <Star className="w-3 h-3" />
            </span>
            Why Join Early?
          </div>
          <h2 className="mt-4 text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-[0.95]">
            More perks when you join before launch.
          </h2>
        </div>
        <div className="mt-8 md:mt-10 grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="rounded-[24px] bg-white border border-black/10 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF4D8D] text-white grid place-items-center">
                {/* Gift icon */}
                <span className="w-5 h-5">
                  {/* We don't have a gift icon in the imported set, but we can use Package? Let's check: Lucide has Package icon. */}
                  <Package className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-[18px] font-semibold">For Clients</h3>
              <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF0F5] text-[#FF4D8D]">
                POPULAR
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-black/[0.06] grid place-items-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-black/70">Free booking — no extra fees ever</span>
              </li>
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-black/[0.06] grid place-items-center shrink-0 mt-0.5">
                  <DollarSign className="w-3 h-3" />
                </span>
                <span className="text-black/70">Early-bird RM50 off first booking (first 100)</span>
              </li>
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-black/[0.06] grid place-items-center shrink-0 mt-0.5">
                  <Clock className="w-3 h-3" />
                </span>
                <span className="text-black/70">Early access 48h before public</span>
              </li>
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-black/[0.06] grid place-items-center shrink-0 mt-0.5">
                  <ThumbsUp className="w-3 h-3" />
                </span>
                <span className="text-black/70">Verified artists with real reviews</span>
              </li>
            </ul>
          </div>
          <div className="rounded-[24px] bg-[#111] text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-[260px] h-[260px] bg-[#FF4D8D]/30 blur-[60px] rounded-full"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-black grid place-items-center">
                {/* User icon */}
                <span className="w-5 h-5">
                  {/* We don't have a user icon in the imported set, but we can use User? Lucide has User icon. */}
                  <User className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-[18px] font-semibold">For Artists</h3>
              <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-black">
                LIMITED 20 SLOTS
              </span>
            </div>
            <p className="mt-3 text-[14px] text-white/60 leading-[1.5]">
              Are you a Makeup Artist? Join Malaysia's Beauty Platform. We're building the largest network of beauty professionals in Cyberjaya, Selangor.
            </p>
            <ul className="mt-6 space-y-3 relative">
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center shrink-0 mt-0.5">
                  <DollarSign className="w-3 h-3" />
                </span>
                <span className="text-white/80">Zero commission for 3 months</span>
              </li>
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center shrink-0 mt-0.5">
                  <Star className="w-3 h-3" />
                </span>
                <span className="text-white/80">Featured profile on homepage</span>
              </li>
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center shrink-0 mt-0.5">
                  {/* We'll use Medal if available, otherwise Trophy */}
                  <Medal className="w-3 h-3" />
                </span>
                <span className="text-white/80">First 20 get Pro badge free (worth RM199)</span>
              </li>
              <li className="flex gap-3 text-[14px] leading-[1.4]">
                <span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center shrink-0 mt-0.5">
                  <CreditCard className="w-3 h-3" />
                </span>
                <span className="text-white/80">Real-time bookings &amp; payouts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}