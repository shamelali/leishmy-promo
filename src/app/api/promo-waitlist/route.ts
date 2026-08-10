import { NextRequest, NextResponse } from "next/server";
import { promoWaitlist } from "@/db/schema";
import { z } from "zod";
import { db } from "@/db";
import { sendWaitlistWelcomeEmail } from "@/lib/email/waitlist";
import { limit } from "@/lib/rate-limit";

// We'll define the schema for the promo waitlist
const promoWaitlistSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().toLowerCase().email(),
  audience: z.enum(["client", "artist"]).default("client"),
  location: z.string().trim().default("Cyberjaya"),
  categories: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await limit(`promo-waitlist:${ip}`);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const body = await request.json();
    const parsed = promoWaitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, audience, location, categories } = parsed.data;

    // We'll insert into a new table called promo_waitlist
    // We need to make sure this table exists. We'll create it via a migration.
    // For now, we'll assume it exists and has the following columns:
    // id, name, email, audience, location, categories (text, to store JSON string), createdAt
    const categoriesString = JSON.stringify(categories);

    const [entry] = await db
      .insert(promoWaitlist)
      .values({ name, email, audience, location, categories: categoriesString })
      .returning();

    sendWaitlistWelcomeEmail({ email, name }).catch((err) =>
      console.error("Waitlist welcome email failed:", err),
    );

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Promo waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join promo waitlist" },
      { status: 500 }
    );
  }
}