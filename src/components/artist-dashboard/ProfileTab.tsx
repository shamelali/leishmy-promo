"use client";

import { useState, useCallback } from "react";
import {
  Camera,
  MapPin,
  Languages,
  Tag,
  Award,
  AtSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import AutoSaveField from "./AutoSaveField";
import AvailabilityToggle from "./AvailabilityToggle";
import { ProfilePictureUploader } from "@/components/upload";
import { malaysiaDistricts, initialStates } from "@/data/malaysia-districts";
import type { ArtistProfileEditValues } from "@/components/ArtistProfileEditForm";

const expertiseOptions = [
  "Bridal Makeup",
  "Events",
  "Commercial/TV/Film",
  "Class/Workshop",
  "Other",
  "Groom",
  "Hijab",
];

const languageOptions = ["English", "Malay", "Chinese", "Indian"];

const responseTimeOptions = ["< 1hr", "< 2hr", "< 3hr", "< 6hr", "< 24hr"];

const availabilityOptions = [
  { value: "weekdays", label: "Weekdays only" },
  { value: "weekends", label: "Weekends only" },
  { value: "both", label: "Weekdays & Weekends" },
  { value: "evenings", label: "Evenings only" },
  { value: "flexible", label: "Flexible" },
];

interface ProfileTabProps {
  profile: ArtistProfileEditValues;
  available?: boolean;
  onUpdate: (field: string, value: unknown) => void;
  userId: string;
}

export default function ProfileTab({ profile, available: initialAvailable = true, onUpdate, userId }: ProfileTabProps) {
  const [district, setDistrict] = useState(profile.district);
  const [area, setArea] = useState(profile.area);
  const [languages, setLanguages] = useState<string[]>(profile.languages);
  const [specialties, setSpecialties] = useState<string[]>(profile.specialties);
  const [responseTime, setResponseTime] = useState(profile.responseTime);
  const [availability, setAvailability] = useState(profile.availability);
  const [showPrices, setShowPrices] = useState(profile.showPrices);
  const [otherSpecialty, setOtherSpecialty] = useState(() => {
    const otherEntry = profile.specialties.find((s) => s.startsWith("Other:"));
    return otherEntry ? otherEntry.slice(7).trim() : "";
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  const districts = area ? malaysiaDistricts[area] || [] : [];

  const doSave = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/user/artist-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload }),
      });
      if (!res.ok) {
        let message = "Failed to save changes. Please try again.";
        try {
          const data = await res.json();
          if (typeof data?.error === "string" && data.error) message = data.error;
        } catch {
          // ignore response parse error
        }
        setSaveError(message);
        throw new Error(message);
      }
      setSaveError(null);
    },
    [userId],
  );

  const handleFieldSave = useCallback(
    (field: string) => async (value: string) => {
      await doSave({ [field]: value });
      onUpdate(field, value);
    },
    [doSave, onUpdate],
  );

  async function handleImageChange(url: string) {
    await handleFieldSave("image")(url);
  }

  async function handleSelectChange(field: string, value: string) {
    if (field === "area") {
      setArea(value);
      setDistrict("");
    }
    if (field === "district") setDistrict(value);
    if (field === "responseTime") setResponseTime(value);
    if (field === "availability") setAvailability(value);

    try {
      await doSave({ [field]: value });
      onUpdate(field, value);
    } catch {
      // error surfaced via banner
    }
  }

  async function toggleArrayItem(field: "languages" | "specialties", item: string) {
    const setter = field === "languages" ? setLanguages : setSpecialties;
    let newArray: string[];
    if (field === "languages") {
      newArray = languages.includes(item)
        ? languages.filter((l) => l !== item)
        : [...languages, item];
    } else {
      newArray = specialties.includes(item)
        ? specialties.filter((s) => s !== item)
        : [...specialties, item];
    }
    setter(newArray);

    const finalSpecialties =
      field === "specialties"
        ? [
            ...newArray.filter((s) => s !== "Other"),
            ...(newArray.includes("Other") && otherSpecialty.trim()
              ? [`Other: ${otherSpecialty.trim()}`]
              : newArray.includes("Other")
                ? ["Other"]
                : []),
          ]
        : undefined;

    try {
      await doSave({ [field]: field === "specialties" ? finalSpecialties : newArray });
      onUpdate(field, field === "specialties" ? finalSpecialties : newArray);
    } catch {
      // error surfaced via banner
    }
  }

  async function handleOtherSpecialtyChange(value: string) {
    setOtherSpecialty(value);
    const finalSpecialties = [
      ...specialties.filter((s) => s !== "Other"),
      ...(value.trim() ? [`Other: ${value.trim()}`] : ["Other"]),
    ];
    try {
      await doSave({ specialties: finalSpecialties });
      onUpdate("specialties", finalSpecialties);
    } catch {
      // error surfaced via banner
    }
  }

  async function handleToggleAvailable(available: boolean) {
    try {
      await doSave({ available });
      onUpdate("available", available);
    } catch {
      // error surfaced via banner
    }
  }

  async function handleToggleShowPrices() {
    const newValue = !showPrices;
    setShowPrices(newValue);
    try {
      await doSave({ showPrices: newValue });
      onUpdate("showPrices", newValue);
    } catch {
      // error surfaced via banner
    }
  }

  function extractSocialUrl(text: string, host: string): string {
    const regex = new RegExp(`https?:\\/\\/(?:www\\.)?${host}[^\\s]*`, "i");
    const match = text.match(regex);
    return match ? match[0] : "";
  }

  async function handleSocialSave(value: string) {
    const instagramUrl = extractSocialUrl(value, "instagram\\.com");
    const tiktokUrl = extractSocialUrl(value, "tiktok\\.com");
    try {
      await doSave({ instagramUrl, tiktokUrl });
      onUpdate("socialProfiles", value);
    } catch {
      // error surfaced via banner
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Changes save automatically as you type
        </p>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{saveError}</span>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="shrink-0 text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 text-lg leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Photo */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <div className="flex flex-col items-center">
          <ProfilePictureUploader
            value={profile.image}
            onChange={handleImageChange}
            onError={() => {}}
            folder="profile"
            size="md"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tap to change photo
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Camera className="w-4 h-4 text-rose-500" /> Basic Info
        </h2>
        <div className="space-y-4">
          <AutoSaveField
            label="Display Name"
            value={profile.name}
            onSave={handleFieldSave("name")}
            placeholder="Your professional name"
            required
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <AutoSaveField
              label="Email"
              value={profile.email}
              onSave={handleFieldSave("email")}
              type="email"
              required
            />
            <AutoSaveField
              label="Phone"
              value={profile.phone}
              onSave={handleFieldSave("phone")}
              type="tel"
              placeholder="+60 12-345 6789"
              required
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" /> Location
        </h2>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                State
              </label>
              <select
                value={area}
                onChange={(e) => handleSelectChange("area", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="">Select state</option>
                {initialStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                City/District
              </label>
              <select
                value={district}
                onChange={(e) => handleSelectChange("district", e.target.value)}
                disabled={!area}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none disabled:opacity-50"
              >
                <option value="">{area ? "Select city" : "Select state first"}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <AutoSaveField
            label="Location Label"
            value={profile.location}
            onSave={handleFieldSave("location")}
            placeholder="e.g. Cyberjaya, Malaysia"
            required
          />
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">About You</h2>
        <div className="space-y-4">
          <AutoSaveField
            label="Bio"
            value={profile.bio}
            onSave={handleFieldSave("bio")}
            type="textarea"
            placeholder="Tell clients about yourself, your style, and your story..."
            rows={4}
          />
          <AutoSaveField
            label="Years of Experience"
            value={String(profile.experience)}
            onSave={async (v) => {
              await handleFieldSave("experience")(v);
            }}
            type="number"
            min={0}
            max={80}
          />
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Languages className="w-4 h-4 text-rose-500" /> Languages
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {languageOptions.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleArrayItem("languages", lang)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                languages.includes(lang)
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300"
                  : "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  languages.includes(lang)
                    ? "bg-rose-500 border-rose-500"
                    : "border-gray-300 dark:border-neutral-600"
                }`}
              >
                {languages.includes(lang) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-rose-500" /> Specialties
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {expertiseOptions.map((area) => (
            <button
              key={area}
              onClick={() => toggleArrayItem("specialties", area)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                specialties.includes(area)
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300"
                  : "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  specialties.includes(area)
                    ? "bg-rose-500 border-rose-500"
                    : "border-gray-300 dark:border-neutral-600"
                }`}
              >
                {specialties.includes(area) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {area}
            </button>
          ))}
        </div>
        {specialties.includes("Other") && (
          <input
            type="text"
            value={otherSpecialty}
            onChange={(e) => handleOtherSpecialtyChange(e.target.value)}
            placeholder="Specify other specialty..."
            className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
        )}
      </div>

      {/* Social & Certifications */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AtSign className="w-4 h-4 text-rose-500" /> Social & Links
        </h2>
        <div className="space-y-4">
          <AutoSaveField
            label="Instagram / TikTok"
            value={profile.socialProfiles}
            onSave={handleSocialSave}
            type="textarea"
            placeholder={"https://instagram.com/yourname\nhttps://tiktok.com/@yourname"}
            rows={2}
          />
          <AutoSaveField
            label="Certifications & Training"
            value={profile.certifications}
            onSave={handleFieldSave("certifications")}
            type="textarea"
            placeholder="List certifications or training..."
            rows={3}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500" /> Settings
        </h2>
        <div className="space-y-4">
          <AvailabilityToggle
            available={initialAvailable}
            onToggle={handleToggleAvailable}
          />

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Show prices publicly</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Display service prices on your profile</p>
            </div>
            <button
              type="button"
              onClick={handleToggleShowPrices}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showPrices ? "bg-rose-500" : "bg-gray-300 dark:bg-neutral-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showPrices ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Response Time
            </label>
            <div className="flex flex-wrap gap-2">
              {responseTimeOptions.map((rt) => (
                <button
                  key={rt}
                  onClick={() => handleSelectChange("responseTime", rt)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    responseTime === rt
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-rose-300"
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Availability
            </label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelectChange("availability", opt.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    availability === opt.value
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-rose-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
