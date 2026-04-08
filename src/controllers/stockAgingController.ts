import { Request, Response } from "express";
import { Product } from "../models/Product";
import { OrderItem } from "../models/OrderItem";
import { sequelize } from "../models";

export async function getSlowMovingProducts(req: Request, res: Response) {
  try {
    const days = parseInt(req.query.days as string) || 60;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Find products that have had zero or very few sales in the period
    const products = await Product.findAll({
      where: { status: "active" },
      attributes: [
        "id", "name", "sku", "price", "quantity", "created_at",
        [
          sequelize.literal(`(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi INNER JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = Product.id AND o.created_at >= '${cutoff.toISOString()}')`),
          "recent_sales"
        ]
      ],
      order: [[sequelize.literal("recent_sales"), "ASC"]],
      limit: parseInt(req.query.limit as string) || 20
    });

    const data = products.map((p: any) => {
      const json = p.toJSON();
      const daysInStock = Math.floor((Date.now() - new Date(json.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...json,
        recent_sales: Number(json.recent_sales),
        days_in_stock: daysInStock,
        aging_status: Number(json.recent_sales) === 0 ? "stale" : Number(json.recent_sales) < 5 ? "slow" : "normal"
      };
    });

    res.json({
      success: true,
      data: {
        analysis_period_days: days,
        total_slow_moving: data.filter((d: any) => d.aging_status !== "normal").length,
        products: data
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
