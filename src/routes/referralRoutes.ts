import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMyReferralCode, applyReferral } from "../controllers/referralController";

const router = Router();

router.get("/my-code", requireAuth, getMyReferralCode);
router.post("/apply", requireAuth, applyReferral);

export default router;
