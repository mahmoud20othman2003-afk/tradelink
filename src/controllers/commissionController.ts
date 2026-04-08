import { Request, Response, NextFunction } from "express";
import { CategoryCommission } from "../models/CategoryCommission";
import { Category } from "../models/Category";

export async function listCommissions(_req: Request, res: Response, next: NextFunction) {
  try {
    const commissions = await CategoryCommission.findAll({
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }]
    });
    res.json({ success: true, data: commissions });
  } catch (err) { next(err); }
}

export async function getCommission(req: Request, res: Response, next: NextFunction) {
  try {
    const commission = await CategoryCommission.findOne({
      where: { category_id: req.params.category_id },
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }]
    });
    if (!commission) {
      return res.status(404).json({ success: false, error: "Commission rate not set for this category" });
    }
    res.json({ success: true, data: commission });
  } catch (err) { next(err); }
}

export async function setCommission(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).userId;
    const { category_id, supplier_rate, wholesaler_rate, retailer_rate } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, error: "category_id is required" });
    }

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) return res.status(404).json({ success: false, error: "Category not found" });

    // Upsert
    const [commission, created] = await CategoryCommission.findOrCreate({
      where: { category_id },
      defaults: {
        category_id,
        supplier_rate: Number(supplier_rate) || 5.00,
        wholesaler_rate: Number(wholesaler_rate) || 3.00,
        retailer_rate: Number(retailer_rate) || 2.00,
        updated_by: adminId
      }
    });

    if (!created) {
      await commission.update({
        supplier_rate: supplier_rate !== undefined ? Number(supplier_rate) : commission.supplier_rate,
        wholesaler_rate: wholesaler_rate !== undefined ? Number(wholesaler_rate) : commission.wholesaler_rate,
        retailer_rate: retailer_rate !== undefined ? Number(retailer_rate) : commission.retailer_rate,
        updated_by: adminId,
        updated_at: new Date()
      });
    }

    res.json({
      success: true,
      message: created ? "تم إنشاء نسبة العمولة" : "تم تحديث نسبة العمولة",
      data: commission
    });
  } catch (err) { next(err); }
}

export async function deleteCommission(req: Request, res: Response, next: NextFunction) {
  try {
    const commission = await CategoryCommission.findOne({
      where: { category_id: req.params.category_id }
    });
    if (!commission) return res.status(404).json({ success: false, error: "Commission not found" });

    await commission.destroy();
    res.json({ success: true, message: "تم حذف نسبة العمولة" });
  } catch (err) { next(err); }
}
