import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, users, bookings, categories as categoriesTable } from "@/db/schema";
import { ilike, or, eq, inArray, and, gte, lte, desc, asc, sql, count, notLike, ne, notInArray } from "drizzle-orm";
import { categories } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const eventCategory = searchParams.get("eventCategory");
    const eventType = searchParams.get("eventType");
    const date = searchParams.get("date");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "rating";
    const pageSize = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const offset = (page - 1) * pageSize;

    // Artists are profiles with role = 'artist'.
    const selectFields = {
      id: profiles.userId,
      userId: profiles.userId,
      slug: profiles.slug,
      bio: profiles.bio,
      area: profiles.area,
      district: profiles.district,
      rating: profiles.rating,
      reviewCount: profiles.reviewCount,
      price: profiles.price,
      verified: profiles.verified,
      available: profiles.available,
      responseTime: profiles.responseTime,
      specialties: profiles.specialties,
      categories: profiles.categories,
      languages: profiles.languages,
      portfolio: profiles.portfolio,
      featured: profiles.featured,
      name: users.name,
      image: users.image,
      location: users.location,
    };

    const baseQuery = db
      .select(selectFields)
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId));

    const baseFilters: any[] = [notLike(profiles.userId, "artist-seed%")];

     if (search) {
       baseFilters.push(
         or(
           ilike(users.name, `%${search}%`),
           ilike(users.location, `%${search}%`),
           ilike(users.email, `%${search}%`),
           ilike(profiles.bio, `%${search}%`),
           ilike(profiles.area, `%${search}%`),
         ),
       );
     }

    if (location) {
      baseFilters.push(
        or(
          ilike(users.location, `%${location}%`),
          ilike(profiles.area, `%${location}%`),
          ilike(profiles.district, `%${location}%`),
        ),
      );
    }

    if (state) {
      baseFilters.push(
        or(
          ilike(profiles.area, `%${state}%`),
          ilike(users.location, `%${state}%`),
        ),
      );
    }

    if (district) {
      baseFilters.push(
        or(
          ilike(profiles.district, `%${district}%`),
          ilike(users.location, `%${district}%`),
        ),
      );
    }

    if (eventCategory === "bridal") {
      baseFilters.push(sql`${profiles.categories} @> ARRAY['bridal']::text[]`);
    } else if (eventCategory === "non-bridal") {
      baseFilters.push(
        or(
          sql`${profiles.categories} @> ARRAY['event']::text[]`,
          sql`${profiles.categories} @> ARRAY['editorial']::text[]`,
        ),
      );
    }

    if (date) {
      const bookedRows = await db
        .select({ artistId: bookings.artistId })
        .from(bookings)
        .where(
          and(
            eq(bookings.date, new Date(date)),
            ne(bookings.status, "cancelled"),
          ),
        );
      const bookedIds = bookedRows.map((r) => r.artistId).filter(Boolean) as string[];
      if (bookedIds.length > 0) {
        baseFilters.push(notInArray(profiles.userId, bookedIds));
      }
    }

    if (minPrice) {
      baseFilters.push(gte(profiles.price, String(minPrice)));
    }

    if (maxPrice) {
      baseFilters.push(lte(profiles.price, String(maxPrice)));
    }

    const sortMap: Record<string, any> = {
      rating: desc(profiles.rating),
      price_asc: asc(profiles.price),
      price_desc: desc(profiles.price),
      name: asc(users.name),
      newest: desc(profiles.createdAt),
    };

    const orderBy = sortMap[sort] || desc(profiles.rating);

    let rows: any[] = [];
    let total = 0;

    if (category) {
      const categoryRow = await db
        .select({ slug: categoriesTable.slug })
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, category))
        .limit(1);

      if (categoryRow.length > 0) {
        const catFilter = and(
          eq(profiles.role, "artist"),
          ...baseFilters,
          sql`${profiles.categories} @> ARRAY[${category}]::text[]`,
        );
        const [totalResult] = await db
          .select({ count: count() })
          .from(profiles)
          .innerJoin(users, eq(users.id, profiles.userId))
          .where(catFilter);
        total = totalResult?.count ?? 0;

        rows = await db
          .select(selectFields)
          .from(profiles)
          .innerJoin(users, eq(users.id, profiles.userId))
          .where(catFilter)
          .orderBy(orderBy)
          .limit(pageSize)
          .offset(offset);
      }
    } else {
      const where = and(eq(profiles.role, "artist"), ...baseFilters);
      const [totalResult] = await db
        .select({ count: count() })
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(where);
      total = totalResult?.count ?? 0;

      rows = await baseQuery
        .where(where)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset);
    }

    return NextResponse.json({
      artists: rows,
      categories,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (error) {
    console.error("Fetch artists error:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}
