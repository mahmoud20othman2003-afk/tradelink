import { Request, Response } from "express";
import { SupplierMov } from "../models/SupplierMov";
import { User } from "../models/User";

export async function getMov(req: Request, res: Response) {
  try {
    const supplierId = parseInt(req.params.supplierId);
    const mov = await SupplierMov.findOne({
      where: { supplier_id: supplierId },
      include: [{ model: User, as: "supplier", attributes: ["id", "name", "company_name"] }]
    });
    if (!mov) {
      return res.json({ success: true, data: { supplier_id: supplierId, min_order_value: 0, currency: "EGP", message: "No minimum order value set" } });
    }
    res.json({ success: true, data: mov });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function setMov(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { min_order_value, currency, message } = req.body;

    if (min_order_value === undefined || min_order_value < 0) {
      return res.status(400).json({ success: false, error: "min_order_value is required and must be >= 0" });
    }

    const [mov, created] = await SupplierMov.findOrCreate({
      where: { supplier_id: userId },
      defaults: { supplier_id: userId, min_order_value, currency: currency || "EGP", message }
    });

    if (!created) {
      await mov.update({ min_order_value, currency: currency || mov.currency, message: message !== undefined ? message : mov.message });
    }

    res.json({ success: true, data: mov });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function validateOrderValue(req: Request, res: Response) {
  try {
    const { supplier_id, order_value } = req.body;
    if (!supplier_id || order_value === undefined) {
      return res.status(400).json({ success: false, error: "supplier_id and order_value are required" });
    }

    const mov = await SupplierMov.findOne({ where: { supplier_id } });
    if (!mov || Number(mov.min_order_value) === 0) {
      return res.json({ success: true, data: { valid: true, min_order_value: 0, message: "No minimum order value required" } });
    }

    const valid = order_value >= Number(mov.min_order_value);
    res.json({
      success: true,
      data: {
        valid,
        min_order_value: mov.min_order_value,
        order_value,
        shortfall: valid ? 0 : Number(mov.min_order_value) - order_value,
        message: valid ? "Order meets minimum value" : mov.message || `الحد الأدنى للطلب ${mov.min_order_value} ${mov.currency}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
