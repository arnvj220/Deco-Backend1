// schemas/round.schema.js
import { z } from "zod"
import { objectId } from "./shared.js"

export const roundIdParamSchema = z.object({
  roundId: objectId
})

export const startRoundSchema = roundIdParamSchema
export const finishRoundSchema = roundIdParamSchema

export const createRoundSchema = z.object({
  startedAt: z.coerce.date(),
  endsAt: z.coerce.date()
})