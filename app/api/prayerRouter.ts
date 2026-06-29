import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findActivePrayers,
  findAnsweredPrayers,
  findPrayerById,
  createPrayer,
  addPrayerResponse,
  hasUserPrayed,
  markPrayerAnswered,
  getPrayerStats,
} from "./queries/prayers";

export const prayerRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().min(1).max(50).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional()
    )
    .query(({ input }) =>
      findActivePrayers({
        category: input?.category,
        limit: input?.limit,
        offset: input?.offset,
      })
    ),

  listAnswered: publicQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional()
    )
    .query(({ input }) =>
      findAnsweredPrayers({
        limit: input?.limit,
        offset: input?.offset,
      })
    ),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findPrayerById(input.id)),

  create: authedQuery
    .input(
      z.object({
        content: z.string().min(5),
        category: z.enum(["healing", "finance", "family", "career", "deliverance", "general"]),
        urgency: z.enum(["low", "medium", "high"]).default("low"),
        isAnonymous: z.boolean().default(true),
      })
    )
    .mutation(({ ctx, input }) =>
      createPrayer({
        ...input,
        userId: ctx.user.id,
      })
    ),

  prayFor: authedQuery
    .input(z.object({ prayerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const alreadyPrayed = await hasUserPrayed(input.prayerId, ctx.user.id);
      if (alreadyPrayed) {
        return { success: false, message: "You already prayed for this" };
      }
      await addPrayerResponse(input.prayerId, ctx.user.id);
      return { success: true, message: "Prayer added" };
    }),

  checkPrayed: authedQuery
    .input(z.object({ prayerId: z.number() }))
    .query(({ ctx, input }) => hasUserPrayed(input.prayerId, ctx.user.id)),

  markAnswered: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => markPrayerAnswered(input.id)),

  stats: publicQuery.query(() => getPrayerStats()),
});
