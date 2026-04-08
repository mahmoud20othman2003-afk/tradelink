import { Router } from "express";
import { createDispute, listDisputes, getDispute, resolveDispute } from "../controllers/disputeController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const disputeRouter = Router();

disputeRouter.get("/", requireAuth, listDisputes);
disputeRouter.post("/", requireAuth, createDispute);
disputeRouter.get("/:id", requireAuth, getDispute);
disputeRouter.patch("/:id/resolve", requireAdmin, resolveDispute);
