import { Router } from "express";
import { getDashboardStats, banUser, unbanUser, getBannedUsers } from "../controllers/adminDashboardController";
import { listAuditLogs, getEntityAuditTrail } from "../controllers/auditLogController";
import { requireAdmin } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.get("/dashboard", requireAdmin, getDashboardStats);
adminRouter.get("/banned-users", requireAdmin, getBannedUsers);
adminRouter.post("/users/:id/ban", requireAdmin, banUser);
adminRouter.post("/users/:id/unban", requireAdmin, unbanUser);
adminRouter.get("/audit-logs", requireAdmin, listAuditLogs);
adminRouter.get("/audit-logs/:entity_type/:entity_id", requireAdmin, getEntityAuditTrail);
