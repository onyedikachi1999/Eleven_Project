import { getDb } from "./connection";
import { scheduledPrayers, users } from "@db/schema";
import { eq, gte } from "drizzle-orm";

export async function findUpcomingSchedules() {
  const db = getDb();
  const now = new Date();
  return db
    .select({
      id: scheduledPrayers.id,
      title: scheduledPrayers.title,
      description: scheduledPrayers.description,
      scheduledAt: scheduledPrayers.scheduledAt,
      duration: scheduledPrayers.duration,
      isLive: scheduledPrayers.isLive,
      participantCount: scheduledPrayers.participantCount,
      createdAt: scheduledPrayers.createdAt,
      hostId: scheduledPrayers.hostId,
      hostName: users.name,
    })
    .from(scheduledPrayers)
    .leftJoin(users, eq(scheduledPrayers.hostId, users.id))
    .where(gte(scheduledPrayers.scheduledAt, new Date(now.getTime() - 2 * 60 * 60 * 1000)))
    .orderBy(scheduledPrayers.scheduledAt);
}

export async function findLiveSession() {
  const db = getDb();
  const [result] = await db
    .select({
      id: scheduledPrayers.id,
      title: scheduledPrayers.title,
      description: scheduledPrayers.description,
      scheduledAt: scheduledPrayers.scheduledAt,
      duration: scheduledPrayers.duration,
      isLive: scheduledPrayers.isLive,
      participantCount: scheduledPrayers.participantCount,
      hostId: scheduledPrayers.hostId,
      hostName: users.name,
    })
    .from(scheduledPrayers)
    .leftJoin(users, eq(scheduledPrayers.hostId, users.id))
    .where(eq(scheduledPrayers.isLive, true));
  return result ?? null;
}

export async function createSchedule(data: {
  title: string;
  description?: string;
  hostId: number;
  circleId?: number;
  scheduledAt: Date;
  duration?: number;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(scheduledPrayers)
    .values(data)
    .$returningId();

  const [result] = await db
    .select({
      id: scheduledPrayers.id,
      title: scheduledPrayers.title,
      description: scheduledPrayers.description,
      scheduledAt: scheduledPrayers.scheduledAt,
      duration: scheduledPrayers.duration,
      isLive: scheduledPrayers.isLive,
      participantCount: scheduledPrayers.participantCount,
      hostId: scheduledPrayers.hostId,
      hostName: users.name,
    })
    .from(scheduledPrayers)
    .leftJoin(users, eq(scheduledPrayers.hostId, users.id))
    .where(eq(scheduledPrayers.id, id));
  return result;
}
