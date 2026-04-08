import { Request, Response, NextFunction } from "express";
import { FlashSale } from "../models/FlashSale";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Op } from "sequelize";

export async function createFlashSale(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { product_id, sale_price, quantity_limit, starts_at, ends_at } = req.body;

    if (!product_id || !sale_price || !quantity_limit || !starts_at || !ends_at) {
      return res.status(400).json({
        success: false,
        error: "product_id, sale_price, quantity_limit, starts_at, ends_at are required"
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    // Supplier can only flash-sale their own products
    const userRole = (req as any).userRole;
    if (userRole !== "Admin" && product.supplier_id !== userId) {
      return res.status(403).json({ success: false, error: "لا يمكنك إنشاء عرض فلاش لمنتج ليس لك" });
    }

    if (Number(sale_price) >= Number(product.price)) {
      return res.status(400).json({ success: false, error: "سعر العرض يجب أن يكون أقل من السعر الأصلي" });
    }

    const flashSale = await FlashSale.create({
      product_id,
      sale_price: Number(sale_price),
      original_price: Number(product.price),
      quantity_limit: Number(quantity_limit),
      starts_at: new Date(starts_at),
      ends_at: new Date(ends_at),
      created_by: userId
    });

    res.status(201).json({ success: true, data: flashSale });
  } catch (err) { next(err); }
}

export async function getActiveFlashSales(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const sales = await FlashSale.findAll({
      where: {
        status: "active",
        starts_at: { [Op.lte]: now },
        ends_at: { [Op.gte]: now }
      },
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku", "image", "price"] }
      ],
      order: [["ends_at", "ASC"]]
    });

    res.json({ success: true, data: sales });
  } catch (err) { next(err); }
}

export async function listFlashSales(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const sales = await FlashSale.findAll({
      where,
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku", "image", "price"] },
        { model: User, as: "creator", attributes: ["id", "name", "company_name"] }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: sales });
  } catch (err) { next(err); }
}

export async function updateFlashSaleStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    if (!status || !["active", "cancelled", "ended"].includes(status)) {
      return res.status(400).json({ success: false, error: "status must be 'active', 'cancelled', or 'ended'" });
    }

    const sale = await FlashSale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ success: false, error: "Flash sale not found" });

    await sale.update({ status });
    res.json({ success: true, data: sale });
  } catch (err) { next(err); }
}
