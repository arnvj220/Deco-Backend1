import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"

import { validate } from "../middleware/validate.middleware.js"



import {
  getActiveRound,
  startRound,
  finishRound,
  createRound,
  activateRound,
  closeRound,
  getAllRoundsAdmin
} from "../controllers/round.controller.js"

import {
  startRoundSchema,
  finishRoundSchema,
  createRoundSchema,
  roundIdParamSchema
} from "../schemas/round.schema.js"

const router = Router()

// Get active round
router.get(
  "/active",
  authMiddleware,
  getActiveRound
)

// Start round
router.post(
  "/:roundId/start",
  authMiddleware,
  validate(startRoundSchema),
  startRound
)

// Finish round
router.post(
  "/:roundId/finish",
  authMiddleware,
  validate(finishRoundSchema),
  finishRound
)

// Create new round (ADMIN)
router.post(
  "/",
  authMiddleware,
  // adminOnly,
  validate(createRoundSchema),
  createRound
)

// Activate round (ADMIN)
router.patch(
  "/:roundId/activate",
  authMiddleware,
  // adminOnly,
  validate(roundIdParamSchema),
  activateRound
)

// Close round (ADMIN)
router.patch(
  "/:roundId/close",
  authMiddleware,
  // adminOnly,
  validate(roundIdParamSchema),
  closeRound
)

// Get all rounds (ADMIN)
router.get(
  "/admin/all",
  authMiddleware,
  // adminOnly,
  getAllRoundsAdmin
)
export default router