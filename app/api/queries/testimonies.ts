import { getDb } from "./connection";
import { testimonies, users } from "@db/schema";
import { eq, desc, and, count } from "drizzle-orm";

export async function findApprovedTestimonies(options: {
  category?: string;
  type?: string;
  sort?: "recent" | "popular" | "mostPrayed";
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const { category, type, sort = "recent", limit = 20, offset = 0 } = options;

  const conditions = [eq(testimonies.status, "approved")];
  if (category) conditions.push(eq(testimonies.category, category as any));
  if (type) conditions.push(eq(testimonies.type, type as any));

  const orderBy =
    sort === "popular"
      ? desc(testimonies.viewCount)
      : sort === "mostPrayed"
        ? desc(testimonies.prayerCount)
        : desc(testimonies.createdAt);

  return db
    .select({
      id: testimonies.id,
      title: testimonies.title,
      content: testimonies.content,
      category: testimonies.category,
      type: testimonies.type,
      mediaUrl: testimonies.mediaUrl,
      thumbnailUrl: testimonies.thumbnailUrl,
      isAnonymous: testimonies.isAnonymous,
      status: testimonies.status,
      prayerCount: testimonies.prayerCount,
      amenCount: testimonies.amenCount,
      viewCount: testimonies.viewCount,
      createdAt: testimonies.createdAt,
      userId: testimonies.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(testimonies)
    .leftJoin(users, eq(testimonies.userId, users.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);
}

export async function findTestimonyById(id: number) {
  const db = getDb();
  const [result] = await db
    .select({
      id: testimonies.id,
      title: testimonies.title,
      content: testimonies.content,
      category: testimonies.category,
      type: testimonies.type,
      mediaUrl: testimonies.mediaUrl,
      thumbnailUrl: testimonies.thumbnailUrl,
      isAnonymous: testimonies.isAnonymous,
      status: testimonies.status,
      prayerCount: testimonies.prayerCount,
      amenCount: testimonies.amenCount,
      viewCount: testimonies.viewCount,
      createdAt: testimonies.createdAt,
      userId: testimonies.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(testimonies)
    .leftJoin(users, eq(testimonies.userId, users.id))
    .where(eq(testimonies.id, id));
  return result;
}

export async function createTestimony(data: {
  userId?: number;
  title: string;
  content: string;
  category: string;
  type: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  isAnonymous: boolean;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(testimonies)
    .values({
      ...data,
      category: data.category as any,
      type: data.type as any,
      status: "pending",
    })
    .$returningId();
  return findTestimonyById(id);
}

export async function incrementAmenCount(id: number) {
  const db = getDb();
  const [current] = await db
    .select({ amenCount: testimonies.amenCount })
    .from(testimonies)
    .where(eq(testimonies.id, id));
  if (!current) return null;
  await db
    .update(testimonies)
    .set({ amenCount: current.amenCount + 1 })
    .where(eq(testimonies.id, id));
  return { ...current, amenCount: current.amenCount + 1 };
}

export async function incrementTestimonyView(id: number) {
  const db = getDb();
  const [current] = await db
    .select({ viewCount: testimonies.viewCount })
    .from(testimonies)
    .where(eq(testimonies.id, id));
  if (!current) return;
  await db
    .update(testimonies)
    .set({ viewCount: current.viewCount + 1 })
    .where(eq(testimonies.id, id));
}

export async function findPendingTestimonies() {
  const db = getDb();
  return db
    .select({
      id: testimonies.id,
      title: testimonies.title,
      content: testimonies.content,
      category: testimonies.category,
      type: testimonies.type,
      mediaUrl: testimonies.mediaUrl,
      isAnonymous: testimonies.isAnonymous,
      status: testimonies.status,
      createdAt: testimonies.createdAt,
      userId: testimonies.userId,
      authorName: users.name,
    })
    .from(testimonies)
    .leftJoin(users, eq(testimonies.userId, users.id))
    .where(eq(testimonies.status, "pending"))
    .orderBy(desc(testimonies.createdAt));
}

export async function approveTestimony(id: number) {
  const db = getDb();
  await db
    .update(testimonies)
    .set({ status: "approved" })
    .where(eq(testimonies.id, id));
}

export async function declineTestimony(id: number) {
  const db = getDb();
  await db
    .update(testimonies)
    .set({ status: "declined" })
    .where(eq(testimonies.id, id));
}

export async function getTestimonyStats() {
  const db = getDb();
  const [result] = await db
    .select({ total: count() })
    .from(testimonies)
    .where(eq(testimonies.status, "approved"));
  return result?.total ?? 0;
}
