import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getVacationStatus, toggleVacation } from "../controllers/vacationModeController";

const router = Router();

router.get("/:supplierId", getVacationStatus);
router.post("/toggle", requireAuth, toggleVacation);

export default router;
