"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { CalendarDays, Clock, CheckCircle, CreditCard, MapPin, ArrowRight, ArrowLeft, X, Send } from "lucide-react";
import LocationSelector from "./LocationSelector";

interface ArtistService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  popular: boolean;
  category: string;
}

interface BookingFormProps {
  artistId: string;
  artistName: string;
  services: ArtistService[];
}

type BookingStep = "service" | "details" | "submit" | "awaiting_quote" | "checkout";

const CATEGORY_COLORS: Record<string, { ring: string; active: string; hover: string; icon: string; bg: string }> = {
  bridal:  { ring: "bg-rose-100 dark:bg-rose-900/30", active: "border-rose-500 bg-rose-50 dark:bg-rose-950/30", hover: "hover:border-rose-200 dark:hover:border-rose-800", icon: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30" },
  event:   { ring: "bg-purple-100 dark:bg-purple-900/30", active: "border-purple-500 bg-purple-50 dark:bg-purple-950/30", hover: "hover:border-purple-200 dark:hover:border-purple-800", icon: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  glamour: { ring: "bg-amber-100 dark:bg-amber-900/30", active: "border-amber-500 bg-amber-50 dark:bg-amber-950/30", hover: "hover:border-amber-200 dark:hover:border-amber-800", icon: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
};
const DEFAULT_CATEGORY_COLOR = { ring: "bg-gray-100 dark:bg-gray-900/30", active: "border-gray-500 bg-gray-50 dark:bg-gray-950/30", hover: "hover:border-gray-200 dark:hover:border-gray-800", icon: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-900/30" };

export function BookingForm({ 
  artistId, 
  artistName, 
  services 
}: BookingFormProps) {
  const [step, setStep] = useState<BookingStep>("service");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
   const [customService, setCustomService] = useState("");
   const [date, setDate] = useState("");
   const [time, setTime] = useState("");
   const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
   const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<{
    servicePrice: number;
    accommodationFee: number;
    travelFee: number;
    totalPrice: number;
    quoteId: string;
    discount: number;
    extras: Array<{ name: string; price: number }>;
  } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean }> | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, startTransition] = useTransition();

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  const allServices = services;
  const selectedServiceData = allServices.find(s => String(s.id) === String(service));
  
  const isCustomService = service === "other";

  const serviceCategories = allServices.reduce<Record<string, typeof allServices>>((acc, s) => {
    const cat = s.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  function getServiceLabel(id: string): string {
    const s = allServices.find(x => String(x.id) === id);
    return s?.name || id;
  }

  function format24to12(time: string): string {
    const [hStr, mStr] = time.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }

  const handleNext = () => {
    if (step === "service") {
      if (!service) {
        setError("Please select a service");
        return;
      }
      if (isCustomService && !customService.trim()) {
        setError("Please specify the service");
        return;
      }
      setError("");
      setStep("details");
    } else if (step === "details") {
      if (!name || !email || !date || !time || !location) {
        setError("Please fill in all required fields");
        return;
      }
      setError("");
      setStep("submit");
    } else if (step === "submit") {
      handleSubmit(new Event("submit") as any);
    }
  };

  const handleBack = () => {
    if (step === "details") setStep("service");
    else if (step === "submit") setStep("details");
    else if (step === "awaiting_quote") setStep("submit");
    else if (step === "checkout") setStep("awaiting_quote");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let serviceDesc = "";
      if (isCustomService) {
        serviceDesc = `Custom: ${customService}`;
      } else {
        serviceDesc = getServiceLabel(service);
      }

       const res = await fetch("/api/bookings", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           artistId,
           clientName: name,
           clientEmail: email,
           service: serviceDesc,
           date,
           time,
           location: location ? `${location.address.substring(0, Math.min(location.address.length, 200))} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : "",
           notes,
           // No fees - MUA will add them
         }),
       });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Booking failed");

      const bid = data?.booking?.id;
      if (!bid) throw new Error("Booking created without an id");

      setBookingId(String(bid));
      setStep("awaiting_quote");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const checkQuoteStatus = useCallback(async () => {
    if (!bookingId) return;
    const id = String(bookingId);
    try {
      const res = await fetch(`/api/bookings?id=${id}`);
      if (!res.ok) {
        setStatusMessage("Could not check status. Please try again.");
        return;
      }
      const data = await res.json();
      const booking = data?.booking;
      if (!booking) {
        setStatusMessage("Booking not found.");
        return;
      }

       if (booking.status === "quote_sent" && booking.servicePrice) {
         if (pollingRef.current) {
           clearInterval(pollingRef.current);
           pollingRef.current = null;
         }
         startTransition(() => {
           setQuoteData({
             servicePrice: Number(booking.servicePrice) || 0,
             accommodationFee: Number(booking.accommodationFee) || 0,
             travelFee: Number(booking.travelSurcharge) || 0,
             totalPrice: Number(booking.amount) || 0,
             quoteId: String(booking.quoteId || booking.id),
             discount: Number(booking.discount) || 0,
             extras: booking.extras || [],
           });
           setStep("checkout");
         });
       } else {
        setStatusMessage("Quote not ready yet. The MUA hasn't sent a quote — you will also be notified by email.");
      }
    } catch {
      setStatusMessage("Could not check status. Please try again.");
    }
  }, [bookingId]);

  const handleCheckStatus = useCallback(async () => {
    setCheckingStatus(true);
    setStatusMessage(null);
    await checkQuoteStatus();
    setCheckingStatus(false);
  }, [checkQuoteStatus]);

  useEffect(() => {
    if (step === "awaiting_quote" && bookingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkQuoteStatus();
      pollingRef.current = setInterval(checkQuoteStatus, 12000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [step, bookingId, checkQuoteStatus]);

  useEffect(() => {
    if (!date || !artistId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableSlots(null);
      setAvailabilityMessage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-slots", providerId: artistId, date }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.slots && data.slots.length > 0) {
          setAvailableSlots(data.slots);
          setAvailabilityMessage(null);
        } else if (data.reason) {
          setAvailableSlots([]);
          setAvailabilityMessage(data.reason);
        } else {
          setAvailableSlots(null);
        }
      } catch {
        if (!cancelled) setAvailableSlots(null);
      }
    })();
    return () => { cancelled = true; };
  }, [date, artistId]);

  const handleAcceptQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteData) return;
    
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: Number(bookingId),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : (data?.error?.message ?? JSON.stringify(data?.error)) || "Failed to accept quote";
        throw new Error(msg);
      }

      const billUrl = data?.bill?.url;
      if (billUrl) {
        setSuccess(true);
        window.location.href = billUrl;
        return;
      }

      throw new Error("Payment could not be started");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to accept quote. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: Number(bookingId) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to reject quote");
      }
      setQuoteData(null);
      setStep("submit");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reject quote. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Booking Received!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Redirecting you to secure payment for your booking with {artistName}...
        </p>
      </div>
    );
  }

  // Progress indicator
  const steps: { key: BookingStep; label: string }[] = [
    { key: "service", label: "Service" },
    { key: "details", label: "Details" },
    { key: "submit", label: "Submit" },
    { key: "awaiting_quote", label: "Quote" },
    { key: "checkout", label: "Payment" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const isAwaitingQuote = step === "awaiting_quote";
  const isCheckout = step === "checkout";

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              i < currentStepIndex 
                ? "bg-rose-500 text-white" 
                : i === currentStepIndex 
                ? "bg-rose-500 text-white ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-neutral-900"
                : "bg-gray-200 dark:bg-neutral-700 text-gray-500"
            }`}>
              {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                i < currentStepIndex ? "bg-rose-500" : "bg-gray-200 dark:bg-neutral-700"
              }`} />
            )}
            <span className={`text-xs font-medium hidden sm:block ${
              i === currentStepIndex ? "text-rose-500" : "text-gray-500"
            }`}>{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === "service" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Service</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Prices will be shared privately after the MUA reviews your venue location.
          </p>

          {Object.entries(serviceCategories).map(([category, catServices]) => {
            const colors = CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
            const label = category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full ${colors.ring} flex items-center justify-center`}>
                    <CreditCard className={`w-4 h-4 ${colors.icon}`} />
                  </span>
                  {label}
                </h4>
                <div className="space-y-2">
                  {catServices.map(s => (
                    <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      String(service) === String(s.id)
                        ? colors.active
                        : `border-gray-200 dark:border-neutral-700 ${colors.hover}`
                    }`}>
                      <input
                        type="radio"
                        name="service"
                        value={s.id}
                        checked={String(service) === String(s.id)}
                        onChange={() => {
                          setService(String(s.id));
                          setCustomService("");
                        }}
                        className={`w-4 h-4 ${colors.icon} border-gray-300 focus:ring-rose-500`}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Other / Custom option */}
          <div>
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              service === "other"
                ? "border-gray-500 bg-gray-50 dark:bg-gray-950/30"
                : "border-gray-200 dark:border-neutral-700 hover:border-gray-200 dark:hover:border-gray-800"
            }`}>
              <input
                type="radio"
                name="service"
                value="other"
                checked={service === "other"}
                onChange={() => {
                  setService("other");
                  setCustomService("");
                }}
                className="w-4 h-4 text-gray-500 border-gray-300 focus:ring-gray-500"
              />
              <span className="font-medium text-gray-900 dark:text-white">Other</span>
              {service === "other" && (
                <input
                  type="text"
                  placeholder="Specify service..."
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="ml-auto w-48 px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
                />
              )}
            </label>
          </div>

          {allServices.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              This artist has not added any services yet. You can still send an inquiry.
            </p>
          )}
        </div>
      )}

      {/* Step 2: Event Details */}
      {step === "details" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Event Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Siti Nurhaliza"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
              <CalendarDays className="w-4 h-4" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={today}
              max={maxDateStr}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={availabilityMessage !== null}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">{availabilityMessage ? "Not available" : "Select time"}</option>
              {availableSlots && availableSlots.length > 0 ? (
                availableSlots.map((s) => {
                  const display = format24to12(s.time);
                  return (
                    <option key={s.time} value={display} disabled={!s.available}>
                      {display}{!s.available ? " (booked)" : ""}
                    </option>
                  );
                })
              ) : availableSlots === null ? (
                timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))
              ) : null}
            </select>
            {availabilityMessage && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">{availabilityMessage}</p>
            )}
          </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
               <MapPin className="w-4 h-4" /> Location
             </label>
             <LocationSelector
               value={location}
               onChange={setLocation}
               disabled={submitting}
             />
             <p className="text-xs text-gray-500 mt-1">MUA will use this to calculate any travel/accommodation fees</p>
           </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special requests..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 3: Submit Request */}
      {step === "submit" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review & Submit Request</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The MUA will review your venue location and send you a quote with any applicable travel/accommodation fees.
          </p>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service</h4>
            <p className="text-gray-900 dark:text-white">
              {isCustomService
                ? `Custom: ${customService}`
                : getServiceLabel(service)
              }
            </p>
          </div>

           <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-4">
             <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Event Details</h4>
             <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Date</span>
                 <span className="font-medium text-gray-900 dark:text-white">{date}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Time</span>
                 <span className="font-medium text-gray-900 dark:text-white">{time}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600 dark:text-gray-400">Location</span>
                 <span className="font-medium text-gray-900 dark:text-white">
                   {location ? `${location.address}` : ""}
                 </span>
               </div>
             </div>
           </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Important:</strong> No payment is required yet. The MUA will review your request and send you a quote with the service price and any applicable travel/accommodation fees. You&apos;ll then be able to accept or reject the quote.
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Awaiting Quote from MUA */}
      {step === "awaiting_quote" && (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
            <Send className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Submitted!</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Your booking request has been sent to <strong>{artistName}</strong>. They will review your venue location and send you a quote with the service price and any applicable travel/accommodation fees.
          </p>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What happens next?</h4>
            <div className="space-y-3 text-sm text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-rose-500 font-bold text-xs">1</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">MUA receives your request and checks venue location</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-bold text-xs">2</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">MUA adds service price + any travel/accommodation fees</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-bold text-xs">3</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">You receive a notification with the complete quote</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-bold text-xs">4</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">You Accept or Reject the quote</p>
              </div>
            </div>
          </div>
          {bookingId && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingStatus ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  "Check Status"
                )}
              </button>
              {statusMessage && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{statusMessage}</p>
              )}
              <div className="text-xs text-gray-400">
                Booking ID: {bookingId}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Checkout - Quote Review with Accept/Reject */}
      {step === "checkout" && quoteData && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review Quote</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The MUA has prepared a quote based on your venue location. Review and decide.
          </p>

          {/* Service Summary */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service</h4>
            <p className="text-gray-900 dark:text-white">
              {isCustomService
                ? `Custom: ${customService}`
                : getServiceLabel(service)
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Service Price: MYR {quoteData.servicePrice}
            </p>
          </div>

          {/* Fees Summary */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Additional Fees</h4>
            <div className="space-y-2 text-sm">
              {quoteData.accommodationFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Overnight Accommodation</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">+ MYR {quoteData.accommodationFee}</span>
                </div>
              )}
              {quoteData.travelFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Travel Fee</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">+ MYR {quoteData.travelFee}</span>
                </div>
              )}
              {quoteData.accommodationFee === 0 && quoteData.travelFee === 0 && (
                <div className="text-gray-500 dark:text-gray-400 text-center py-2">No additional fees</div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-800">
            <div className="flex justify-between text-lg font-bold text-rose-600 dark:text-rose-400">
              <span>Total</span>
              <span>MYR {quoteData.totalPrice}</span>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-2 text-center">
              By accepting, you agree to the booking terms and deposit policy.
            </p>
          </div>

          {/* Accept / Reject Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRejectQuote}
              className="flex-1 py-3.5 px-4 border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4 inline mr-2" /> Reject
            </button>
            <button
              type="submit"
              onClick={handleAcceptQuote}
              disabled={submitting}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Accept & Proceed to Payment"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-neutral-800">
        {step !== "service" && step !== "awaiting_quote" && step !== "checkout" && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 px-4 border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step !== "checkout" && step !== "awaiting_quote" && !success && (
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 py-3 px-4 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : step === "submit" ? (
              "Submit Request"
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        )}
        {step === "checkout" && (
          <button
            type="submit"
            onClick={handleAcceptQuote}
            disabled={submitting}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Accept & Proceed to Payment"}
          </button>
        )}
      </div>
    </div>
  );
}