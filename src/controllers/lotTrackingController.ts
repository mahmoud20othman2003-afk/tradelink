import { Request, Response } from "express";
import { LotTracking } from "../models/LotTracking";
import { Product } from "../models/Product";
import { Warehouse } from "../models/Warehouse";
import crypto from "crypto";

export async function listLots(req: Request, res: Response) {
  try {
    const productId = req.query.product_id ? parseInt(req.query.product_id as string) : undefined;
    const where: any = {};
    if (productId) where.product_id = productId;
    if (req.query.status) where.status = req.query.status;

    const lots = await LotTracking.findAll({
      where,
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "city", "address"] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: lots });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createLot(req: Request, res: Response) {
  try {
    const { product_id, quantity, manufacture_date, expiry_date, warehouse_id, bin_location } = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({ success: false, error: "product_id and quantity are required" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const lotNumber = `LOT-${product.sku}-${Date.now()}`;
    const qrCode = `QR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    const lot = await LotTracking.create({
      product_id,
      lot_number: lotNumber,
      qr_code: qrCode,
      quantity,
      manufacture_date: manufacture_date ? new Date(manufacture_date) : null,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      warehouse_id: warehouse_id || null,
      bin_location: bin_location || null
    });
    res.status(201).json({ success: true, data: lot });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getLotByQr(req: Request, res: Response) {
  try {
    const lot = await LotTracking.findOne({
      where: { qr_code: req.params.qrCode },
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku", "price"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "city", "address"] }
      ]
    });
    if (!lot) return res.status(404).json({ success: false, error: "Lot not found" });
    res.json({ success: true, data: lot });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getExpiringLots(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const { Op } = require("sequelize");
    const lots = await LotTracking.findAll({
      where: {
        expiry_date: { [Op.lte]: cutoff, [Op.gt]: new Date() },
        status: "active"
      },
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "sku"] },
        { model: Warehouse, as: "warehouse", attributes: ["id", "city"] }
      ],
      order: [["expiry_date", "ASC"]]
    });
    res.json({ success: true, data: { expiring_within_days: days, count: lots.length, lots } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
