import { Router } from "express"


import { validate } from "../middleware/validate.middleware.js"



import {
  getActiveRound,
  startRound,
  finishRound,
  createRound,
  getAllRoundsAdmin
} from "../controllers/round.controller.js"

import {
  startRoundSchema,
  finishRoundSchema,
  createRoundSchema
} from "../schemas/round.schema.js"
import { requireOrganizer } from "../middleware/auth.middleware.js"

const router = Router()

// Get active round
router.get(
  "/active",
  getActiveRound
)

// Start round
router.post(
  "/:roundId/start",
  validate(startRoundSchema, "params"),
  startRound
)

// Finish round
router.post(
  "/:roundId/finish",
  validate(finishRoundSchema, "params"),
  finishRound
)

// Create new round (ADMIN)
router.post(
  "/",
  requireOrganizer,
  validate(createRoundSchema, "body"),
  createRound
)


// Get all rounds (ADMIN)
router.get(
  "/admin/all",
  requireOrganizer,
  getAllRoundsAdmin
)
export default router