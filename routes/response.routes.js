import { Router } from "express"

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
  
  validate(submitResponseSchema, "body"),
  submitResponse
)

router.get(
  "/:roundId/me",
  
  validate(roundIdParamSchema, "params"),
  getMyResponses
)

export default router