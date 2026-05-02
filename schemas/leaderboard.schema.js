// schemas/leaderboard.schema.js
import { z } from "zod"
import { objectId } from "./shared.js"

export const leaderboardSchema = z.object({
  roundId: objectId
})