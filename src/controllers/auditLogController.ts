import { Request, Response, NextFunction } from "express";
import { AuditLog } from "../models/AuditLog";
import { User } from "../models/User";

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { entity_type, action, user_id, limit: limitParam } = req.query;

    const where: any = {};
    if (entity_type) where.entity_type = entity_type;
    if (action) where.action = action;
    if (user_id) where.user_id = Number(user_id);

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(limitParam) || 50, 200)
    });

    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
}

export async function getEntityAuditTrail(req: Request, res: Response, next: NextFunction) {
  try {
    const { entity_type, entity_id } = req.params;

    const logs = await AuditLog.findAll({
      where: { entity_type, entity_id: Number(entity_id) },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
}

// Middleware to auto-log actions
export function auditMiddleware(action: string, entityType: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userId = (req as any).userId || null;

    // Store audit info on request for the controller to use after operation
    (req as any).auditInfo = { action, entityType, userId, ip: req.ip };
    next();
  };
}

// Helper to create audit log entry (called from controllers)
export async function createAuditEntry(
  userId: number | null,
  action: string,
  entityType: string,
  entityId: number | null,
  details: string | null,
  ipAddress: string | null
): Promise<void> {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress
    });
  } catch {
    // Silently fail — audit logging should never break the main flow
  }
}
