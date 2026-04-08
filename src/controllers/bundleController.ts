import { Request, Response } from "express";
import { ProductBundle } from "../models/ProductBundle";
import { BundleItem } from "../models/BundleItem";
import { Product } from "../models/Product";
import { User } from "../models/User";

export async function listBundles(req: Request, res: Response) {
  try {
    const bundles = await ProductBundle.findAll({
      where: { status: "active" },
      include: [
        { model: User, as: "supplier", attributes: ["id", "name", "company_name"] },
        { model: BundleItem, as: "items", include: [{ model: Product, as: "product", attributes: ["id", "name", "price", "image"] }] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: bundles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createBundle(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { name, description, items } = req.body;

    if (!name || !items || !Array.isArray(items) || items.length < 2) {
      return res.status(400).json({ success: false, error: "Name and at least 2 items are required" });
    }

    // Calculate original total
    let originalTotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) return res.status(404).json({ success: false, error: `Product ${item.product_id} not found` });
      originalTotal += Number(product.price) * (item.quantity || 1);
    }

    const bundlePrice = req.body.bundle_price || originalTotal * 0.9; // Default 10% discount

    const bundle = await ProductBundle.create({
      name,
      description,
      supplier_id: userId,
      bundle_price: bundlePrice,
      original_total: originalTotal
    });

    for (const item of items) {
      await BundleItem.create({
        bundle_id: bundle.id,
        product_id: item.product_id,
        quantity: item.quantity || 1
      });
    }

    const result = await ProductBundle.findByPk(bundle.id, {
      include: [{ model: BundleItem, as: "items", include: [{ model: Product, as: "product", attributes: ["id", "name", "price"] }] }]
    });

    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getBundle(req: Request, res: Response) {
  try {
    const bundle = await ProductBundle.findByPk(req.params.id, {
      include: [
        { model: User, as: "supplier", attributes: ["id", "name", "company_name"] },
        { model: BundleItem, as: "items", include: [{ model: Product, as: "product", attributes: ["id", "name", "price", "image"] }] }
      ]
    });
    if (!bundle) return res.status(404).json({ success: false, error: "Bundle not found" });
    const savings = Number(bundle.original_total) - Number(bundle.bundle_price);
    const discount_pct = ((savings / Number(bundle.original_total)) * 100).toFixed(1);
    res.json({ success: true, data: { ...bundle.toJSON(), savings, discount_pct } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
