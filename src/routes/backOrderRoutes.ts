import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listBackOrders, createBackOrder, updateBackOrderStatus } from "../controllers/backOrderController";

const router = Router();

router.get("/", requireAuth, listBackOrders);
router.post("/", requireAuth, createBackOrder);
router.patch("/:id/status", requireAuth, updateBackOrderStatus);

export default router;
