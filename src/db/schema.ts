import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    phone: text("phone"),
    location: text("location"),
    avatar: text("avatar"),
    bio: text("bio"),
    role: text("role").default("customer"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("user_email_idx").on(table.email)],
);

// One profile row per user. Collapses the old `artists` and `studios`
// tables into a single person record keyed by `user.id`, so a person can
// be created/edited/deleted in exactly one place.
export const profileRoleValues = ["customer", "artist", "studio", "admin"] as const;
export type ProfileRole = (typeof profileRoleValues)[number];

export const profiles = pgTable(
  "profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("customer").notNull(),
    status: varchar("status", { length: 32 }).default("draft").notNull(),
    verified: boolean("verified").default(false),
    available: boolean("available").default(true),
    slug: varchar("slug", { length: 255 }),
    bio: text("bio"),
    description: text("description"),
    portfolio: text("portfolio").array(),
    categories: text("categories").array(),
    specialties: jsonb("specialties").$type<string[]>().default([]),
    languages: text("languages").array(),
    certifications: text("certifications"),
    availability: text("availability"),
    instagramUrl: varchar("instagram_url", { length: 500 }),
    tiktokUrl: varchar("tiktok_url", { length: 500 }),
    willingToTravel: boolean("willing_to_travel").default(false),
    travelCoverage: varchar("travel_coverage", { length: 50 }),
    operatingDays: jsonb("operating_days").$type<string[]>().default([]),
    experience: integer("experience").default(0),
    responseTime: varchar("response_time", { length: 50 }),
    price: decimal("price", { precision: 10, scale: 2 }).default("0"),
    accommodationFee: decimal("accommodation_fee", { precision: 10, scale: 2 }).default("0"),
    travelSurcharge: decimal("travel_surcharge", { precision: 10, scale: 2 }).default("0"),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
    reviewCount: integer("review_count").default(0),
    area: varchar("area", { length: 100 }),
    district: varchar("district", { length: 100 }),
    featured: boolean("featured").default(false),
    showPrices: boolean("show_prices").default(false),
    defaultDepositPercent: integer("default_deposit_percent").default(30),
    pricingRules: jsonb("pricing_rules").$type<{
      weekendSurcharge?: number;
      holidaySurcharge?: number;
      lastMinuteSurcharge?: number;
      earlyBirdDiscount?: number;
      peakMonths?: number[];
    }>().default({}),
    bankName: varchar("bank_name", { length: 255 }),
    bankCode: varchar("bank_code", { length: 20 }),
    accountNumber: varchar("account_number", { length: 100 }),
    accountHolder: varchar("account_holder", { length: 255 }),
    onboardingStep: integer("onboarding_step").default(0).notNull(),
    rejectionReason: text("rejection_reason"),
    studioId: text("studio_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("profiles_slug_idx").on(table.slug),
    index("profiles_role_idx").on(table.role),
    index("profiles_status_idx").on(table.status),
    index("profiles_user_id_idx").on(table.userId),
  ],
);

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.providerAccountId, table.provider] })],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("verification_token_token_idx").on(table.token),
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    image: text("image"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)],
);

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  artistId: text("artist_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  studioId: text("studio_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  popular: boolean("popular").default(false),
  category: varchar("category", { length: 50 }).default("event"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
},
(table) => [
  index("services_artist_id_idx").on(table.artistId),
  index("services_studio_id_idx").on(table.studioId),
],
);

export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
  artistId: text("artist_id").references(() => users.id, { onDelete: "cascade" }),
  studioId: text("studio_id").references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  includes: jsonb("includes").$type<string[]>().default([]),
  duration: varchar("duration", { length: 50 }),
  popular: boolean("popular").default(false),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
},
(table) => [
  index("service_packages_service_idx").on(table.serviceId),
  index("service_packages_artist_idx").on(table.artistId),
  index("service_packages_studio_idx").on(table.studioId),
],
);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  text: text("text"),
  author: varchar("author", { length: 255 }).notNull(),
  authorAvatar: text("author_avatar"),
  service: varchar("service", { length: 255 }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  artistId: text("artist_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  studioId: text("studio_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
},
(table) => [
  index("reviews_artist_id_idx").on(table.artistId),
  index("reviews_studio_id_idx").on(table.studioId),
  index("reviews_booking_id_idx").on(table.bookingId),
],
);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  artistId: text("artist_id").references(() => users.id, {
    onDelete: "set null",
  }),
  studioId: text("studio_id").references(() => users.id, {
    onDelete: "set null",
  }),
  serviceId: integer("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  date: timestamp("date", { mode: "date" }).notNull(),
  time: varchar("time", { length: 50 }),
  service: varchar("service", { length: 255 }),
  notes: text("notes"),
  location: varchar("location", { length: 255 }),
  placeId: varchar("place_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  milestone: varchar("milestone", { length: 50 }),
  secondPaymentDueDate: timestamp("second_payment_due_date", { mode: "date" }),
  lateFeeCharged: boolean("late_fee_charged").default(false),
  noShow: boolean("no_show").default(false),
  travelSurcharge: decimal("travel_surcharge", { precision: 10, scale: 2 }).default("0"),
  accommodationFee: decimal("accommodation_fee", { precision: 10, scale: 2 }).default("0"),
  remainingPaymentSent: boolean("remaining_payment_sent").default(false),
  servicePrice: decimal("service_price", { precision: 10, scale: 2 }).default("0"),
  selectedQuoteOptionId: integer("selected_quote_option_id"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  discountReason: varchar("discount_reason", { length: 255 }),
  extras: jsonb("extras").$type<Array<{ name: string; price: number }>>().default([]),
  packageName: varchar("package_name", { length: 255 }),
  depositPercent: integer("deposit_percent").default(30),
  promoCodeId: integer("promo_code_id"),
  quoteId: text("quote_id"),
  quoteSentAt: timestamp("quote_sent_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
},
(table) => [
  index("bookings_user_id_idx").on(table.userId),
  index("bookings_artist_id_idx").on(table.artistId),
  index("bookings_date_idx").on(table.date),
  index("bookings_status_idx").on(table.status),
  index("bookings_user_status_idx").on(table.userId, table.status),
],
);

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    artistId: text("artist_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("favorites_user_idx").on(table.userId),
    index("favorites_artist_idx").on(table.artistId),
  ],
);

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  rating: integer("rating").default(5),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  event: varchar("event", { length: 255 }).notNull(),
  payload: jsonb("payload"),
  status: varchar("status", { length: 50 }).default("received"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("MYR"),
  status: varchar("status", { length: 50 }).default("pending"),
  billplzId: varchar("billplz_id", { length: 255 }),
  method: varchar("method", { length: 50 }),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  paidAt: timestamp("paid_at", { mode: "date" }),
  releasedAt: timestamp("released_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
},
(table) => [
  index("payments_booking_id_idx").on(table.bookingId),
  index("payments_status_idx").on(table.status),
],
);

export const quoteOptions = pgTable("quote_options", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  servicePrice: decimal("service_price", { precision: 10, scale: 2 }).notNull(),
  travelFee: decimal("travel_fee", { precision: 10, scale: 2 }).default("0"),
  accommodationFee: decimal("accommodation_fee", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  discountReason: varchar("discount_reason", { length: 255 }),
  extras: jsonb("extras").$type<Array<{ name: string; price: number }>>().default([]),
  selected: boolean("selected").default(false),
  selectedAt: timestamp("selected_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
},
(table) => [
  index("quote_options_booking_idx").on(table.bookingId),
],
);

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default("0.08"),
  commissionAmount: integer("commission_amount").default(0),
  netAmount: integer("net_amount"),
  status: varchar("status", { length: 50 }).default("pending"),
  payoutOrderId: varchar("payout_order_id", { length: 255 }),
  billplzPayoutStatus: varchar("billplz_payout_status", { length: 50 }),
  dispatchedAmount: integer("dispatched_amount"),
  dispatchedAt: timestamp("dispatched_at", { mode: "date" }),
  paymentId: integer("payment_id").references(() => payments.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: serial("id").primaryKey(),
    artistId: text("artist_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    studioId: text("studio_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    date: timestamp("date", { mode: "date" }).notNull(),
    time: varchar("time", { length: 50 }).notNull(),
    isBooked: boolean("is_booked").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("availability_artist_date_idx").on(table.artistId, table.date),
    index("availability_studio_date_idx").on(table.studioId, table.date),
  ],
);

export const bookingEvents = pgTable(
  "booking_events",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    eventPayload: jsonb("event_payload"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("booking_events_booking_idx").on(table.bookingId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull().default("system"),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body"),
    data: jsonb("data"),
    readAt: timestamp("read_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)],
);

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    artistId: text("artist_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    location: text("location"),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_artist_idx").on(table.artistId),
    index("inquiries_status_idx").on(table.status),
  ],
);

export const studioInventory = pgTable("studio_inventory", {
  id: serial("id").primaryKey(),
  studioId: text("studio_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantity: integer("quantity").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const communityApplications = pgTable("community_applications", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  yearsOfExperience: text("years_of_experience").notNull(),
  expertiseAreas: jsonb("expertise_areas").$type<string[]>().notNull(),
  portfolioImageUrl: text("portfolio_image_url"),
  portfolioLinks: text("portfolio_links"),
  certifications: text("certifications"),
  socialProfiles: text("social_profiles"),
  availability: text("availability").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const skinProfiles = pgTable(
  "skin_profiles",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    skinType: varchar("skin_type", { length: 50 }),
    skinConcerns: jsonb("skin_concerns").$type<string[]>().default([]),
    undertone: varchar("undertone", { length: 50 }),
    allergies: jsonb("allergies").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("skin_profiles_user_idx").on(table.userId)],
);

export const beautyPreferences = pgTable(
  "beauty_preferences",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    preferredStyles: jsonb("preferred_styles").$type<string[]>().default([]),
    preferredProducts: jsonb("preferred_products").$type<string[]>().default([]),
    makeupNotes: text("makeup_notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("beauty_preferences_user_idx").on(table.userId)],
);

export const inspirationBoards = pgTable(
  "inspiration_boards",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    coverImage: text("cover_image"),
    isPublic: boolean("is_public").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("inspiration_boards_user_idx").on(table.userId)],
);

export const savedInspiration = pgTable(
  "saved_inspiration",
  {
    id: serial("id").primaryKey(),
    boardId: integer("board_id")
      .notNull()
      .references(() => inspirationBoards.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sourceArtistId: text("source_artist_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sourceType: varchar("source_type", { length: 50 }).default("user_upload"),
    caption: text("caption"),
    tags: jsonb("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("saved_inspiration_board_idx").on(table.boardId),
    index("saved_inspiration_user_idx").on(table.userId),
  ],
);

export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  minPoints: integer("min_points").notNull().default(0),
  multiplier: decimal("multiplier", { precision: 3, scale: 2 }).default("1.00"),
  perks: jsonb("perks").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const loyaltyPoints = pgTable(
  "loyalty_points",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    balance: integer("balance").notNull().default(0),
    lifetimeEarned: integer("lifetime_earned").notNull().default(0),
    lifetimeRedeemed: integer("lifetime_redeemed").notNull().default(0),
    tier: varchar("tier", { length: 50 }).default("bronze"),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("loyalty_points_user_idx").on(table.userId)],
);

export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    price: integer("price").notNull(),
    currency: varchar("currency", { length: 10 }).default("MYR"),
    durationDays: integer("duration_days").notNull().default(30),
    features: jsonb("features").$type<string[]>().default([]),
    popular: boolean("popular").default(false),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: integer("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
    billplzBillId: varchar("billplz_bill_id", { length: 255 }),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("subscriptions_user_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
  ],
);

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    date: timestamp("date", { mode: "date" }).notNull(),
    endDate: timestamp("end_date", { mode: "date" }),
    time: varchar("time", { length: 100 }),
    endTime: varchar("end_time", { length: 100 }),
    location: varchar("location", { length: 255 }),
    address: text("address"),
    category: varchar("category", { length: 100 }).default("Workshop"),
    image: text("image").default("/placeholder.svg"),
    organizerName: varchar("organizer_name", { length: 255 }),
    organizerContact: varchar("organizer_contact", { length: 255 }),
    ticketUrl: varchar("ticket_url", { length: 500 }),
    featured: boolean("featured").default(false),
    published: boolean("published").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("events_date_idx").on(table.date),
    index("events_category_idx").on(table.category),
    index("events_published_idx").on(table.published),
  ],
);

export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    source: varchar("source", { length: 50 }).notNull(),
    referenceId: varchar("reference_id", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("loyalty_transactions_user_idx").on(table.userId),
    index("loyalty_transactions_created_idx").on(table.createdAt),
  ],
);

export const receivedEmails = pgTable(
  "received_emails",
  {
    id: serial("id").primaryKey(),
    recipient: text("recipient").notNull(),
    sender: text("sender").notNull(),
    subject: text("subject"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    source: text("source").default("brevo-inbound"),
    messageId: text("message_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("received_emails_recipient_idx").on(table.recipient),
    index("received_emails_created_idx").on(table.createdAt),
  ],
);

export const referralStatusValues = ["clicked", "registered", "booked", "rewarded"] as const;
export type ReferralStatus = (typeof referralStatusValues)[number];

export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    referrerType: varchar("referrer_type", { length: 50 }).notNull(),
    referrerUserId: text("referrer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredUserId: text("referred_user_id").references(() => users.id, { onDelete: "set null" }),
    referredEmail: text("referred_email"),
    status: varchar("status", { length: 50 }).notNull().default("clicked"),
    bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    pointsAwarded: integer("points_awarded").default(0),
    clickedAt: timestamp("clicked_at", { mode: "date" }).defaultNow().notNull(),
    registeredAt: timestamp("registered_at", { mode: "date" }),
    bookedAt: timestamp("booked_at", { mode: "date" }),
    rewardedAt: timestamp("rewarded_at", { mode: "date" }),
  },
  (table) => [
    index("referrals_referrer_idx").on(table.referrerType, table.referrerUserId),
    index("referrals_status_idx").on(table.status),
    index("referrals_referred_user_idx").on(table.referredUserId),
  ],
);



export const urls = pgTable(
  "urls",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 20 }).unique().notNull(),
    url: text("url").notNull(),
    custom: boolean("custom").default(false).notNull(),
    clicks: integer("clicks").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("urls_code_idx").on(table.code),
    index("urls_created_idx").on(table.createdAt),
  ],
);

export const urlAnalytics = pgTable(
  "url_analytics",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 20 }).notNull(),
    referer: text("referer"),
    userAgent: text("user_agent"),
    country: varchar("country", { length: 100 }),
    timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("url_analytics_code_idx").on(table.code),
    index("url_analytics_timestamp_idx").on(table.timestamp),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    participant1Id: text("participant1_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    participant2Id: text("participant2_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { mode: "date" }).defaultNow().notNull(),
    lastMessagePreview: varchar("last_message_preview", { length: 200 }),
    participant1Read: boolean("participant1_read").default(true),
    participant2Read: boolean("participant2_read").default(true),
    closed: boolean("closed").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("conversations_booking_idx").on(table.bookingId),
    index("conversations_p1_idx").on(table.participant1Id),
    index("conversations_p2_idx").on(table.participant2Id),
    index("conversations_last_msg_idx").on(table.lastMessageAt),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_sender_idx").on(table.senderId),
    index("messages_created_idx").on(table.createdAt),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    issuerId: text("issuer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
    commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).default("issued"),
    lineItems: jsonb("line_items").$type<Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>>().default([]),
    issuedAt: timestamp("issued_at", { mode: "date" }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("invoices_booking_idx").on(table.bookingId),
    index("invoices_issuer_idx").on(table.issuerId),
    index("invoices_recipient_idx").on(table.recipientId),
    index("invoices_status_idx").on(table.status),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 50 }),
    meta: jsonb("meta"),
    ip: varchar("ip", { length: 45 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_created_idx").on(table.createdAt),
  ],
);

export const disputes = pgTable(
  "disputes",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    againstId: text("against_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    category: varchar("category", { length: 100 }).default("general"),
    status: varchar("status", { length: 50 }).default("open"),
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("disputes_booking_idx").on(table.bookingId),
    index("disputes_reporter_idx").on(table.reporterId),
    index("disputes_against_idx").on(table.againstId),
    index("disputes_status_idx").on(table.status),
  ],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull().default(""),
    authKey: text("auth_key").notNull().default(""),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("push_sub_user_idx").on(table.userId),
    sql`UNIQUE (${table.userId}, ${table.endpoint})`,
  ],
);

// ── Phase 3.2: Scheduling ──────────────────────────────────────────────

export const availabilityRules = pgTable(
  "availability_rules",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Sun..6=Sat
    startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
    endTime: varchar("end_time", { length: 5 }).notNull(), // "17:00"
    slotDurationMinutes: integer("slot_duration_minutes").default(60),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("avail_rules_user_idx").on(table.userId),
    index("avail_rules_day_idx").on(table.dayOfWeek),
  ],
);

export const availabilityOverrides = pgTable(
  "availability_overrides",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date", { mode: "date" }).notNull(),
    unavailable: boolean("unavailable").default(false),
    startTime: varchar("start_time", { length: 5 }),
    endTime: varchar("end_time", { length: 5 }),
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("avail_overrides_user_idx").on(table.userId),
    index("avail_overrides_date_idx").on(table.date),
  ],
);

// ── Phase 3.3: Notification Preferences ────────────────────────────────

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    emailEnabled: boolean("email_enabled").default(true),
    pushEnabled: boolean("push_enabled").default(true),
    whatsappEnabled: boolean("whatsapp_enabled").default(true),
    bookingNotifications: boolean("booking_notifications").default(true),
    messageNotifications: boolean("message_notifications").default(true),
    promoNotifications: boolean("promo_notifications").default(false),
    quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // "22:00"
    quietHoursEnd: varchar("quiet_hours_end", { length: 5 }), // "08:00"
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("notif_prefs_user_idx").on(table.userId),
  ],
);

// ── Phase 4.2: Promo Codes ─────────────────────────────────────────────

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    type: varchar("type", { length: 20 }).notNull(), // "percent" | "fixed"
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("0"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").default(0),
    validFrom: timestamp("valid_from", { mode: "date" }).defaultNow().notNull(),
    validUntil: timestamp("valid_until", { mode: "date" }),
    active: boolean("active").default(true),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("promo_codes_code_idx").on(table.code),
    index("promo_codes_active_idx").on(table.active),
  ],
);

export const promoCodeUsages = pgTable(
  "promo_code_usages",
  {
    id: serial("id").primaryKey(),
    promoCodeId: integer("promo_code_id")
      .notNull()
      .references(() => promoCodes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("promo_usage_code_idx").on(table.promoCodeId),
    index("promo_usage_user_idx").on(table.userId),
  ],
);

// ── Phase 4.3: Blog Posts ──────────────────────────────────────────────

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    tags: text("tags").array(),
    published: boolean("published").default(false),
    publishedAt: timestamp("published_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_slug_idx").on(table.slug),
    index("blog_posts_published_idx").on(table.published),
  ],
);

// ── Phase 5.3: Compliance ──────────────────────────────────────────────

export const dataExportRequests = pgTable(
  "data_export_requests",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).default("pending"), // pending | processing | completed | failed
    requestedAt: timestamp("requested_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    downloadUrl: text("download_url"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("data_export_user_idx").on(table.userId),
    index("data_export_status_idx").on(table.status),
  ],
);

export const consentRecords = pgTable(
  "consent_records",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // "marketing_email" | "push_notifications" | "data_analytics" | "third_party_sharing"
    granted: boolean("granted").notNull(),
    ip: varchar("ip", { length: 45 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("consent_user_idx").on(table.userId),
    index("consent_type_idx").on(table.type),
  ],
);

export const promoWaitlist = pgTable("promo_waitlist", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  audience: varchar("audience", { length: 50 }).notNull().default("client"),
  location: varchar("location", { length: 255 }).notNull().default("Cyberjaya"),
  categories: text("categories").notNull().default("[]"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
});
