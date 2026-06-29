import { getDb } from "./connection";
import { users, testimonies, prayers } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function getAdminStats() {
  const db = getDb();
  const [pendingTestimonies] = await db
    .select({ total: count() })
    .from(testimonies)
    .where(eq(testimonies.status, "pending"));
  const [totalUsers] = await db.select({ total: count() }).from(users);
  const [activePrayers] = await db
    .select({ total: count() })
    .from(prayers)
    .where(eq(prayers.status, "active"));
  const [approvedTestimonies] = await db
    .select({ total: count() })
    .from(testimonies)
    .where(eq(testimonies.status, "approved"));

  return {
    pendingTestimonies: pendingTestimonies?.total ?? 0,
    totalUsers: totalUsers?.total ?? 0,
    activePrayers: activePrayers?.total ?? 0,
    approvedTestimonies: approvedTestimonies?.total ?? 0,
  };
}

export async function findAllUsers() {
  const db = getDb();
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      role: users.role,
      createdAt: users.createdAt,
      lastSignInAt: users.lastSignInAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: string) {
  const db = getDb();
  await db
    .update(users)
    .set({ role: role as any })
    .where(eq(users.id, id));
}
