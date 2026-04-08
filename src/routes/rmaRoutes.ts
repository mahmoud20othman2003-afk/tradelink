import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listRmas, createRma, updateRmaStatus } from "../controllers/rmaController";

const router = Router();

router.get("/", requireAuth, listRmas);
router.post("/", requireAuth, createRma);
router.patch("/:id/status", requireAuth, updateRmaStatus);

export default router;
