import { z } from "zod"

export const createQuestionSchema = z.object({
  
    roundId: z.coerce.number(),
    options: z.array(z.string()).optional(),
    text: z.string().min(1),
    answer: z.string().min(1),
    link: z.string().url().optional(),
    reward: z.number().int().min(0)
  
})

export const updateQuestionSchema = z.object({
  
    options: z.array(z.string()).optional(),
    answer: z.string().optional(),
    link: z.string().url().optional(),
    text: z.string().min(1),
    reward: z.number().int().min(0).optional()
  
})

export const questionIdParamSchema = z.object({
    id: z.coerce.number()
})

export const roundIdParamSchema = z.object({
  roundId: z.coerce.number()
});