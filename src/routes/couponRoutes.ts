import { Router } from "express";
import { createCoupon, listCoupons, validateCoupon, updateCoupon } from "../controllers/couponController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const couponRouter = Router();

couponRouter.get("/", requireAdmin, listCoupons);
couponRouter.post("/", requireAdmin, createCoupon);
couponRouter.post("/validate", requireAuth, validateCoupon);
couponRouter.patch("/:id", requireAdmin, updateCoupon);
