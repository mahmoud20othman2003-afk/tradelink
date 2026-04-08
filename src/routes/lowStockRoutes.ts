import { Router } from "express";
import { getLowStockAlerts } from "../controllers/lowStockController";
import { requireAuth } from "../middleware/auth";

export const lowStockRouter = Router();

lowStockRouter.get("/", requireAuth, getLowStockAlerts);
