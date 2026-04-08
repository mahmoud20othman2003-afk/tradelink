import { Router } from "express";
import { createFlashSale, getActiveFlashSales, listFlashSales, updateFlashSaleStatus } from "../controllers/flashSaleController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const flashSaleRouter = Router();

flashSaleRouter.get("/active", getActiveFlashSales);
flashSaleRouter.get("/", requireAuth, listFlashSales);
flashSaleRouter.post("/", requireAuth, createFlashSale);
flashSaleRouter.patch("/:id/status", requireAdmin, updateFlashSaleStatus);
