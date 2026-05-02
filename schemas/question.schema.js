// schemas/question.schema.js
import { z } from "zod"
import { objectId, roundIdentifier } from "./shared.js"

export const createQuestionSchema = z.object({
  roundId: roundIdentifier,
  text: z.string().min(1),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1),
  link: z.string().optional().nullable(),
  reward: z.coerce.number().min(0)
})

export const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  link: z.string().optional().nullable(),
  reward: z.coerce.number().min(0).optional()
})

export const questionIdParamSchema = z.object({
  id: objectId
})

export const roundIdParamSchema = z.object({
  roundId: roundIdentifier
})