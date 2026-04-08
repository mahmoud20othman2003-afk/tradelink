import { Request, Response, NextFunction } from "express";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { User } from "../models/User";

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { product_id, desired_qty } = req.body;

    if (!product_id) return res.status(400).json({ success: false, error: "product_id is required" });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ where: { user_id: userId, product_id } });
    if (existing) {
      // Update quantity if already exists
      await existing.update({ desired_qty: Number(desired_qty) || existing.desired_qty });
      return res.json({ success: true, message: "تم تحديث قائمة الرغبات", data: existing });
    }

    const item = await Wishlist.create({
      user_id: userId,
      product_id,
      desired_qty: Number(desired_qty) || 1
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function getMyWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;

    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product, as: "product",
          attributes: ["id", "name", "sku", "price", "image", "status", "quantity"],
          include: [{ model: User, as: "supplier", attributes: ["id", "name", "company_name"] }]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const item = await Wishlist.findOne({ where: { id: Number(id), user_id: userId } });
    if (!item) return res.status(404).json({ success: false, error: "Wishlist item not found" });

    await item.destroy();
    res.json({ success: true, message: "تم الحذف من قائمة الرغبات" });
  } catch (err) { next(err); }
}

export async function clearWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    await Wishlist.destroy({ where: { user_id: userId } });
    res.json({ success: true, message: "تم مسح قائمة الرغبات بالكامل" });
  } catch (err) { next(err); }
}
