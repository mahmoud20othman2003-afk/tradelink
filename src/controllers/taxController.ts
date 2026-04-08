import { Request, Response } from "express";
import { TaxConfig } from "../models/TaxConfig";
import { Category } from "../models/Category";

export async function listTaxConfigs(req: Request, res: Response) {
  try {
    const configs = await TaxConfig.findAll({
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      order: [["id", "ASC"]]
    });
    res.json({ success: true, data: configs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createOrUpdateTax(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { category_id, name, rate, is_inclusive } = req.body;

    if (!name || rate === undefined) {
      return res.status(400).json({ success: false, error: "name and rate are required" });
    }

    if (category_id) {
      const existing = await TaxConfig.findOne({ where: { category_id } });
      if (existing) {
        await existing.update({ name, rate, is_inclusive: is_inclusive ?? existing.is_inclusive, updated_by: userId });
        return res.json({ success: true, data: existing });
      }
    }

    const config = await TaxConfig.create({
      category_id: category_id || null,
      name,
      rate,
      is_inclusive: is_inclusive ?? false,
      updated_by: userId
    });
    res.status(201).json({ success: true, data: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function calculateTax(req: Request, res: Response) {
  try {
    const { amount, category_id } = req.body;
    if (!amount) return res.status(400).json({ success: false, error: "amount is required" });

    // Try category-specific tax, fallback to default (no category)
    let config = category_id
      ? await TaxConfig.findOne({ where: { category_id, status: "active" } })
      : null;

    if (!config) {
      config = await TaxConfig.findOne({ where: { category_id: null, status: "active" } });
    }

    if (!config) {
      return res.json({ success: true, data: { amount, tax: 0, total: amount, tax_rate: 0, message: "No tax configured" } });
    }

    const rate = Number(config.rate);
    let tax: number, total: number;

    if (config.is_inclusive) {
      tax = amount - (amount / (1 + rate / 100));
      total = amount;
    } else {
      tax = amount * (rate / 100);
      total = amount + tax;
    }

    res.json({
      success: true,
      data: {
        amount,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        tax_rate: rate,
        tax_name: config.name,
        is_inclusive: config.is_inclusive
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
