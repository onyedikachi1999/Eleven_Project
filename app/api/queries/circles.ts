import { getDb } from "./connection";
import { prayerCircles, circleMembers, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function findPublicCircles() {
  const db = getDb();
  return db
    .select({
      id: prayerCircles.id,
      name: prayerCircles.name,
      description: prayerCircles.description,
      category: prayerCircles.category,
      isPublic: prayerCircles.isPublic,
      memberCount: prayerCircles.memberCount,
      createdAt: prayerCircles.createdAt,
      createdBy: prayerCircles.createdBy,
      ownerName: users.name,
    })
    .from(prayerCircles)
    .leftJoin(users, eq(prayerCircles.createdBy, users.id))
    .where(eq(prayerCircles.isPublic, true))
    .orderBy(desc(prayerCircles.memberCount));
}

export async function findCircleById(id: number) {
  const db = getDb();
  const [result] = await db
    .select({
      id: prayerCircles.id,
      name: prayerCircles.name,
      description: prayerCircles.description,
      category: prayerCircles.category,
      isPublic: prayerCircles.isPublic,
      memberCount: prayerCircles.memberCount,
      createdAt: prayerCircles.createdAt,
      createdBy: prayerCircles.createdBy,
      ownerName: users.name,
    })
    .from(prayerCircles)
    .leftJoin(users, eq(prayerCircles.createdBy, users.id))
    .where(eq(prayerCircles.id, id));
  return result;
}

export async function createCircle(data: {
  name: string;
  description?: string;
  category: string;
  isPublic: boolean;
  createdBy: number;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(prayerCircles)
    .values({
      name: data.name,
      description: data.description,
      category: data.category as any,
      isPublic: data.isPublic,
      createdBy: data.createdBy,
    })
    .$returningId();

  // Auto-add creator as moderator
  await db.insert(circleMembers).values({
    circleId: id,
    userId: data.createdBy,
    role: "moderator",
  });

  return findCircleById(id);
}

export async function joinCircle(circleId: number, userId: number) {
  const db = getDb();
  try {
    await db.insert(circleMembers).values({
      circleId,
      userId,
      role: "member",
    });
    // Update member count
    const [circle] = await db
      .select({ memberCount: prayerCircles.memberCount })
      .from(prayerCircles)
      .where(eq(prayerCircles.id, circleId));
    if (circle) {
      await db
        .update(prayerCircles)
        .set({ memberCount: circle.memberCount + 1 })
        .where(eq(prayerCircles.id, circleId));
    }
    return true;
  } catch {
    return false;
  }
}

export async function leaveCircle(circleId: number, userId: number) {
  const db = getDb();
  await db
    .delete(circleMembers)
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId)
      )
    );
  const [circle] = await db
    .select({ memberCount: prayerCircles.memberCount })
    .from(prayerCircles)
    .where(eq(prayerCircles.id, circleId));
  if (circle && circle.memberCount > 1) {
    await db
      .update(prayerCircles)
      .set({ memberCount: circle.memberCount - 1 })
      .where(eq(prayerCircles.id, circleId));
  }
}

export async function isCircleMember(circleId: number, userId: number) {
  const db = getDb();
  const [result] = await db
    .select()
    .from(circleMembers)
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId)
      )
    );
  return !!result;
}
