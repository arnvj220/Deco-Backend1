import { Router } from "express"
// import { authMiddleware } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { submitAnswer } from "../controllers/response.controller"
import { submitAnswerSchema } from "../schemas/response.schema"

const router = Router()

router.post(
  "/submit",
  authMiddleware,
  validate(submitAnswerSchema),
  submitAnswer
)

export default router