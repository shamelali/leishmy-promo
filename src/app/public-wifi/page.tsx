import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe2,
  LockKeyhole,
  Router,
  Sparkles,
  ShieldCheck,
  Signal,
  Smartphone,
  Users,
  Wifi,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Public Wi-Fi Landing Page",
  description:
    "A production-ready public Wi-Fi landing page for cafés, salons, studios, co-working spaces, and venues that want branded guest access and simple analytics.",
  openGraph: {
    title: "Public Wi-Fi Landing Page",
    description:
      "Branded guest Wi-Fi, analytics, and fast setup for modern venues.",
    type: "website",
  },
};

const highlights = [
  { value: "3 min", label: "average setup time" },
  { value: "99.9%", label: "uptime target" },
  { value: "1 tap", label: "guest login experience" },
  { value: "24/7", label: "usage insights" },
];

const features = [
  {
    icon: Globe2,
    title: "Branded captive portal",
    description:
      "Show your logo, colours, promos, and social links before guests connect.",
  },
  {
    icon: Smartphone,
    title: "One-tap guest access",
    description:
      "Let visitors connect with email, SMS, or social sign-in in just seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Safer access controls",
    description:
      "Set session time limits, content rules, and device limits for every location.",
  },
  {
    icon: Signal,
    title: "Real usage analytics",
    description:
      "Track visits, repeat guests, peak hours, and campaign performance in one place.",
  },
  {
    icon: Router,
    title: "Hardware-friendly setup",
    description:
      "Works with common routers and access points already used by small businesses.",
  },
  {
    icon: Clock3,
    title: "Fast rollout for multiple sites",
    description:
      "Clone settings across branches and launch new venues without starting over.",
  },
];

const steps = [
  {
    title: "Connect your network",
    copy: "Plug in the access point or router, then point traffic to the Wi-Fi landing portal.",
  },
  {
    title: "Brand the experience",
    copy: "Upload your logo, choose a palette, and add a welcome message or promo code.",
  },
  {
    title: "Launch and measure",
    copy: "Go live, watch guests connect, and review usage insights from the first day.",
  },
];

const useCases = [
  "Cafés and restaurants",
  "Beauty studios and salons",
  "Retail shops and showrooms",
  "Co-working spaces",
  "Event venues and pop-ups",
  "Clinics and service counters",
];

const faqs = [
  {
    q: "Can I keep the landing page on-brand?",
    a: "Yes. You can match colours, logo, hero copy, and even add a promotion or call-to-action.",
  },
  {
    q: "Does this work for multi-location businesses?",
    a: "Yes. You can reuse the same setup and adapt the branding or rules for each branch.",
  },
  {
    q: "Do I need custom hardware?",
    a: "Not necessarily. The page is designed to fit common router and access point setups.",
  },
  {
    q: "Is guest data visible to the venue owner?",
    a: "The dashboard can show aggregate analytics, visit trends, and connection performance.",
  },
];

export default function PublicWifiLandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-300 selection:text-slate-950">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                <Wifi className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-white">Public Wi-Fi landing page</p>
                <p className="text-slate-400">Branded guest access for modern venues.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Request a demo
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See features
              </a>
            </div>
          </div>

          <div className="grid gap-12 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Branded guest internet that drives repeat visits
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
                Turn your Wi-Fi into a growth channel.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Give guests fast, secure internet and give your business a polished
                first touchpoint with branded Wi-Fi login, usage analytics, and
                easy multi-location management.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Start with a demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  How it works
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-sm text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-2xl shadow-cyan-950/30">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-slate-400">Live venue dashboard</p>
                    <p className="text-xl font-semibold text-white">Today at a glance</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Active
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users className="h-4 w-4" />
                      Connected guests
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white">428</div>
                    <p className="mt-1 text-sm text-cyan-200">+16% from yesterday</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <LockKeyhole className="h-4 w-4" />
                      Session length
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white">42m</div>
                    <p className="mt-1 text-sm text-cyan-200">Average visit time</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Promo visibility</p>
                        <p className="text-base font-semibold text-white">Branded welcome banner</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        "Logo upload",
                        "Wi-Fi terms",
                        "Offer code banner",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need for a polished guest Wi-Fi experience.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            This landing page is built to convert: crisp hero messaging, clear
            benefits, a demo CTA, and trust-building sections that explain the value
            quickly.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.07]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Launch without a long implementation cycle.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                This flow is intentionally simple, so venues can go live quickly and
                keep their network experience consistent across branches.
              </p>
            </div>

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 font-bold">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Best for
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for any place that welcomes repeat visitors.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Public Wi-Fi is often the first interaction a guest has with your
              business. Make it polished, fast, and useful.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {useCases.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Owner benefits</p>
                <p className="text-xl font-semibold text-white">Why venues use it</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
            </div>
            <ul className="mt-5 space-y-4 text-sm text-slate-300">
              {[
                "Build brand recall at the exact moment guests connect.",
                "Capture aggregate analytics without making setup complicated.",
                "Use the same landing experience for every branch.",
                "Reduce support requests with clear connection instructions.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["No app install", "Guests connect straight from their browser."],
              ["Analytics ready", "See traffic trends and repeat visits."],
              ["Multi-branch support", "Reuse settings across every location."],
              ["Fast handoff", "Perfect for launch campaigns and promos."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 via-white/5 to-transparent p-8 text-center sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Ready to launch?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Give guests better Wi-Fi and your venue better visibility.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            This landing page is set up for production: strong messaging, clean
            sections, and a simple conversion path to your demo request form.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Request a demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Review features
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {faqs.map((item) => (
            <article key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">{item.q}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">Public Wi-Fi landing page</p>
              <p className="mt-1 text-sm text-slate-400">
                Built for cafés, salons, studios, and multi-location venues.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Wifi className="h-4 w-4 text-cyan-300" />
                Production-ready layout
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Conversion-focused
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
