import { getDb } from "./connection";
import { comments, users } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function findCommentsByTarget(
  targetType: string,
  targetId: number
) {
  const db = getDb();
  return db
    .select({
      id: comments.id,
      content: comments.content,
      isAnonymous: comments.isAnonymous,
      createdAt: comments.createdAt,
      userId: comments.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.targetType, targetType as any),
        eq(comments.targetId, targetId)
      )
    )
    .orderBy(desc(comments.createdAt));
}

export async function createComment(data: {
  targetType: string;
  targetId: number;
  userId?: number;
  content: string;
  isAnonymous: boolean;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(comments)
    .values({
      targetType: data.targetType as any,
      targetId: data.targetId,
      userId: data.userId ?? null,
      content: data.content,
      isAnonymous: data.isAnonymous,
    })
    .$returningId();
  const [result] = await db
    .select({
      id: comments.id,
      content: comments.content,
      isAnonymous: comments.isAnonymous,
      createdAt: comments.createdAt,
      userId: comments.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, id));
  return result;
}
