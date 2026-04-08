import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { listBadges, getUserBadges, awardBadge, createBadge } from "../controllers/badgeController";

const router = Router();

router.get("/", listBadges);
router.get("/user/:userId", getUserBadges);
router.post("/award", requireAdmin, awardBadge);
router.post("/", requireAdmin, createBadge);

export default router;
