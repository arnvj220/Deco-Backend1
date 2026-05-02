// schemas/response.schema.js
import { z } from "zod"
import { objectId } from "./shared.js"

export const submitResponseSchema = z.object({
  questionId: objectId,
  submittedAnswer: z.string().min(1)
})

export const roundIdParamSchema = z.object({
  roundId: objectId
})