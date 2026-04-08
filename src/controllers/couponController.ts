import { Request, Response, NextFunction } from "express";
import { Coupon } from "../models/Coupon";
import { Op } from "sequelize";

export async function createCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).userId;
    const {
      code, discount_type, discount_value,
      min_order_amount, max_uses,
      target_governorates, target_category_id,
      starts_at, expires_at
    } = req.body;

    if (!code || !discount_type || !discount_value || !starts_at || !expires_at) {
      return res.status(400).json({
        success: false,
        error: "code, discount_type, discount_value, starts_at, expires_at are required"
      });
    }

    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({ success: false, error: "discount_type must be 'percentage' or 'fixed'" });
    }

    if (discount_type === "percentage" && (Number(discount_value) < 1 || Number(discount_value) > 100)) {
      return res.status(400).json({ success: false, error: "Percentage discount must be between 1 and 100" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount) || 0,
      max_uses: Number(max_uses) || 0,
      target_governorates: target_governorates || null,
      target_category_id: target_category_id || null,
      starts_at: new Date(starts_at),
      expires_at: new Date(expires_at),
      created_by: adminId
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (err: any) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, error: "كود الكوبون مستخدم بالفعل" });
    }
    next(err);
  }
}

export async function listCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const coupons = await Coupon.findAll({ where, order: [["created_at", "DESC"]] });
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
}

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, order_amount, governorate, category_id } = req.body;
    if (!code) return res.status(400).json({ success: false, error: "code is required" });

    const now = new Date();
    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        status: "active",
        starts_at: { [Op.lte]: now },
        expires_at: { [Op.gte]: now }
      }
    });

    if (!coupon) return res.status(404).json({ success: false, error: "كوبون غير صالح أو منتهي الصلاحية" });

    // Check max uses
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ success: false, error: "تم استنفاد عدد مرات استخدام الكوبون" });
    }

    // Check min order
    if (order_amount && Number(order_amount) < Number(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        error: `الحد الأدنى للطلب ${coupon.min_order_amount} جنيه`
      });
    }

    // Check governorate targeting
    if (coupon.target_governorates && governorate) {
      const govs = coupon.target_governorates.split(",").map(g => g.trim());
      if (!govs.includes(governorate)) {
        return res.status(400).json({ success: false, error: "هذا الكوبون غير متاح في محافظتك" });
      }
    }

    // Check category targeting
    if (coupon.target_category_id && category_id && coupon.target_category_id !== Number(category_id)) {
      return res.status(400).json({ success: false, error: "هذا الكوبون غير متاح لهذه الفئة" });
    }

    // Calculate discount
    let discount = 0;
    if (order_amount) {
      if (coupon.discount_type === "percentage") {
        discount = Number((Number(order_amount) * Number(coupon.discount_value) / 100).toFixed(2));
      } else {
        discount = Math.min(Number(coupon.discount_value), Number(order_amount));
      }
    }

    res.json({
      success: true,
      data: {
        valid: true,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        calculated_discount: discount,
        final_amount: order_amount ? Number((Number(order_amount) - discount).toFixed(2)) : null
      }
    });
  } catch (err) { next(err); }
}

export async function updateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: "Coupon not found" });

    const { status, max_uses, expires_at, target_governorates } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (max_uses !== undefined) updateData.max_uses = Number(max_uses);
    if (expires_at) updateData.expires_at = new Date(expires_at);
    if (target_governorates !== undefined) updateData.target_governorates = target_governorates;

    await coupon.update(updateData);
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
}
