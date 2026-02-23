import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { validate } from "../middleware/validate.middleware.js"

import {
  submitResponse,
  getMyResponses
} from "../controllers/response.controller.js"

import {
  submitResponseSchema,
  roundIdParamSchema
} from "../schemas/response.schema.js"

const router = Router()

router.post(
  "/",
  authMiddleware,
  validate(submitResponseSchema),
  submitResponse
)

router.get(
  "/:roundId/me",
  authMiddleware,
  validate(roundIdParamSchema),
  getMyResponses
)

export default router