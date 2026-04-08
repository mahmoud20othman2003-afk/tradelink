import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { listPlans, createPlan, getPlan } from "../controllers/subscriptionPlanController";

const router = Router();

router.get("/", listPlans);
router.post("/", requireAdmin, createPlan);
router.get("/:id", getPlan);

export default router;
