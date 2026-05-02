import { Router } from "express"
import { truncateTables } from "../controllers/admin.controller.js"

const router = Router()

router.post("/truncate", truncateTables)

export default router