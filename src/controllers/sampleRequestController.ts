import { Request, Response } from "express";
import { SampleRequest } from "../models/SampleRequest";
import { Product } from "../models/Product";
import { User } from "../models/User";

export async function listSamples(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const role = (req as any).userRole;
    const where: any = {};
    if (role === "Supplier") where.supplier_id = userId;
    else if (role !== "Admin") where.buyer_id = userId;

    const samples = await SampleRequest.findAll({
      where,
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "price", "image"] },
        { model: User, as: "buyer", attributes: ["id", "name", "company_name"] },
        { model: User, as: "supplierUser", attributes: ["id", "name", "company_name"] }
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: samples });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createSampleRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { product_id, quantity, sample_type, shipping_address, notes } = req.body;

    if (!product_id || !shipping_address) {
      return res.status(400).json({ success: false, error: "product_id and shipping_address are required" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    const cost = sample_type === "paid" ? Number(product.price) * (quantity || 1) * 0.5 : 0;

    const sample = await SampleRequest.create({
      buyer_id: userId,
      product_id,
      supplier_id: product.supplier_id,
      quantity: quantity || 1,
      sample_type: sample_type || "free",
      cost,
      shipping_address,
      notes
    });
    res.status(201).json({ success: true, data: sample });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateSampleStatus(req: Request, res: Response) {
  try {
    const sample = await SampleRequest.findByPk(req.params.id);
    if (!sample) return res.status(404).json({ success: false, error: "Sample request not found" });

    const { status } = req.body;
    const validStatuses = ["pending", "approved", "shipped", "delivered", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    await sample.update({ status });
    res.json({ success: true, data: sample });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
