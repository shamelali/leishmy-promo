import { Star } from "lucide-react";

export function CTASection() {
  return (
    <div className="rounded-2xl bg-[#111] text-white p-5 md:p-6 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center">
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
  );
}
