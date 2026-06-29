import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findCommentsByTarget, createComment } from "./queries/comments";

export const commentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        targetType: z.enum(["testimony", "prayer"]),
        targetId: z.number(),
      })
    )
    .query(({ input }) =>
      findCommentsByTarget(input.targetType, input.targetId)
    ),

  create: authedQuery
    .input(
      z.object({
        targetType: z.enum(["testimony", "prayer"]),
        targetId: z.number(),
        content: z.string().min(1),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(({ ctx, input }) =>
      createComment({
        ...input,
        userId: ctx.user.id,
      })
    ),
});
