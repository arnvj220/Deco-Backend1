import { Router } from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { validate } from "../middleware/validate.middleware.js"
// import { submitAnswer } from "../controllers/response.controller.js"
import { submitAnswerSchema } from "../schemas/response.schema.js"

const router = Router()

// router.post(
//   "/submit",
//   authMiddleware,
//   validate(submitAnswerSchema),
//   // submitAnswer
// )

export default router