import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

// ── Users ──────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  bio: text("bio"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Testimonies ────────────────────────────────────────
export const testimonies = mysqlTable(
  "testimonies",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: mysqlEnum("category", [
      "healing",
      "finance",
      "family",
      "career",
      "deliverance",
      "general",
    ]).notNull(),
    type: mysqlEnum("type", ["text", "video", "audio"])
      .default("text")
      .notNull(),
    mediaUrl: text("mediaUrl"),
    thumbnailUrl: text("thumbnailUrl"),
    isAnonymous: boolean("isAnonymous").default(false).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "declined"])
      .default("pending")
      .notNull(),
    prayerCount: int("prayerCount").default(0).notNull(),
    amenCount: int("amenCount").default(0).notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("testimony_status_idx").on(table.status, table.createdAt),
    categoryIdx: index("testimony_category_idx").on(table.category),
    userIdx: index("testimony_user_idx").on(table.userId),
  })
);

export type Testimony = typeof testimonies.$inferSelect;
export type InsertTestimony = typeof testimonies.$inferInsert;

// ── Prayers ────────────────────────────────────────────
export const prayers = mysqlTable(
  "prayers",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    content: text("content").notNull(),
    category: mysqlEnum("category", [
      "healing",
      "finance",
      "family",
      "career",
      "deliverance",
      "general",
    ]).notNull(),
    urgency: mysqlEnum("urgency", ["low", "medium", "high"])
      .default("low")
      .notNull(),
    isAnonymous: boolean("isAnonymous").default(true).notNull(),
    status: mysqlEnum("status", ["active", "answered"])
      .default("active")
      .notNull(),
    prayerCount: int("prayerCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    answeredAt: timestamp("answeredAt"),
  },
  (table) => ({
    statusIdx: index("prayer_status_idx").on(table.status, table.createdAt),
    categoryIdx: index("prayer_category_idx").on(table.category),
    userIdx: index("prayer_user_idx").on(table.userId),
  })
);

export type Prayer = typeof prayers.$inferSelect;
export type InsertPrayer = typeof prayers.$inferInsert;

// ── Prayer Responses ───────────────────────────────────
export const prayerResponses = mysqlTable(
  "prayerResponses",
  {
    id: serial("id").primaryKey(),
    prayerId: bigint("prayerId", { mode: "number", unsigned: true }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueResponse: index("prayer_response_unique_idx").on(
      table.prayerId,
      table.userId
    ),
  })
);

export type PrayerResponse = typeof prayerResponses.$inferSelect;

// ── Comments ───────────────────────────────────────────
export const comments = mysqlTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    targetType: mysqlEnum("targetType", ["testimony", "prayer"]).notNull(),
    targetId: bigint("targetId", { mode: "number", unsigned: true }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    content: text("content").notNull(),
    isAnonymous: boolean("isAnonymous").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    targetIdx: index("comment_target_idx").on(
      table.targetType,
      table.targetId,
      table.createdAt
    ),
  })
);

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ── Saved Items ────────────────────────────────────────
export const savedItems = mysqlTable(
  "savedItems",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    itemType: mysqlEnum("itemType", ["testimony", "prayer"]).notNull(),
    itemId: bigint("itemId", { mode: "number", unsigned: true }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userTypeIdx: index("saved_user_type_idx").on(table.userId, table.itemType),
    uniqueSaved: index("saved_unique_idx").on(
      table.userId,
      table.itemType,
      table.itemId
    ),
  })
);

export type SavedItem = typeof savedItems.$inferSelect;

// ── Prayer Circles ─────────────────────────────────────
export const prayerCircles = mysqlTable("prayerCircles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "healing",
    "finance",
    "family",
    "career",
    "deliverance",
    "general",
  ]).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).notNull(),
  memberCount: int("memberCount").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PrayerCircle = typeof prayerCircles.$inferSelect;
export type InsertPrayerCircle = typeof prayerCircles.$inferInsert;

// ── Circle Members ─────────────────────────────────────
export const circleMembers = mysqlTable(
  "circleMembers",
  {
    id: serial("id").primaryKey(),
    circleId: bigint("circleId", { mode: "number", unsigned: true }).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    role: mysqlEnum("role", ["member", "moderator"])
      .default("member")
      .notNull(),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueMember: index("circle_member_unique_idx").on(
      table.circleId,
      table.userId
    ),
  })
);

export type CircleMember = typeof circleMembers.$inferSelect;

// ── Scheduled Prayers ──────────────────────────────────
export const scheduledPrayers = mysqlTable("scheduledPrayers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  hostId: bigint("hostId", { mode: "number", unsigned: true }).notNull(),
  circleId: bigint("circleId", { mode: "number", unsigned: true }),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").default(60).notNull(),
  isLive: boolean("isLive").default(false).notNull(),
  participantCount: int("participantCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduledPrayer = typeof scheduledPrayers.$inferSelect;
export type InsertScheduledPrayer = typeof scheduledPrayers.$inferInsert;

// ── Forum Topics ───────────────────────────────────────
export const forumTopics = mysqlTable(
  "forumTopics",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    category: mysqlEnum("category", [
      "faith",
      "life",
      "relationships",
      "career",
      "prayer",
      "general",
    ]).notNull(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    replyCount: int("replyCount").default(0).notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    isPinned: boolean("isPinned").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    categoryIdx: index("forum_category_idx").on(table.category, table.createdAt),
    pinnedIdx: index("forum_pinned_idx").on(table.isPinned, table.createdAt),
  })
);

export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = typeof forumTopics.$inferInsert;

// ── Forum Replies ──────────────────────────────────────
export const forumReplies = mysqlTable("forumReplies", {
  id: serial("id").primaryKey(),
  topicId: bigint("topicId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;
