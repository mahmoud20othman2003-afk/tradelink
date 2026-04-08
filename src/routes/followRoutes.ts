import { Router } from "express";
import { followSupplier, unfollowSupplier, getMyFollowing, getSupplierFollowers } from "../controllers/followSupplierController";
import { requireAuth } from "../middleware/auth";

export const followRouter = Router();

followRouter.get("/my-following", requireAuth, getMyFollowing);
followRouter.post("/", requireAuth, followSupplier);
followRouter.delete("/:supplier_id", requireAuth, unfollowSupplier);
followRouter.get("/supplier/:supplier_id/followers", getSupplierFollowers);
