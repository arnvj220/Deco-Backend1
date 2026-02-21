import { z } from "zod"

export const leaderboardSchema = z.object({
  params: z.object({
    roundId: z.coerce.number().int().positive()
  })
})