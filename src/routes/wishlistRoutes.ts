import { Router } from "express";
import { addToWishlist, getMyWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlistController";
import { requireAuth } from "../middleware/auth";

export const wishlistRouter = Router();

wishlistRouter.get("/", requireAuth, getMyWishlist);
wishlistRouter.post("/", requireAuth, addToWishlist);
wishlistRouter.delete("/clear", requireAuth, clearWishlist);
wishlistRouter.delete("/:id", requireAuth, removeFromWishlist);
