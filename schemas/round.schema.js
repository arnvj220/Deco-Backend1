// schemas/round.schema.js
import { z } from "zod"
import { roundIdentifier } from "./shared.js"

export const roundIdParamSchema = z.object({
  roundId: roundIdentifier
})

export const roundStatusParamSchema = z.object({
  id: roundIdentifier
})

export const startRoundSchema = roundIdParamSchema
export const finishRoundSchema = roundIdParamSchema

export const createRoundSchema = z.object({
  startedAt: z.coerce.date(),
  endsAt: z.coerce.date()
})