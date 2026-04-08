import { Router } from "express";
import { submitKycDocument, getMyKycDocuments, listPendingKyc, reviewKycDocument, getKycStatus } from "../controllers/kycController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const kycRouter = Router();

kycRouter.post("/", requireAuth, submitKycDocument);
kycRouter.get("/my-documents", requireAuth, getMyKycDocuments);
kycRouter.get("/pending", requireAdmin, listPendingKyc);
kycRouter.patch("/:id/review", requireAdmin, reviewKycDocument);
kycRouter.get("/status/:user_id", requireAuth, getKycStatus);
