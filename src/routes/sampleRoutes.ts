import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listSamples, createSampleRequest, updateSampleStatus } from "../controllers/sampleRequestController";

const router = Router();

router.get("/", requireAuth, listSamples);
router.post("/", requireAuth, createSampleRequest);
router.patch("/:id/status", requireAuth, updateSampleStatus);

export default router;
