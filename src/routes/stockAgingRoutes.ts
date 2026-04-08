import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getSlowMovingProducts } from "../controllers/stockAgingController";

const router = Router();

router.get("/slow-moving", requireAuth, getSlowMovingProducts);

export default router;
