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
    timeLimit: z
      .number()
      .int()
      .positive()
      .max(86400)
      .optional()
  })
})