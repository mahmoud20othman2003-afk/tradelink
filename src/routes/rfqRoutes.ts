import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listRfqs, createRfq, submitQuote, getRfqQuotes, acceptQuote } from "../controllers/rfqController";

const router = Router();

router.get("/", requireAuth, listRfqs);
router.post("/", requireAuth, createRfq);
router.get("/:rfqId/quotes", requireAuth, getRfqQuotes);
router.post("/:rfqId/quotes", requireAuth, submitQuote);
router.patch("/quotes/:quoteId/accept", requireAuth, acceptQuote);

export default router;
