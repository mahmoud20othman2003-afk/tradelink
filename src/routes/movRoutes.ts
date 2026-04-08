import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMov, setMov, validateOrderValue } from "../controllers/movController";

const router = Router();

router.get("/:supplierId", getMov);
router.put("/", requireAuth, setMov);
router.post("/validate", validateOrderValue);

export default router;
