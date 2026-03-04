import { z } from "zod"

export const submitResponseSchema = z.object({
  
    questionId: z.number(),
    submittedAnswer: z.string().min(1)
  
})

export const roundIdParamSchema = z.object({
  
    roundId: z.string().regex(/^\d+$/)
  
})