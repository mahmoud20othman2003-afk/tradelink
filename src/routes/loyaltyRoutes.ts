import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getMyPoints, addPoints, redeemPoints } from "../controllers/loyaltyController";

const router = Router();

router.get("/my-points", requireAuth, getMyPoints);
router.post("/add", requireAdmin, addPoints);
router.post("/redeem", requireAuth, redeemPoints);

export default router;
