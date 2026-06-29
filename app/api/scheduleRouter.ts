import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findUpcomingSchedules,
  findLiveSession,
  createSchedule,
} from "./queries/schedules";

export const scheduleRouter = createRouter({
  listUpcoming: publicQuery.query(() => findUpcomingSchedules()),

  getLive: publicQuery.query(() => findLiveSession()),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(2).max(255),
        description: z.string().optional(),
        circleId: z.number().optional(),
        scheduledAt: z.string().transform((s) => new Date(s)),
        duration: z.number().min(5).max(180).default(60),
      })
    )
    .mutation(({ ctx, input }) =>
      createSchedule({
        ...input,
        hostId: ctx.user.id,
      })
    ),
});
