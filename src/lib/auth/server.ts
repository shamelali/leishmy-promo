import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "./auth";

export { auth, authConfig as neauthConfig, getAuth, handler } from "./auth";

export async function getAuthSession(): Promise<{ id: string; email: string; role: string; isAdmin: boolean; studioRole: string } | null> {
  const session = await getSession();
  if (!session?.user) return null;
  const [userRows, profileRows] = await Promise.all([
    db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1),
    db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1),
  ]);
  const dbUser = userRows[0];
  const dbProfile = profileRows[0];
  if (!dbUser) return null;

  const email = session.user.email ?? dbUser.email;
  if (session.user.email && session.user.email !== dbUser.email) {
    db.update(users).set({ email: session.user.email }).where(eq(users.id, dbUser.id)).catch(() => {});
  }

  // Use profile role if available (for studio/artist specific roles), otherwise fall back to user role
  const profileRole = dbProfile?.role || "customer";
  const effectiveRole = profileRole !== "customer" ? profileRole : (dbUser.role ?? "customer");

  return {
    id: dbUser.id,
    email,
    role: effectiveRole,
    isAdmin: dbUser.isAdmin ?? false,
    studioRole: profileRole, // Store the specific studio/artist role
  };
}
