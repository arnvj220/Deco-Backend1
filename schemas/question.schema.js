// schemas/question.schema.js
import { z } from "zod"
import { objectId } from "./shared.js"

export const createQuestionSchema = z.object({
  roundId: objectId,
  text: z.string().min(1),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1),
  link: z.string().url().optional().nullable(),
  reward: z.number().int().min(0)
})

export const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  link: z.string().url().optional().nullable(),
  reward: z.number().int().min(0).optional()
})

export const questionIdParamSchema = z.object({
  id: objectId
})

export const roundIdParamSchema = z.object({
  roundId: objectId
})