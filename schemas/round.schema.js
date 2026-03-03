import { z } from "zod"

/**
 * Reusable param validator
 */
export const roundIdParamSchema = z.object({
  params: z.object({
    roundId: z.coerce.number().int().positive()
  })
})

/**
 * Start Round
 */
export const startRoundSchema = roundIdParamSchema

/**
 * Finish Round
 */
export const finishRoundSchema = roundIdParamSchema

/**
 * Create Round (ADMIN)
 */
export const createRoundSchema = z.object({
  body: z.object({
    // round timing must be ISO strings that can be parsed by Date
    startedAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  }),
})