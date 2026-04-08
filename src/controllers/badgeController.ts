import { Request, Response } from "express";
import { Badge } from "../models/Badge";
import { UserBadge } from "../models/UserBadge";
import { User } from "../models/User";

export async function listBadges(req: Request, res: Response) {
  try {
    const badges = await Badge.findAll({ order: [["id", "ASC"]] });
    res.json({ success: true, data: badges });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUserBadges(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const userBadges = await UserBadge.findAll({
      where: { user_id: userId },
      include: [{ model: Badge, as: "badge" }],
      order: [["awarded_at", "DESC"]]
    });

    const user = await User.findByPk(userId, { attributes: ["id", "name", "company_name"] });
    res.json({ success: true, data: { user, badges: userBadges } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function awardBadge(req: Request, res: Response) {
  try {
    const { user_id, badge_id } = req.body;
    if (!user_id || !badge_id) {
      return res.status(400).json({ success: false, error: "user_id and badge_id are required" });
    }

    const badge = await Badge.findByPk(badge_id);
    if (!badge) return res.status(404).json({ success: false, error: "Badge not found" });

    const existing = await UserBadge.findOne({ where: { user_id, badge_id } });
    if (existing) {
      return res.status(409).json({ success: false, error: "User already has this badge" });
    }

    const userBadge = await UserBadge.create({ user_id, badge_id });
    res.status(201).json({ success: true, data: { ...userBadge.toJSON(), badge } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createBadge(req: Request, res: Response) {
  try {
    const { name, slug, description, icon, criteria } = req.body;
    if (!name || !slug || !description || !criteria) {
      return res.status(400).json({ success: false, error: "name, slug, description, and criteria are required" });
    }

    const badge = await Badge.create({ name, slug, description, icon, criteria });
    res.status(201).json({ success: true, data: badge });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
