import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findPublicCircles,
  findCircleById,
  createCircle,
  joinCircle,
  leaveCircle,
  isCircleMember,
} from "./queries/circles";

export const circleRouter = createRouter({
  list: publicQuery.query(() => findPublicCircles()),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findCircleById(input.id)),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(2).max(255),
        description: z.string().optional(),
        category: z.enum(["healing", "finance", "family", "career", "deliverance", "general"]),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(({ ctx, input }) =>
      createCircle({
        ...input,
        createdBy: ctx.user.id,
      })
    ),

  join: authedQuery
    .input(z.object({ circleId: z.number() }))
    .mutation(({ ctx, input }) => joinCircle(input.circleId, ctx.user.id)),

  leave: authedQuery
    .input(z.object({ circleId: z.number() }))
    .mutation(({ ctx, input }) => leaveCircle(input.circleId, ctx.user.id)),

  checkMembership: authedQuery
    .input(z.object({ circleId: z.number() }))
    .query(({ ctx, input }) => isCircleMember(input.circleId, ctx.user.id)),
});
