import { Request, Response } from "express";
import { SubscriptionPlan } from "../models/SubscriptionPlan";

export async function listPlans(req: Request, res: Response) {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { status: "active" },
      order: [["price_monthly", "ASC"]]
    });
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPlan(req: Request, res: Response) {
  try {
    const { name, tier, price_monthly, price_yearly, max_products, max_warehouses, commission_discount, features } = req.body;

    if (!name || !tier || !price_monthly || !price_yearly || !max_products || !max_warehouses) {
      return res.status(400).json({ success: false, error: "name, tier, price_monthly, price_yearly, max_products, max_warehouses are required" });
    }

    const plan = await SubscriptionPlan.create({
      name,
      tier,
      price_monthly,
      price_yearly,
      max_products,
      max_warehouses,
      commission_discount: commission_discount || 0,
      features: features ? JSON.stringify(features) : null
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPlan(req: Request, res: Response) {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: "Plan not found" });

    const data = plan.toJSON();
    if (data.features) {
      try { (data as any).features_parsed = JSON.parse(data.features); } catch { /* ignore */ }
    }
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
