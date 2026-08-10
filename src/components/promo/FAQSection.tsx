"use client"
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "Is joining the waitlist free?",
    answer:
      "Yes, 100% free for both clients and artists. Early clients get RM50 off their first booking. Artists get zero commission for 3 months.",
  },
  {
    question: "When are you launching?",
    answer:
      "We're launching in Cyberjaya & KL in 7 days. Waitlist members get first access 48 hours before public launch.",
  },
  {
    question: "Which areas do you cover?",
    answer:
      "We start with Cyberjaya, Kuala Lumpur & Selangor. Select your location in the form and we'll notify you when we expand to your area.",
  },
  {
    question: "How are artists verified?",
    answer:
      "Every artist is portfolio-reviewed and identity-verified. We only onboard top-rated pros with proven client results.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section>
      <div className="mt-6 space-y-3">
        {faqItems.map((item, index) => (
          <div key={index} className={`rounded-2xl border bg-white transition ${openIndex === index ? "border-black/15 shadow-sm" : "border-black/10 hover:border-black/15"}`}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-5 md:px-6 h-[56px] flex items-center justify-between gap-4"
            >
              <span className="font-semibold text-[14.5px]">{item.question}</span>
              <span className={`w-7 h-7 rounded-full border grid place-items-center shrink-0 transition ${openIndex === index ? "bg-[#111] text-white border-[#111] rotate-180" : "bg-white border-black/10"}`}>
                <ChevronDown className="w-3 h-3" />
              </span>
            </button>
            {openIndex === index && (
              <div className="px-5 md:px-6 pb-5 text-[14px] leading-[1.6] text-black/60">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}