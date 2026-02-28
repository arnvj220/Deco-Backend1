import { Router } from "express"




const router = Router()

router.get("/me", async (req, res) => {
    console.log("ho gaya");
    return res.status(200).json({
        message: "Backend connected successfully",
        user: req.user
    });
});
export default router