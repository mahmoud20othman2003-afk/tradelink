import { Request, Response, NextFunction } from "express";
import { TieredPrice } from "../models/TieredPrice";
import { Product } from "../models/Product";

export async function setTieredPrices(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { product_id, tiers } = req.body;

    if (!product_id || !tiers || !Array.isArray(tiers) || tiers.length === 0) {
      return res.status(400).json({ success: false, error: "product_id and tiers array are required" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    if (userRole !== "Admin" && product.supplier_id !== userId) {
      return res.status(403).json({ success: false, error: "لا يمكنك تعديل أسعار منتج ليس لك" });
    }

    // Validate tiers
    for (const tier of tiers) {
      if (!tier.min_qty || !tier.price_per_unit) {
        return res.status(400).json({ success: false, error: "Each tier needs min_qty and price_per_unit" });
      }
    }

    // Replace all existing tiers
    await TieredPrice.destroy({ where: { product_id } });

    const created = await TieredPrice.bulkCreate(
      tiers.map((t: any) => ({
        product_id,
        min_qty: Number(t.min_qty),
        max_qty: t.max_qty ? Number(t.max_qty) : null,
        price_per_unit: Number(t.price_per_unit)
      }))
    );

    res.json({ success: true, data: created });
  } catch (err) { next(err); }
}

export async function getTieredPrices(req: Request, res: Response, next: NextFunction) {
  try {
    const { product_id } = req.params;

    const product = await Product.findByPk(product_id, { attributes: ["id", "name", "price"] });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const tiers = await TieredPrice.findAll({
      where: { product_id: Number(product_id) },
      order: [["min_qty", "ASC"]]
    });

    res.json({ success: true, data: { product, tiers } });
  } catch (err) { next(err); }
}

export async function calculatePrice(req: Request, res: Response, next: NextFunction) {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({ success: false, error: "product_id and quantity are required" });
    }

    const product = await Product.findByPk(product_id, { attributes: ["id", "name", "price"] });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const tiers = await TieredPrice.findAll({
      where: { product_id },
      order: [["min_qty", "ASC"]]
    });

    let unitPrice = Number(product.price);
    let appliedTier: string | null = null;

    for (const tier of tiers) {
      if (Number(quantity) >= tier.min_qty && (tier.max_qty === null || Number(quantity) <= tier.max_qty)) {
        unitPrice = Number(tier.price_per_unit);
        appliedTier = `${tier.min_qty}${tier.max_qty ? `-${tier.max_qty}` : "+"} units`;
        break;
      }
    }

    // If quantity exceeds all tiers, use the last (highest) tier
    if (!appliedTier && tiers.length > 0) {
      const lastTier = tiers[tiers.length - 1];
      if (Number(quantity) >= lastTier.min_qty) {
        unitPrice = Number(lastTier.price_per_unit);
        appliedTier = `${lastTier.min_qty}+ units`;
      }
    }

    res.json({
      success: true,
      data: {
        product_id,
        quantity: Number(quantity),
        unit_price: unitPrice,
        total_price: Number((unitPrice * Number(quantity)).toFixed(2)),
        applied_tier: appliedTier,
        base_price: Number(product.price)
      }
    });
  } catch (err) { next(err); }
}
