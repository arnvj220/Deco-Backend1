import { z } from "zod"

export const submitAnswerSchema = z.object({
  body: z.object({
    questionId: z.number().int().positive(),
    answer: z.string().min(1).max(500)
  })
})