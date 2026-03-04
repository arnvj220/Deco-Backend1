import { z } from "zod"

export const leaderboardSchema = z.object({
  
    roundId: z.coerce.number().int().positive()
  
})