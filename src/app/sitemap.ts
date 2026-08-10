import type { MetadataRoute } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, profiles } from "@/db/schema";

const PUBLIC_ROUTES = [
  "/",
  "/artists",
  "/studios",
  "/pricing",
  "/blog",
  "/events",
  "/inspiration",
  "/leish-plus",
  "/launch",
  "/faq",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/cancellation-policy",
] as const;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_URL || "https://leish.my");
  const now = new Date();

  const sitemapEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/artists" || path === "/studios" ? 0.9 : 0.7,
  }));

  try {
    const [activeProfiles, publishedPosts] = await Promise.all([
      db
        .select({ slug: profiles.slug, role: profiles.role })
        .from(profiles)
        .where(inArray(profiles.status, ["active", "verified"])),
      db
        .select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt, updatedAt: blogPosts.updatedAt })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.publishedAt)),
    ]);

    for (const profile of activeProfiles) {
      const section = profile.role === "studio" ? "studios" : "artists";
      sitemapEntries.push({
        url: `${baseUrl}/${section}/${profile.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const post of publishedPosts) {
      sitemapEntries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // DB may be unavailable during build; static public routes still ship.
  }

  return sitemapEntries;
}
