import { Router } from "express";
import { listCommissions, getCommission, setCommission, deleteCommission } from "../controllers/commissionController";
import { requireAdmin } from "../middleware/auth";

export const commissionRouter = Router();

commissionRouter.get("/", requireAdmin, listCommissions);
commissionRouter.get("/:category_id", requireAdmin, getCommission);
commissionRouter.post("/", requireAdmin, setCommission);
commissionRouter.delete("/:category_id", requireAdmin, deleteCommission);
