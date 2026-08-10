"use client"
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amanda Lee",
    role: "Bride, KL",
    text: "Found my dream MUA in 5 mins. Leish made my wedding prep stress-free. The artist was exactly as reviewed!",
    avatar: "AL",
  },
  {
    name: "Michelle Tan",
    role: "Working Professional",
    text: "Finally a platform that shows real-time availability. No more waiting hours for a WhatsApp reply. Game changer!",
    avatar: "MT",
  },
  {
    name: "Farah Aminah",
    role: "Hijabi Client",
    text: "Love that I can filter for hijab styling experts. Found an artist who truly understands modest glam looks.",
    avatar: "FA",
  },
  {
    name: "Nurul Huda",
    role: "Photoshoot Model",
    text: "Booked for my graduation shoot. Pro artists, transparent pricing, and super easy to reschedule.",
    avatar: "NH",
  },
];

export function TestimonialsCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-12 md:py-20">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-0.03em] leading-tight">
              Loved by clients across KL
            </h2>
            <div className="mt-3 flex items-center gap-3 text-[13px]">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="w-4 h-4 fill-[#111] text-[#111]">
                      <Star />
                    </span>
                  ))}
                </span>
                " 4.9/5"
              </span>
              <span className="text-black/50">from 500+ reviews • Real bookings</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {testimonials.map((t, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-6 bg-[#111]" : "w-1.5 bg-black/15"}`}
              >
                {t.avatar}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-[24px] border border-black/10 p-6 md:p-8 bg-white relative overflow-hidden">
            <div className="absolute top-6 right-6 text-[10px] tracking-widest uppercase font-bold text-black/20">
              Verified Booking
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#111] text-white grid place-items-center font-bold text-[13px]">
                {testimonials[activeIndex].avatar}
              </div>
              <div className="children">
                <div className="font-semibold text-[14px]">
                  {testimonials[activeIndex].name}
                </div>
                <div className="text-[12px] text-black/50">
                  {testimonials[activeIndex].role}
                </div>
              </div>
              <div className="ml-auto flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="w-4 h-4 fill-[#FF4D8D] text-[#FF4D8D]">
                    <Star />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-5 text-[18px] md:text-[20px] leading-[1.4] tracking-[-0.01em] font-[450]">
            “{testimonials[activeIndex].text}”
          </p>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-black/40">
            <span className="w-3 h-3">���������������������🖌������️</span>
            Booked via Leish! • Makeup + Hijab Styling
          </div>
          <div className="mt-6 flex items-center gap-2 text-[11px] text-black/40">
            <span className="w-3 h-3">���������������������👰</span>
            Booked via Leish! • Bridal Makeup
          </div>
        </div>
        <div className="rounded-[24px] bg-[#FFF0F5] border border-[#FF4D8D]/15 p-6 flex flex-col">
          <div className="text-[13px] font-semibold">
            Wall of Love
          </div>
          <div className="mt-4 space-y-3">
            {testimonials
              .filter((_, index) => index !== activeIndex)
              .slice(0, 3)
              .map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl bg-white border border-black/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black/5 grid place-items-center text-[10px] font-bold">
                      {t.avatar}
                    </div>
                    <div className="text-[12px] font-semibold">
                      {t.name}
                    </div>
                  </div>
                  <div className="mt-2 text-[12px] leading-[1.4] text-black/60 line-clamp-2">
                    “{t.text}”
                  </div>
                </div>
              ))}
          </div>
          <button
            onClick={() => setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length)}
            className="mt-auto pt-4 text-[12px] font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
          >
            Next story <span className="w-3.5 h-3.5">→</span>
          </button>
        </div>
      </div>
    </>
  );
}