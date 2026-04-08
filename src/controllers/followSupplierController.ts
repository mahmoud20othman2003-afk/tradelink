import { Request, Response, NextFunction } from "express";
import { FollowSupplier } from "../models/FollowSupplier";
import { User } from "../models/User";

export async function followSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { supplier_id } = req.body;

    if (!supplier_id) return res.status(400).json({ success: false, error: "supplier_id is required" });

    if (Number(supplier_id) === userId) {
      return res.status(400).json({ success: false, error: "لا يمكنك متابعة نفسك" });
    }

    const supplier = await User.findByPk(supplier_id);
    if (!supplier) return res.status(404).json({ success: false, error: "Supplier not found" });

    // Check if already following
    const existing = await FollowSupplier.findOne({
      where: { follower_id: userId, supplier_id: Number(supplier_id) }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: "أنت تتابع هذا المورد بالفعل" });
    }

    const follow = await FollowSupplier.create({
      follower_id: userId,
      supplier_id: Number(supplier_id)
    });

    res.status(201).json({ success: true, message: "تم متابعة المورد بنجاح", data: follow });
  } catch (err) { next(err); }
}

export async function unfollowSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { supplier_id } = req.params;

    const follow = await FollowSupplier.findOne({
      where: { follower_id: userId, supplier_id: Number(supplier_id) }
    });
    if (!follow) return res.status(404).json({ success: false, error: "أنت لا تتابع هذا المورد" });

    await follow.destroy();
    res.json({ success: true, message: "تم إلغاء المتابعة" });
  } catch (err) { next(err); }
}

export async function getMyFollowing(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;

    const following = await FollowSupplier.findAll({
      where: { follower_id: userId },
      include: [
        { model: User, as: "supplier", attributes: ["id", "name", "company_name", "location", "governorate"] }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: following });
  } catch (err) { next(err); }
}

export async function getSupplierFollowers(req: Request, res: Response, next: NextFunction) {
  try {
    const { supplier_id } = req.params;

    const followers = await FollowSupplier.findAll({
      where: { supplier_id: Number(supplier_id) },
      include: [
        { model: User, as: "follower", attributes: ["id", "name", "company_name"] }
      ]
    });

    res.json({
      success: true,
      data: { supplier_id: Number(supplier_id), follower_count: followers.length, followers }
    });
  } catch (err) { next(err); }
}
