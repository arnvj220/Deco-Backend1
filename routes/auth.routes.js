import { Router } from "express"
import { requireOrganizer } from "../middleware/auth.middleware.js";




const router = Router()

router.get("/me", requireOrganizer, async (req, res) => {
    return res.status(200).json({
        message: "Backend connected successfully",
        user: req.user
    });
});
export default router