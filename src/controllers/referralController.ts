import { Request, Response } from "express";
import { Referral } from "../models/Referral";
import { User } from "../models/User";
import crypto from "crypto";

export async function getMyReferralCode(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const code = `TL-${userId}-${crypto.createHash("md5").update(`${userId}-tradelink`).digest("hex").substring(0, 6).toUpperCase()}`;

    const referrals = await Referral.findAll({
      where: { referrer_id: userId },
      include: [{ model: User, as: "referred", attributes: ["id", "name", "created_at"] }],
      order: [["created_at", "DESC"]]
    });

    const completed = referrals.filter(r => r.status === "completed").length;
    const totalEarned = referrals.filter(r => r.status === "completed").reduce((sum, r) => sum + Number(r.reward_amount), 0);

    res.json({
      success: true,
      data: {
        referral_code: code,
        total_referrals: referrals.length,
        completed_referrals: completed,
        total_earned: totalEarned,
        referrals
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function applyReferral(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { referral_code } = req.body;

    if (!referral_code) {
      return res.status(400).json({ success: false, error: "referral_code is required" });
    }

    // Extract referrer ID from code
    const parts = referral_code.split("-");
    if (parts.length < 3 || parts[0] !== "TL") {
      return res.status(400).json({ success: false, error: "Invalid referral code format" });
    }
    const referrerId = parseInt(parts[1]);
    if (referrerId === userId) {
      return res.status(400).json({ success: false, error: "Cannot refer yourself" });
    }

    const referrer = await User.findByPk(referrerId);
    if (!referrer) return res.status(404).json({ success: false, error: "Referrer not found" });

    // Check if already referred
    const existing = await Referral.findOne({ where: { referred_id: userId } });
    if (existing) {
      return res.status(409).json({ success: false, error: "You have already used a referral code" });
    }

    const referral = await Referral.create({
      referrer_id: referrerId,
      referred_id: userId,
      referral_code,
      reward_amount: 50,
      status: "completed",
      completed_at: new Date()
    });

    res.status(201).json({ success: true, data: referral });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
