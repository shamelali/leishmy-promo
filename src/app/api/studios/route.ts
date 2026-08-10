import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, users, bookings, payments } from "@/db/schema";
import { eq, ilike, or, and, desc, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    if (action === "dashboard" && userId) {
      const [studio] = await db
        .select({
          userId: profiles.userId,
          slug: profiles.slug,
          description: profiles.description,
          price: profiles.price,
          rating: profiles.rating,
          reviewCount: profiles.reviewCount,
          featured: profiles.featured,
          name: users.name,
          image: users.image,
          email: users.email,
          phone: users.phone,
          location: users.location,
        })
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(and(eq(profiles.role, "studio"), eq(profiles.userId, userId)))
        .limit(1);

      if (!studio) {
        return NextResponse.json({ error: "Studio not found" }, { status: 404 });
      }

      const [artistRows, bookingRows, studioPaymentRows] = await Promise.all([
        db
          .select({ userId: profiles.userId, name: users.name })
          .from(profiles)
          .innerJoin(users, eq(users.id, profiles.userId))
          .where(and(eq(profiles.studioId, userId), eq(profiles.role, "artist"))),
        db
          .select()
          .from(bookings)
          .where(eq(bookings.studioId, userId))
          .orderBy(desc(bookings.createdAt))
          .limit(10),
        db.select().from(payments).where(
          inArray(
            payments.bookingId,
            db.select({ id: bookings.id }).from(bookings).where(eq(bookings.studioId, userId)),
          ),
        ),
      ]);

      const revenue = studioPaymentRows
        .filter((p) => p.status === "paid" || p.status === "released")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pendingBalance = studioPaymentRows
        .filter((p) => p.status === "held")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const bookingUserIds = bookingRows.map((b) => b.userId).filter(Boolean);
      const bookingArtistIds = bookingRows.map((b) => b.artistId).filter(Boolean) as string[];

      const [userRows, artistNameRows] = await Promise.all([
        bookingUserIds.length > 0
          ? db.select().from(users).where(inArray(users.id, bookingUserIds))
          : Promise.resolve([]),
        bookingArtistIds.length > 0
          ? db
              .select({ userId: profiles.userId, name: users.name })
              .from(profiles)
              .innerJoin(users, eq(users.id, profiles.userId))
              .where(inArray(profiles.userId, bookingArtistIds))
          : Promise.resolve([]),
      ]);

      const userMap = new Map(userRows.map((u) => [u.id, u.name || "Anonymous"]));
      const artistNameMap = new Map(artistNameRows.map((a) => [a.userId, a.name || "Artist"]));

      const recentBookings = bookingRows.map((b) => ({
        id: String(b.id),
        date: b.date ? new Date(b.date).toLocaleDateString() : "",
        time: b.time || "",
        status: b.status || "pending",
        amount: String(b.amount || 0),
        artistName: artistNameMap.get(b.artistId!) || "",
        userName: userMap.get(b.userId) || "Anonymous",
      }));

      return NextResponse.json({
        studio,
        stats: {
          artists: artistRows.length,
          bookings: bookingRows.length,
          revenue,
          rating: Number(studio.rating) || 0,
          pendingBalance,
        },
        recentBookings,
      });
    }

     const filters: any[] = [eq(profiles.role, "studio")];
     if (search) {
       filters.push(
         or(
           ilike(users.name, `%${search}%`),
           ilike(users.location, `%${search}%`),
           ilike(users.email, `%${search}%`),
           ilike(profiles.description, `%${search}%`),
         )!,
       );
     }

    const rows = await db
      .select({
        id: profiles.userId,
        userId: profiles.userId,
        slug: profiles.slug,
        description: profiles.description,
        price: profiles.price,
        rating: profiles.rating,
        reviewCount: profiles.reviewCount,
        featured: profiles.featured,
        name: users.name,
        image: users.image,
        location: users.location,
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .where(and(...filters))
      .limit(limit);

    return NextResponse.json({ studios: rows });
  } catch (error) {
    console.error("Fetch studios error:", error);
    return NextResponse.json({ error: "Failed to fetch studios" }, { status: 500 });
  }
}
