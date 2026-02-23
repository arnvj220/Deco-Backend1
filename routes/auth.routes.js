import { Router } from "express"


import { validate } from "../middleware/validate.middleware.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { prisma } from "../lib/prisma.js"


const router = Router()

router.get("/me", authMiddleware, async (req, res) => {
    const { id, email } = req.user;
    let user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        user = await prisma.user.create({
            data: { id, email },
        });
    }

    res.json(user);
})

export default router