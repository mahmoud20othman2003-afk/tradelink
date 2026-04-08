import { Request, Response } from "express";
import { Rma } from "../models/Rma";
import { Order } from "../models/Order";
import { User } from "../models/User";

export async function listRmas(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const where: any = {};
    if (role === "Supplier") where.seller_id = userId;
    else if (role !== "Admin") where.buyer_id = userId;
    if (req.query.status) where.status = req.query.status;

    const rmas = await Rma.findAll({
      where,
      include: [
        { model: Order, as: "order" },
        { model: User, as: "buyer", attributes: ["id", "name", "company_name"] },
        { model: User, as: "seller", attributes: ["id", "name", "company_name"] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: rmas });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createRma(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { order_id, reason, description, return_type } = req.body;

    if (!order_id || !reason) {
      return res.status(400).json({ success: false, error: "order_id and reason are required" });
    }

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    if (order.buyer_id !== userId) {
      return res.status(403).json({ success: false, error: "You can only create RMA for your own orders" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ success: false, error: "RMA can only be created for delivered orders" });
    }

    const rma = await Rma.create({
      order_id,
      buyer_id: userId,
      seller_id: order.seller_id,
      reason,
      description,
      return_type: return_type || "full"
    });
    res.status(201).json({ success: true, data: rma });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateRmaStatus(req: Request, res: Response) {
  try {
    const rma = await Rma.findByPk(req.params.id);
    if (!rma) return res.status(404).json({ success: false, error: "RMA not found" });

    const { status, refund_amount } = req.body;
    const validStatuses = ["requested", "approved", "shipped_back", "received", "refunded", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updateData: any = { status };
    if (refund_amount !== undefined) updateData.refund_amount = refund_amount;

    await rma.update(updateData);
    res.json({ success: true, data: rma });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
