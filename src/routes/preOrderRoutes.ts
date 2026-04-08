import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listPreOrders, createPreOrder, updatePreOrderStatus } from "../controllers/preOrderController";

const router = Router();

router.get("/", requireAuth, listPreOrders);
router.post("/", requireAuth, createPreOrder);
router.patch("/:id/status", requireAuth, updatePreOrderStatus);

export default router;
