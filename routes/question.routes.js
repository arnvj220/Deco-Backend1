import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
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

const router = Router()

router.post(
  "/",
  authMiddleware,
  validate(createQuestionSchema),
  createQuestion
)

router.get(
  "/round/:roundId",
  authMiddleware,
  validate(roundIdParamSchema),
  getQuestionsByRound
)

router.patch(
  "/:id",
  authMiddleware,
  validate(updateQuestionSchema),
  updateQuestion
)

router.delete(
  "/:id",
  authMiddleware,
  validate(questionIdParamSchema),
  deleteQuestion
)

export default router