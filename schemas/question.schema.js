import { z } from "zod"

export const createQuestionSchema = z.object({
  body: z.object({
    roundId: z.number(),
    options: z.array(z.string()).optional(),
    answer: z.string().min(1),
    link: z.string().url().optional(),
    reward: z.number().int().min(0)
  })
})

export const updateQuestionSchema = z.object({
  params: z.object({
    id: z.coerce.number()
  }),
  body: z.object({
    options: z.array(z.string()).optional(),
    answer: z.string().optional(),
    link: z.string().url().optional(),
    reward: z.number().int().min(0).optional()
  })
})

export const questionIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number()
  })
})

export const roundIdParamSchema = z.object({
  params: z.object({
    roundId: z.coerce.number()
  })
})