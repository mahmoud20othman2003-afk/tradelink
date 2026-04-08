import { Router } from "express";
import { listShipments, getShipment, trackShipment, createShipment, updateShipmentStatus } from "../controllers/shipmentController";
import { calculateShippingCost, listShippingZones, createShippingZone, updateShippingZone } from "../controllers/shippingCostController";
import { requireAdmin } from "../middleware/auth";

export const shipmentRouter = Router();

shipmentRouter.get("/", listShipments);
shipmentRouter.post("/", createShipment);
shipmentRouter.get("/track/:tracking_number", trackShipment);
shipmentRouter.get("/zones", listShippingZones);
shipmentRouter.post("/zones", requireAdmin, createShippingZone);
shipmentRouter.put("/zones/:id", requireAdmin, updateShippingZone);
shipmentRouter.post("/calculate-cost", calculateShippingCost);
shipmentRouter.get("/:id", getShipment);
shipmentRouter.patch("/:id/status", updateShipmentStatus);
