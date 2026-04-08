import { Request, Response } from "express";
import { BackOrder } from "../models/BackOrder";
import { Product } from "../models/Product";
import { User } from "../models/User";

export async function listBackOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const where: any = {};
    if (role !== "Admin") where.buyer_id = userId;
    if (req.query.status) where.status = req.query.status;

    const backOrders = await BackOrder.findAll({
      where,
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "price", "image"] },
        { model: User, as: "buyer", attributes: ["id", "name", "company_name"] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: backOrders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createBackOrder(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { product_id, quantity, expected_delivery, notify_buyer } = req.body;

    if (!product_id || !quantity || !expected_delivery) {
      return res.status(400).json({ success: false, error: "product_id, quantity, and expected_delivery are required" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const backOrder = await BackOrder.create({
      buyer_id: userId,
      product_id,
      quantity,
      expected_delivery: new Date(expected_delivery),
      notify_buyer: notify_buyer !== undefined ? notify_buyer : true
    });
    res.status(201).json({ success: true, data: backOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateBackOrderStatus(req: Request, res: Response) {
  try {
    const backOrder = await BackOrder.findByPk(req.params.id);
    if (!backOrder) return res.status(404).json({ success: false, error: "Back order not found" });

    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "available", "fulfilled", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    await backOrder.update({ status });
    res.json({ success: true, data: backOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
