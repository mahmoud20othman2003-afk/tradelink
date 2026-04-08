import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { listTaxConfigs, createOrUpdateTax, calculateTax } from "../controllers/taxController";

const router = Router();

router.get("/", requireAuth, listTaxConfigs);
router.post("/", requireAdmin, createOrUpdateTax);
router.post("/calculate", calculateTax);

export default router;
