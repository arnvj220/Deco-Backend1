import { z } from "zod"

export const submitResponseSchema = z.object({
  body: z.object({
    questionId: z.number(),
    submittedAnswer: z.string().min(1)
  })
})

export const roundIdParamSchema = z.object({
  params: z.object({
    roundId: z.string().regex(/^\d+$/)
  })
})