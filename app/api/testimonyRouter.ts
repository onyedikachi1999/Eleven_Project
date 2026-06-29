import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  findApprovedTestimonies,
  findTestimonyById,
  createTestimony,
  incrementAmenCount,
  incrementTestimonyView,
  findPendingTestimonies,
  approveTestimony,
  declineTestimony,
  getTestimonyStats,
} from "./queries/testimonies";

export const testimonyRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          type: z.string().optional(),
          sort: z.enum(["recent", "popular", "mostPrayed"]).optional(),
          limit: z.number().min(1).max(50).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional()
    )
    .query(({ input }) =>
      findApprovedTestimonies({
        category: input?.category,
        type: input?.type,
        sort: input?.sort,
        limit: input?.limit,
        offset: input?.offset,
      })
    ),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findTestimonyById(input.id)),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(3).max(255),
        content: z.string().min(10),
        category: z.enum(["healing", "finance", "family", "career", "deliverance", "general"]),
        type: z.enum(["text", "video", "audio"]).default("text"),
        mediaUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(({ ctx, input }) =>
      createTestimony({
        ...input,
        userId: ctx.user.id,
      })
    ),

  amen: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => incrementAmenCount(input.id)),

  incrementView: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => incrementTestimonyView(input.id)),

  // Admin
  pending: adminQuery.query(() => findPendingTestimonies()),

  approve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => approveTestimony(input.id)),

  decline: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => declineTestimony(input.id)),

  stats: publicQuery.query(() => getTestimonyStats()),
});
