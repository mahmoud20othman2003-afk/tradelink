import { Request, Response } from "express";
import { PreOrder } from "../models/PreOrder";
import { Product } from "../models/Product";
import { User } from "../models/User";

export async function listPreOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const where: any = role === "Admin" ? {} : { buyer_id: userId };
    if (req.query.status) where.status = req.query.status;

    const preOrders = await PreOrder.findAll({
      where,
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "price", "image"] },
        { model: User, as: "buyer", attributes: ["id", "name", "company_name"] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: preOrders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPreOrder(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { product_id, quantity, expected_date, deposit_percentage, notes } = req.body;

    if (!product_id || !quantity || !expected_date) {
      return res.status(400).json({ success: false, error: "product_id, quantity, and expected_date are required" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const totalAmount = Number(product.price) * quantity;
    const depositPct = deposit_percentage || 25;
    const depositAmount = totalAmount * (depositPct / 100);

    const preOrder = await PreOrder.create({
      buyer_id: userId,
      product_id,
      quantity,
      deposit_amount: depositAmount,
      total_amount: totalAmount,
      expected_date: new Date(expected_date),
      notes
    });
    res.status(201).json({ success: true, data: preOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePreOrderStatus(req: Request, res: Response) {
  try {
    const preOrder = await PreOrder.findByPk(req.params.id);
    if (!preOrder) return res.status(404).json({ success: false, error: "Pre-order not found" });

    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    await preOrder.update({ status });
    res.json({ success: true, data: preOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
