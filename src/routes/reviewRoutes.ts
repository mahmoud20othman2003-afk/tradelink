import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createReview,
  getReviewsByTarget,
  updateReview,
  deleteReview,
  getTopRatedSuppliers,
  getTopRatedProducts
} from "../controllers/reviewController";

export const reviewRouter = Router();

// Public: view reviews and top rated
reviewRouter.get("/top-suppliers", getTopRatedSuppliers);
reviewRouter.get("/top-products", getTopRatedProducts);
reviewRouter.get("/:target_type/:target_id", getReviewsByTarget);

// Authenticated: create, update, delete reviews
reviewRouter.post("/", requireAuth, createReview);
reviewRouter.put("/:id", requireAuth, updateReview);
reviewRouter.delete("/:id", requireAuth, deleteReview);
