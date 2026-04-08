import { Router } from "express";
import { setTieredPrices, getTieredPrices, calculatePrice } from "../controllers/tieredPriceController";
import { requireAuth } from "../middleware/auth";

export const tieredPriceRouter = Router();

tieredPriceRouter.get("/:product_id", getTieredPrices);
tieredPriceRouter.post("/", requireAuth, setTieredPrices);
tieredPriceRouter.post("/calculate", calculatePrice);
