import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { sequelize } from "../models";
import { QueryTypes } from "sequelize";

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { target_type, target_id, rating, comment } = req.body;
    const reviewer_id = (req as any).userId;

    if (!target_type || !target_id || !rating) {
      return res.status(400).json({ success: false, error: "target_type, target_id, and rating are required" });
    }

    if (!["supplier", "product"].includes(target_type)) {
      return res.status(400).json({ success: false, error: "target_type must be 'supplier' or 'product'" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "rating must be between 1 and 5" });
    }

    // Verify target exists
    if (target_type === "supplier") {
      const user = await User.findByPk(target_id);
      if (!user) return res.status(404).json({ success: false, error: "Supplier not found" });
    } else {
      const product = await Product.findByPk(target_id);
      if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({
      where: { reviewer_id, target_type, target_id }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: "لقد قمت بتقييم هذا العنصر مسبقاً" });
    }

    const review = await Review.create({
      reviewer_id,
      target_type,
      target_id,
      rating,
      comment: comment || null
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function getReviewsByTarget(req: Request, res: Response, next: NextFunction) {
  try {
    const { target_type, target_id } = req.params;

    if (!["supplier", "product"].includes(target_type)) {
      return res.status(400).json({ success: false, error: "target_type must be 'supplier' or 'product'" });
    }

    const reviews = await Review.findAll({
      where: { target_type, target_id: Number(target_id) },
      include: [{ model: User, as: "reviewer", attributes: ["id", "name", "company_name"] }],
      order: [["created_at", "DESC"]]
    });

    // Calculate average rating
    const avgResult = await sequelize.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE target_type = ? AND target_id = ?`,
      { replacements: [target_type, target_id], type: QueryTypes.SELECT }
    ) as any[];

    const avg_rating = parseFloat(parseFloat(avgResult[0]?.avg_rating || "0").toFixed(1));
    const total_reviews = parseInt(avgResult[0]?.total_reviews || "0");

    // Rating distribution
    const distribution = await sequelize.query(
      `SELECT rating, COUNT(*) as count FROM reviews
       WHERE target_type = ? AND target_id = ?
       GROUP BY rating ORDER BY rating DESC`,
      { replacements: [target_type, target_id], type: QueryTypes.SELECT }
    ) as any[];

    res.json({
      success: true,
      data: {
        reviews,
        summary: {
          avg_rating,
          total_reviews,
          distribution
        }
      }
    });
  } catch (err) { next(err); }
}

export async function updateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const reviewer_id = (req as any).userId;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ success: false, error: "Review not found" });
    if (review.reviewer_id !== reviewer_id) {
      return res.status(403).json({ success: false, error: "لا يمكنك تعديل تقييم شخص آخر" });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, error: "rating must be between 1 and 5" });
    }

    await review.update({
      rating: rating !== undefined ? rating : review.rating,
      comment: comment !== undefined ? comment : review.comment
    });

    res.json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ success: false, error: "Review not found" });

    // Only the reviewer or an admin can delete
    if (review.reviewer_id !== userId && userRole !== "Admin") {
      return res.status(403).json({ success: false, error: "غير مسموح بحذف هذا التقييم" });
    }

    await review.destroy();
    res.json({ success: true, message: "تم حذف التقييم بنجاح" });
  } catch (err) { next(err); }
}

export async function getTopRatedSuppliers(_req: Request, res: Response, next: NextFunction) {
  try {
    const topSuppliers = await sequelize.query(
      `SELECT u.id, u.name, u.company_name, u.location, u.governorate,
              ROUND(AVG(r.rating), 1) as avg_rating,
              COUNT(r.id) as total_reviews
       FROM reviews r
       JOIN users u ON r.target_id = u.id
       WHERE r.target_type = 'supplier'
       GROUP BY u.id
       HAVING total_reviews >= 1
       ORDER BY avg_rating DESC, total_reviews DESC
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: topSuppliers });
  } catch (err) { next(err); }
}

export async function getTopRatedProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const topProducts = await sequelize.query(
      `SELECT p.id, p.name, p.sku, p.price, p.image,
              ROUND(AVG(r.rating), 1) as avg_rating,
              COUNT(r.id) as total_reviews
       FROM reviews r
       JOIN products p ON r.target_id = p.id
       WHERE r.target_type = 'product'
       GROUP BY p.id
       HAVING total_reviews >= 1
       ORDER BY avg_rating DESC, total_reviews DESC
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: topProducts });
  } catch (err) { next(err); }
}
