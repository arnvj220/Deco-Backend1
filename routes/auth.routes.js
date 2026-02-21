import { Router } from "express"


import { validate } from "../middleware/validate.middleware.js"
import { authMiddleware } from "../middleware/auth.middleware.js"


const router = Router()

router.get("/me", authMiddleware, (req, res) => {
    res.json({
        message: "Backend Working",
        user: req.user
    })
})

export default router