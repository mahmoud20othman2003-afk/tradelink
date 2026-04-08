import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listLots, createLot, getLotByQr, getExpiringLots } from "../controllers/lotTrackingController";

const router = Router();

router.get("/", requireAuth, listLots);
router.post("/", requireAuth, createLot);
router.get("/expiring", requireAuth, getExpiringLots);
router.get("/qr/:qrCode", getLotByQr);

export default router;
