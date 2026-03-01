import { Router } from "express"

import { validate } from "../middleware/validate.middleware.js"

import {
  createQuestion,
  getQuestionsByRound,
  updateQuestion,
  deleteQuestion
} from "../controllers/question.controller.js"

import {
  createQuestionSchema,
  updateQuestionSchema,
  questionIdParamSchema,
  roundIdParamSchema
} from "../schemas/question.schema.js"
import { requireOrganizer } from "../middleware/auth.middleware.js"

const router = Router()

router.post(
  "/",
  requireOrganizer,
  validate(createQuestionSchema),
  createQuestion
)

router.get(
  "/round/:roundId",
  validate(roundIdParamSchema),
  getQuestionsByRound
)

router.patch(
  "/:id",
  requireOrganizer,
  validate(updateQuestionSchema),
  updateQuestion
)

router.delete(
  "/:id",
  requireOrganizer,
  validate(questionIdParamSchema),
  deleteQuestion
)

export default router