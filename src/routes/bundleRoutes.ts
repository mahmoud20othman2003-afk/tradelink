import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listBundles, createBundle, getBundle } from "../controllers/bundleController";

const router = Router();

router.get("/", listBundles);
router.post("/", requireAuth, createBundle);
router.get("/:id", getBundle);

export default router;
