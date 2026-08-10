"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Upload, X, Save, Loader2 } from "lucide-react";
import { malaysiaDistricts, initialStates } from "@/data/malaysia-districts";
import { useAuth } from "@/context/AuthContext";
import { ProfilePictureUploader } from "@/components/upload";

export interface ArtistProfileEditValues {
  name: string;
  email: string;
  phone: string;
  location: string;
  area: string;
  district: string;
  bio: string;
  experience: number;
  languages: string[];
  specialties: string[];
  portfolio: string[];
  responseTime: string;
  price: number;
  showPrices: boolean;
  certifications: string;
  availability: string;
  availabilityNotes: string;
  socialProfiles: string;
  image: string;
}

interface ArtistProfileEditFormProps {
  initial: ArtistProfileEditValues;
  onSaved: (values: ArtistProfileEditValues) => void;
  onCancel: () => void;
}

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

const availabilityOptions = [
  { value: "weekdays", label: "Weekdays only" },
  { value: "weekends", label: "Weekends only" },
  { value: "both", label: "Weekdays & Weekends" },
  { value: "evenings", label: "Evenings only" },
  { value: "flexible", label: "Flexible / By appointment" },
  { value: "custom", label: "Custom (use notes below)" },
];

const responseTimeOptions = [
  "< 1hr",
  "< 2hr",
  "< 3hr",
  "< 6hr",
  "< 24hr",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function extractSocialUrl(text: string, host: string): string {
  const regex = new RegExp(`https?:\\/\\/(?:www\\.)?${host}[^\\s]*`, "i");
  const match = text.match(regex);
  return match ? match[0] : "";
}

export function ArtistProfileEditForm({
  initial,
  onSaved,
  onCancel,
}: ArtistProfileEditFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [image, setImage] = useState(initial.image || "");
  const [location, setLocation] = useState(initial.location);
  const [area, setArea] = useState(initial.area);
  const [district, setDistrict] = useState(initial.district);
  const [bio, setBio] = useState(initial.bio);
  const [experience, setExperience] = useState(initial.experience);
  const [languages, setLanguages] = useState<string[]>(initial.languages);
  const [specialties, setSpecialties] = useState<string[]>(initial.specialties);
  const [otherSpecialty, setOtherSpecialty] = useState(() => {
    const otherEntry = initial.specialties.find((s) => s.startsWith("Other:"));
    return otherEntry ? otherEntry.slice(7).trim() : "";
  });
const [responseTime, setResponseTime] = useState(initial.responseTime);

  const [portfolio, setPortfolio] = useState<string[]>(initial.portfolio);
  const [uploading, setUploading] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState(
    initial.portfolio.join("\n"),
  );
  const [certifications, setCertifications] = useState(initial.certifications);
  const [availability, setAvailability] = useState(initial.availability);
  const [availabilityNotes, setAvailabilityNotes] = useState(
    initial.availabilityNotes || initial.availability,
  );
  const [socialProfiles, setSocialProfiles] = useState(initial.socialProfiles);
  const [showPrices, setShowPrices] = useState(initial.showPrices || false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const districts = area ? malaysiaDistricts[area] || [] : [];
  const stateOptions = initialStates;

  function toggleSpecialty(area: string) {
    setSpecialties((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  }

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }

  function removePortfolioItem(index: number) {
    setPortfolio((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP images and PDF files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: "portfolio",
          publicIdPrefix: "prof",
          resourceType: "image",
        }),
      });

      if (!signRes.ok) {
        const err = (await signRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Could not start upload");
      }

      const sign = (await signRes.json()) as {
        apiKey: string;
        timestamp: number;
        signature: string;
        folder: string;
        allowedFormats: string[];
        maxFileSize: number;
        uploadUrl: string;
        publicId?: string;
      };

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sign.apiKey);
      form.append("timestamp", String(sign.timestamp));
      form.append("signature", sign.signature);
      form.append("folder", sign.folder);
      form.append("allowed_formats", sign.allowedFormats.join(","));
      form.append("max_file_size", String(sign.maxFileSize));
      if (sign.publicId) {
        form.append("public_id", sign.publicId);
      }

      const uploadRes = await fetch(sign.uploadUrl, { method: "POST", body: form });
      if (!uploadRes.ok) {
        const body = (await uploadRes.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(body?.error?.message || "Upload failed");
      }

      const data = (await uploadRes.json()) as { secure_url: string };
      setPortfolio((prev) => [...prev, data.secure_url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Invalid email address";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!area) errors.area = "State is required";
    if (!district) errors.district = "City is required";
    if (!location.trim()) errors.location = "Location is required";
    if (experience < 0) errors.experience = "Experience cannot be negative";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccess(false);

    const links = portfolioLinks
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const allPortfolio = Array.from(new Set([...portfolio, ...links]));

    const availabilityValue =
      availability === "custom" ? availabilityNotes.trim() : availability;

    try {
      if (!user?.id) {
        throw new Error("Not signed in");
      }
      const res = await fetch(
        `/api/user/artist-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            image,
            location: location.trim(),
            area,
            district,
            bio: bio.trim(),
            experience: Number(experience) || 0,
            languages,
            specialties: [
              ...specialties.filter((s) => s !== "Other"),
              ...(specialties.includes("Other") && otherSpecialty.trim()
                ? [`Other: ${otherSpecialty.trim()}`]
                : specialties.includes("Other")
                  ? ["Other"]
                  : []),
            ],
            responseTime,
            portfolio: allPortfolio,
            certifications: certifications.trim(),
            availability: availabilityValue,
            instagramUrl: extractSocialUrl(socialProfiles, "instagram\\.com"),
            tiktokUrl: extractSocialUrl(socialProfiles, "tiktok\\.com"),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(data.details).map(([key, msgs]) => [
                key,
                (msgs as string[])[0],
              ]),
            ),
          );
          throw new Error("Please fix the highlighted fields.");
        }
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      onSaved({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        image,
        location: location.trim(),
        area,
        district,
        bio: bio.trim(),
        experience: Number(experience) || 0,
        languages,
        specialties: [
          ...specialties.filter((s) => s !== "Other"),
          ...(specialties.includes("Other") && otherSpecialty.trim()
            ? [`Other: ${otherSpecialty.trim()}`]
            : specialties.includes("Other")
              ? ["Other"]
              : []),
        ],
        portfolio: allPortfolio,
        responseTime,
        price: initial.price,
        showPrices,
        certifications: certifications.trim(),
        availability: availabilityValue,
        availabilityNotes,
        socialProfiles: socialProfiles.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Profile Updated!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your artist profile has been saved successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex flex-col items-center pb-4 border-b border-gray-100 dark:border-neutral-800">
        <ProfilePictureUploader
          value={image}
          onChange={setImage}
          onError={(msg) => setError(msg)}
          folder="profile"
          size="md"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Profile photo (square headshot recommended)
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Display Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              fieldErrors.name
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none`}
            placeholder="Your full name"
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              fieldErrors.email
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none`}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Phone Number *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+60 12-345 6789"
          className={`w-full px-4 py-2.5 rounded-xl border ${
            fieldErrors.phone
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-neutral-700"
          } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none`}
        />
        {fieldErrors.phone && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            State *
          </label>
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setDistrict("");
            }}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              fieldErrors.area
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none`}
          >
            <option value="">Select state</option>
            {stateOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {fieldErrors.area && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.area}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            City/District *
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!area}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              fieldErrors.district
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">{area ? "Select city/district" : "Select a state first"}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {fieldErrors.district && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.district}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Location Label *
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Cyberjaya, Malaysia"
          className={`w-full px-4 py-2.5 rounded-xl border ${
            fieldErrors.location
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-neutral-700"
          } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none`}
        />
        {fieldErrors.location && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.location}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Years of Experience
        </label>
        <input
          type="number"
          min="0"
          max="80"
          value={experience}
          onChange={(e) => setExperience(Number(e.target.value))}
          className={`w-full px-4 py-2.5 rounded-xl border ${
            fieldErrors.experience
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-neutral-700"
          } bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none`}
        />
        {fieldErrors.experience && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.experience}</p>
        )}
        <p className="text-xs text-gray-400 mt-1.5">
          Starting price is set automatically from your Services — manage it on the{" "}
          <Link href="/dashboard/artist/services" className="underline hover:text-rose-500">
            Services page
          </Link>.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Display prices publicly</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Show your service prices on your profile and listings</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPrices(!showPrices)}
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
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell clients about yourself, your style, and your story..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Languages (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {languageOptions.map((lang) => (
              <label
                key={lang}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  languages.includes(lang)
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700"
                    : "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:border-rose-200 dark:hover:border-rose-800"
                }`}
              >
                <div
                  onClick={() => toggleLanguage(lang)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
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
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                  {lang}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Response Time
          </label>
          <select
            value={responseTime}
            onChange={(e) => setResponseTime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none"
          >
            <option value="">Select...</option>
            {responseTimeOptions.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Areas of Expertise (select all that apply)
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {expertiseOptions.map((area) => (
            <label
              key={area}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                specialties.includes(area)
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700"
                  : "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:border-rose-200 dark:hover:border-rose-800"
              }`}
            >
              <div
                onClick={() => toggleSpecialty(area)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
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
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                {area}
              </span>
            </label>
          ))}
        </div>
        {specialties.includes("Other") && (
          <input
            type="text"
            value={otherSpecialty}
            onChange={(e) => setOtherSpecialty(e.target.value)}
            placeholder="Specify other specialty..."
            className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Upload Portfolio
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          Upload images or PDFs (max 10MB each). You can also paste links below.
        </p>
        <label className="flex flex-col items-center justify-center px-4 py-5 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800 cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 transition-colors">
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Click to upload
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                JPEG, PNG, WebP, or PDF
              </span>
            </div>
          )}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {portfolio.length > 0 && (
          <ul className="mt-2 space-y-1">
            {portfolio.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800 text-xs text-gray-600 dark:text-gray-300"
              >
                <span className="truncate flex-1">{url}</span>
                <button
                  type="button"
                  onClick={() => removePortfolioItem(i)}
                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded transition-colors"
                  aria-label="Remove portfolio item"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Portfolio Links
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          Share links to your portfolio, website, or Google Drive (one per line)
        </p>
        <textarea
          value={portfolioLinks}
          onChange={(e) => setPortfolioLinks(e.target.value)}
          rows={3}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Professional Certifications or Training
        </label>
        <textarea
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          rows={3}
          placeholder="List any certifications or training you have completed..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Social Media Profiles / Website
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          Paste your Instagram and TikTok links — they will be parsed automatically.
        </p>
        <textarea
          value={socialProfiles}
          onChange={(e) => setSocialProfiles(e.target.value)}
          rows={2}
          placeholder="https://instagram.com/yourname&#10;https://tiktok.com/@yourname"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Availability for Bookings
        </label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none appearance-none"
        >
          <option value="">Select availability</option>
          {availabilityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {availability === "custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Availability Notes
          </label>
          <textarea
            value={availabilityNotes}
            onChange={(e) => setAvailabilityNotes(e.target.value)}
            rows={3}
            placeholder="Describe your general availability — days, times, willingness to travel, etc."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
