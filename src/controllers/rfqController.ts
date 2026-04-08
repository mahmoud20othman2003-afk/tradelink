import { Request, Response } from "express";
import { Rfq } from "../models/Rfq";
import { RfqQuote } from "../models/RfqQuote";
import { User } from "../models/User";
import { Product } from "../models/Product";

export async function listRfqs(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const where: any = {};
    if (status) where.status = status;

    const rfqs = await Rfq.findAll({
      where,
      include: [
        { model: User, as: "buyer", attributes: ["id", "name", "company_name"] },
        { model: Product, as: "product", attributes: ["id", "name", "sku"] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: rfqs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createRfq(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { product_id, product_name, quantity, unit, description, target_price, expires_at } = req.body;
    if (!product_name || !quantity) {
      return res.status(400).json({ success: false, error: "product_name and quantity are required" });
    }
    const rfq = await Rfq.create({
      buyer_id: userId,
      product_id: product_id || null,
      product_name,
      quantity,
      unit: unit || "piece",
      description,
      target_price,
      expires_at
    });
    res.status(201).json({ success: true, data: rfq });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitQuote(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const rfqId = parseInt(req.params.rfqId);
    const { unit_price, total_price, notes, valid_until } = req.body;

    const rfq = await Rfq.findByPk(rfqId);
    if (!rfq) return res.status(404).json({ success: false, error: "RFQ not found" });
    if (rfq.status !== "open") return res.status(400).json({ success: false, error: "RFQ is no longer open" });

    const quote = await RfqQuote.create({
      rfq_id: rfqId,
      supplier_id: userId,
      unit_price,
      total_price,
      notes,
      valid_until
    });

    await rfq.update({ status: "quoted" });
    res.status(201).json({ success: true, data: quote });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getRfqQuotes(req: Request, res: Response) {
  try {
    const rfqId = parseInt(req.params.rfqId);
    const rfq = await Rfq.findByPk(rfqId);
    if (!rfq) return res.status(404).json({ success: false, error: "RFQ not found" });

    const quotes = await RfqQuote.findAll({
      where: { rfq_id: rfqId },
      include: [{ model: User, as: "supplier", attributes: ["id", "name", "company_name"] }],
      order: [["unit_price", "ASC"]]
    });
    res.json({ success: true, data: { rfq, quotes } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function acceptQuote(req: Request, res: Response) {
  try {
    const quoteId = parseInt(req.params.quoteId);
    const quote = await RfqQuote.findByPk(quoteId);
    if (!quote) return res.status(404).json({ success: false, error: "Quote not found" });

    const rfq = await Rfq.findByPk(quote.rfq_id);
    if (!rfq) return res.status(404).json({ success: false, error: "RFQ not found" });

    const userId = (req as any).userId;
    if (rfq.buyer_id !== userId) {
      return res.status(403).json({ success: false, error: "Only the RFQ owner can accept quotes" });
    }

    await quote.update({ status: "accepted" });
    await rfq.update({ status: "accepted" });

    // Reject other quotes
    await RfqQuote.update(
      { status: "rejected" },
      { where: { rfq_id: rfq.id, id: { [require("sequelize").Op.ne]: quoteId } } }
    );

    res.json({ success: true, data: quote });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
