import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { listConversions, convert, addConversion } from "../controllers/unitConversionController";

const router = Router();

router.get("/", listConversions);
router.post("/convert", convert);
router.post("/", requireAdmin, addConversion);

export default router;
