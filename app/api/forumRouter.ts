import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findForumTopics,
  findTopicById,
  findTopicReplies,
  createTopic,
  createReply,
  incrementTopicView,
} from "./queries/forum";

export const forumRouter = createRouter({
  listTopics: publicQuery
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
      findForumTopics({
        category: input?.category,
        limit: input?.limit,
        offset: input?.offset,
      })
    ),

  getTopic: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const topic = await findTopicById(input.id);
      const replies = await findTopicReplies(input.id);
      return { topic, replies };
    }),

  incrementView: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => incrementTopicView(input.id)),

  createTopic: authedQuery
    .input(
      z.object({
        title: z.string().min(3).max(255),
        content: z.string().min(5),
        category: z.enum(["faith", "life", "relationships", "career", "prayer", "general"]),
      })
    )
    .mutation(({ ctx, input }) =>
      createTopic({
        ...input,
        userId: ctx.user.id,
      })
    ),

  createReply: authedQuery
    .input(
      z.object({
        topicId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(({ ctx, input }) =>
      createReply({
        ...input,
        userId: ctx.user.id,
      })
    ),
});
