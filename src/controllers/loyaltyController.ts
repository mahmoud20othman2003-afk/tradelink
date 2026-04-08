import { Request, Response } from "express";
import { LoyaltyPoint } from "../models/LoyaltyPoint";
import { sequelize } from "../models";

export async function getMyPoints(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const result = await LoyaltyPoint.findAll({
      where: { user_id: userId },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("points")), "total_points"]
      ],
      raw: true
    }) as any[];

    const totalPoints = result[0]?.total_points || 0;
    const shippingDiscount = Math.floor(totalPoints / 100) * 10; // Every 100 points = 10 EGP shipping discount

    const history = await LoyaltyPoint.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 20
    });

    res.json({
      success: true,
      data: {
        total_points: Number(totalPoints),
        shipping_discount_available: shippingDiscount,
        history
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addPoints(req: Request, res: Response) {
  try {
    const { user_id, points, action, order_id, description } = req.body;

    if (!user_id || !points || !action || !description) {
      return res.status(400).json({ success: false, error: "user_id, points, action, and description are required" });
    }

    const entry = await LoyaltyPoint.create({
      user_id,
      points,
      action,
      order_id: order_id || null,
      description
    });
    res.status(201).json({ success: true, data: entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function redeemPoints(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { points_to_redeem } = req.body;

    if (!points_to_redeem || points_to_redeem <= 0) {
      return res.status(400).json({ success: false, error: "points_to_redeem must be positive" });
    }

    const result = await LoyaltyPoint.findAll({
      where: { user_id: userId },
      attributes: [[sequelize.fn("SUM", sequelize.col("points")), "total_points"]],
      raw: true
    }) as any[];

    const totalPoints = Number(result[0]?.total_points || 0);
    if (points_to_redeem > totalPoints) {
      return res.status(400).json({ success: false, error: `Insufficient points. You have ${totalPoints} points.` });
    }

    const shippingDiscount = Math.floor(points_to_redeem / 100) * 10;

    const entry = await LoyaltyPoint.create({
      user_id: userId,
      points: -points_to_redeem,
      action: "redeem",
      description: `Redeemed ${points_to_redeem} points for ${shippingDiscount} EGP shipping discount`
    });

    res.json({ success: true, data: { redeemed: points_to_redeem, shipping_discount: shippingDiscount, remaining_points: totalPoints - points_to_redeem, entry } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
