import { authRouter } from "./auth-router";
import { testimonyRouter } from "./testimonyRouter";
import { prayerRouter } from "./prayerRouter";
import { commentRouter } from "./commentRouter";
import { circleRouter } from "./circleRouter";
import { scheduleRouter } from "./scheduleRouter";
import { forumRouter } from "./forumRouter";
import { adminRouter } from "./adminRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  testimony: testimonyRouter,
  prayer: prayerRouter,
  comment: commentRouter,
  circle: circleRouter,
  schedule: scheduleRouter,
  forum: forumRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
