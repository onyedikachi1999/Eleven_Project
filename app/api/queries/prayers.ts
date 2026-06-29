import { getDb } from "./connection";
import { prayers, prayerResponses, users } from "@db/schema";
import { eq, desc, and, count } from "drizzle-orm";

export async function findActivePrayers(options: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const { category, limit = 20, offset = 0 } = options;

  const conditions = [eq(prayers.status, "active")];
  if (category) conditions.push(eq(prayers.category, category as any));

  return db
    .select({
      id: prayers.id,
      content: prayers.content,
      category: prayers.category,
      urgency: prayers.urgency,
      isAnonymous: prayers.isAnonymous,
      status: prayers.status,
      prayerCount: prayers.prayerCount,
      createdAt: prayers.createdAt,
      userId: prayers.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(prayers)
    .leftJoin(users, eq(prayers.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(prayers.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function findAnsweredPrayers(options: {
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const { limit = 20, offset = 0 } = options;

  return db
    .select({
      id: prayers.id,
      content: prayers.content,
      category: prayers.category,
      urgency: prayers.urgency,
      isAnonymous: prayers.isAnonymous,
      status: prayers.status,
      prayerCount: prayers.prayerCount,
      createdAt: prayers.createdAt,
      answeredAt: prayers.answeredAt,
      userId: prayers.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(prayers)
    .leftJoin(users, eq(prayers.userId, users.id))
    .where(eq(prayers.status, "answered"))
    .orderBy(desc(prayers.answeredAt))
    .limit(limit)
    .offset(offset);
}

export async function findPrayerById(id: number) {
  const db = getDb();
  const [result] = await db
    .select({
      id: prayers.id,
      content: prayers.content,
      category: prayers.category,
      urgency: prayers.urgency,
      isAnonymous: prayers.isAnonymous,
      status: prayers.status,
      prayerCount: prayers.prayerCount,
      createdAt: prayers.createdAt,
      answeredAt: prayers.answeredAt,
      userId: prayers.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(prayers)
    .leftJoin(users, eq(prayers.userId, users.id))
    .where(eq(prayers.id, id));
  return result;
}

export async function createPrayer(data: {
  userId?: number;
  content: string;
  category: string;
  urgency: string;
  isAnonymous: boolean;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(prayers)
    .values({
      ...data,
      category: data.category as any,
      urgency: data.urgency as any,
    })
    .$returningId();
  return findPrayerById(id);
}

export async function addPrayerResponse(prayerId: number, userId: number) {
  const db = getDb();
  try {
    await db.insert(prayerResponses).values({ prayerId, userId });
    const [current] = await db
      .select({ prayerCount: prayers.prayerCount })
      .from(prayers)
      .where(eq(prayers.id, prayerId));
    if (current) {
      await db
        .update(prayers)
        .set({ prayerCount: current.prayerCount + 1 })
        .where(eq(prayers.id, prayerId));
    }
    return true;
  } catch {
    return false;
  }
}

export async function hasUserPrayed(prayerId: number, userId: number) {
  const db = getDb();
  const [result] = await db
    .select()
    .from(prayerResponses)
    .where(
      and(
        eq(prayerResponses.prayerId, prayerId),
        eq(prayerResponses.userId, userId)
      )
    );
  return !!result;
}

export async function markPrayerAnswered(id: number) {
  const db = getDb();
  await db
    .update(prayers)
    .set({ status: "answered", answeredAt: new Date() })
    .where(eq(prayers.id, id));
}

export async function getPrayerStats() {
  const db = getDb();
  const [activeResult] = await db
    .select({ total: count() })
    .from(prayers)
    .where(eq(prayers.status, "active"));
  const [answeredResult] = await db
    .select({ total: count() })
    .from(prayers)
    .where(eq(prayers.status, "answered"));
  const [totalResult] = await db.select({ total: count() }).from(prayers);
  return {
    active: activeResult?.total ?? 0,
    answered: answeredResult?.total ?? 0,
    total: totalResult?.total ?? 0,
  };
}
