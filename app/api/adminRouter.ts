import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import {
  getAdminStats,
  findAllUsers,
  updateUserRole,
} from "./queries/admin";

export const adminRouter = createRouter({
  stats: adminQuery.query(() => getAdminStats()),

  users: adminQuery.query(() => findAllUsers()),

  updateRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(({ input }) => updateUserRole(input.id, input.role)),
});
