import { Request, Response, NextFunction } from "express";
import { Dispute } from "../models/Dispute";
import { User } from "../models/User";
import { Order } from "../models/Order";

export async function createDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { order_id, against_user, reason, description } = req.body;

    if (!order_id || !against_user || !reason) {
      return res.status(400).json({ success: false, error: "order_id, against_user, and reason are required" });
    }

    // Verify order exists and user is involved
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      return res.status(403).json({ success: false, error: "يجب أن تكون طرفاً في هذا الطلب لفتح خلاف" });
    }

    // Verify against_user exists
    const targetUser = await User.findByPk(against_user);
    if (!targetUser) return res.status(404).json({ success: false, error: "Target user not found" });

    // Check for existing open dispute on same order
    const existing = await Dispute.findOne({
      where: { order_id, opened_by: userId, status: "open" }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: "لديك خلاف مفتوح بالفعل لهذا الطلب" });
    }

    const dispute = await Dispute.create({
      order_id,
      opened_by: userId,
      against_user,
      reason,
      description: description || null
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (err) { next(err); }
}

export async function listDisputes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    // Admin sees all, others see only their own
    if (userRole !== "Admin") {
      const { Op } = require("sequelize");
      where[Op.or] = [{ opened_by: userId }, { against_user: userId }];
    }

    const disputes = await Dispute.findAll({
      where,
      include: [
        { model: User, as: "opener", attributes: ["id", "name", "company_name"] },
        { model: User, as: "target", attributes: ["id", "name", "company_name"] },
        { model: Order, as: "order" }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: disputes });
  } catch (err) { next(err); }
}

export async function getDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const dispute = await Dispute.findByPk(req.params.id, {
      include: [
        { model: User, as: "opener", attributes: ["id", "name", "company_name"] },
        { model: User, as: "target", attributes: ["id", "name", "company_name"] },
        { model: User, as: "resolver", attributes: ["id", "name"] },
        { model: Order, as: "order" }
      ]
    });
    if (!dispute) return res.status(404).json({ success: false, error: "Dispute not found" });
    res.json({ success: true, data: dispute });
  } catch (err) { next(err); }
}

export async function resolveDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).userId;
    const { resolution, status } = req.body;

    if (!resolution) {
      return res.status(400).json({ success: false, error: "resolution is required" });
    }

    const dispute = await Dispute.findByPk(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, error: "Dispute not found" });
    if (dispute.status !== "open" && dispute.status !== "under_review") {
      return res.status(400).json({ success: false, error: "هذا الخلاف مغلق بالفعل" });
    }

    await dispute.update({
      status: status || "resolved",
      resolution,
      resolved_by: adminId,
      resolved_at: new Date()
    });

    res.json({ success: true, message: "تم حل الخلاف بنجاح", data: dispute });
  } catch (err) { next(err); }
}
