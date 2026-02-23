import { Router } from "express"


import { validate } from "../middleware/validate.middleware.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { prisma } from "../lib/prisma.js"


const router = Router()

router.get("/me", authMiddleware, async (req, res) => {
    const { id: supabaseId, email, user_metadata } = req.user;
    
    let user = await prisma.user.findUnique({
        where: { supabaseId },
    });

    const name = user_metadata.name;
    const avatar_url = user_metadata.avatar_url;

    if (!user) {
        user = await prisma.user.create({
            data: {  name, email, supabaseId, role: "ORGANIZER", avatar_url },
        });
    }

    res.status(200).json({
        message: "HEHE Ho gaya!"
    });
})

export default router