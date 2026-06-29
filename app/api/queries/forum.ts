import { getDb } from "./connection";
import { forumTopics, forumReplies, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function findForumTopics(options: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const { category, limit = 20, offset = 0 } = options;

  const conditions = [];
  if (category) conditions.push(eq(forumTopics.category, category as any));

  return db
    .select({
      id: forumTopics.id,
      title: forumTopics.title,
      content: forumTopics.content,
      category: forumTopics.category,
      replyCount: forumTopics.replyCount,
      viewCount: forumTopics.viewCount,
      isPinned: forumTopics.isPinned,
      createdAt: forumTopics.createdAt,
      updatedAt: forumTopics.updatedAt,
      userId: forumTopics.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(forumTopics)
    .leftJoin(users, eq(forumTopics.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(forumTopics.isPinned), desc(forumTopics.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function findTopicById(id: number) {
  const db = getDb();
  const [topic] = await db
    .select({
      id: forumTopics.id,
      title: forumTopics.title,
      content: forumTopics.content,
      category: forumTopics.category,
      replyCount: forumTopics.replyCount,
      viewCount: forumTopics.viewCount,
      isPinned: forumTopics.isPinned,
      createdAt: forumTopics.createdAt,
      updatedAt: forumTopics.updatedAt,
      userId: forumTopics.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(forumTopics)
    .leftJoin(users, eq(forumTopics.userId, users.id))
    .where(eq(forumTopics.id, id));
  return topic;
}

export async function findTopicReplies(topicId: number) {
  const db = getDb();
  return db
    .select({
      id: forumReplies.id,
      content: forumReplies.content,
      createdAt: forumReplies.createdAt,
      userId: forumReplies.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(forumReplies)
    .leftJoin(users, eq(forumReplies.userId, users.id))
    .where(eq(forumReplies.topicId, topicId))
    .orderBy(forumReplies.createdAt);
}

export async function createTopic(data: {
  title: string;
  content: string;
  category: string;
  userId: number;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(forumTopics)
    .values({
      title: data.title,
      content: data.content,
      category: data.category as any,
      userId: data.userId,
    })
    .$returningId();
  return findTopicById(id);
}

export async function createReply(data: {
  topicId: number;
  userId: number;
  content: string;
}) {
  const db = getDb();
  await db.insert(forumReplies).values(data);

  // Update reply count
  const [topic] = await db
    .select({ replyCount: forumTopics.replyCount })
    .from(forumTopics)
    .where(eq(forumTopics.id, data.topicId));
  if (topic) {
    await db
      .update(forumTopics)
      .set({ replyCount: topic.replyCount + 1 })
      .where(eq(forumTopics.id, data.topicId));
  }

  return findTopicReplies(data.topicId);
}

export async function incrementTopicView(id: number) {
  const db = getDb();
  const [current] = await db
    .select({ viewCount: forumTopics.viewCount })
    .from(forumTopics)
    .where(eq(forumTopics.id, id));
  if (current) {
    await db
      .update(forumTopics)
      .set({ viewCount: current.viewCount + 1 })
      .where(eq(forumTopics.id, id));
  }
}
