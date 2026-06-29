import { relations } from "drizzle-orm";
import {
  users,
  testimonies,
  prayers,
  comments,
  prayerCircles,
  circleMembers,
  scheduledPrayers,
  forumTopics,
  forumReplies,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  testimonies: many(testimonies),
  prayers: many(prayers),
  comments: many(comments),
  circlesOwned: many(prayerCircles, { relationName: "circleOwner" }),
  circleMemberships: many(circleMembers),
  forumTopics: many(forumTopics),
  forumReplies: many(forumReplies),
}));

export const testimoniesRelations = relations(testimonies, ({ one, many }) => ({
  author: one(users, {
    fields: [testimonies.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const prayersRelations = relations(prayers, ({ one, many }) => ({
  author: one(users, {
    fields: [prayers.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const prayerCirclesRelations = relations(prayerCircles, ({ one, many }) => ({
  owner: one(users, {
    fields: [prayerCircles.createdBy],
    references: [users.id],
    relationName: "circleOwner",
  }),
  members: many(circleMembers),
}));

export const circleMembersRelations = relations(circleMembers, ({ one }) => ({
  circle: one(prayerCircles, {
    fields: [circleMembers.circleId],
    references: [prayerCircles.id],
  }),
  user: one(users, {
    fields: [circleMembers.userId],
    references: [users.id],
  }),
}));

export const scheduledPrayersRelations = relations(scheduledPrayers, ({ one }) => ({
  host: one(users, {
    fields: [scheduledPrayers.hostId],
    references: [users.id],
  }),
}));

export const forumTopicsRelations = relations(forumTopics, ({ one, many }) => ({
  author: one(users, {
    fields: [forumTopics.userId],
    references: [users.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  topic: one(forumTopics, {
    fields: [forumReplies.topicId],
    references: [forumTopics.id],
  }),
  author: one(users, {
    fields: [forumReplies.userId],
    references: [users.id],
  }),
}));
