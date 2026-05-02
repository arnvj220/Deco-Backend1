import { Router } from "express"
import { addAllowedUser, truncateTables } from "../controllers/admin.controller.js"

const router = Router()

router.post("/truncate", truncateTables)
router.post("/allowed", addAllowedUser)

export default router