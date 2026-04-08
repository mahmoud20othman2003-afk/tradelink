import { Request, Response, NextFunction } from "express";
import { ShippingZone } from "../models/ShippingZone";

// Map governorate to its shipping zone
function findZoneForGovernorate(zones: ShippingZone[], governorate: string): ShippingZone | undefined {
  return zones.find(zone => {
    const govList = zone.governorates.split(",").map(g => g.trim());
    return govList.includes(governorate);
  });
}

export async function calculateShippingCost(req: Request, res: Response, next: NextFunction) {
  try {
    const { origin_governorate, destination_governorate, weight_kg } = req.body;

    if (!origin_governorate || !destination_governorate) {
      return res.status(400).json({
        success: false,
        error: "origin_governorate and destination_governorate are required"
      });
    }

    const weight = Number(weight_kg) || 1;
    const zones = await ShippingZone.findAll();

    const originZone = findZoneForGovernorate(zones, origin_governorate);
    const destZone = findZoneForGovernorate(zones, destination_governorate);

    if (!originZone || !destZone) {
      return res.status(400).json({
        success: false,
        error: "محافظة المصدر أو الوجهة غير معروفة"
      });
    }

    // Same zone = base cost, different zones = combined cost
    let shippingCost: number;
    let estimatedDaysMin: number;
    let estimatedDaysMax: number;

    if (originZone.id === destZone.id) {
      // Same zone shipping
      shippingCost = Number(destZone.base_cost) + (weight * Number(destZone.cost_per_kg));
      estimatedDaysMin = destZone.estimated_days_min;
      estimatedDaysMax = destZone.estimated_days_max;
    } else {
      // Cross-zone shipping: use the higher cost zone + surcharge
      const maxBaseCost = Math.max(Number(originZone.base_cost), Number(destZone.base_cost));
      const maxPerKg = Math.max(Number(originZone.cost_per_kg), Number(destZone.cost_per_kg));
      const crossZoneSurcharge = 15; // EGP surcharge for cross-zone
      shippingCost = maxBaseCost + (weight * maxPerKg) + crossZoneSurcharge;
      estimatedDaysMin = Math.max(originZone.estimated_days_min, destZone.estimated_days_min) + 1;
      estimatedDaysMax = Math.max(originZone.estimated_days_max, destZone.estimated_days_max) + 2;
    }

    res.json({
      success: true,
      data: {
        origin: { governorate: origin_governorate, zone: originZone.zone_name },
        destination: { governorate: destination_governorate, zone: destZone.zone_name },
        weight_kg: weight,
        shipping_cost: Math.round(shippingCost * 100) / 100,
        currency: "EGP",
        estimated_delivery: {
          min_days: estimatedDaysMin,
          max_days: estimatedDaysMax
        },
        same_zone: originZone.id === destZone.id
      }
    });
  } catch (err) { next(err); }
}

export async function listShippingZones(_req: Request, res: Response, next: NextFunction) {
  try {
    const zones = await ShippingZone.findAll();
    res.json({ success: true, data: zones });
  } catch (err) { next(err); }
}

export async function createShippingZone(req: Request, res: Response, next: NextFunction) {
  try {
    const { zone_name, governorates, base_cost, cost_per_kg, estimated_days_min, estimated_days_max } = req.body;

    if (!zone_name || !governorates || base_cost === undefined || cost_per_kg === undefined) {
      return res.status(400).json({
        success: false,
        error: "zone_name, governorates, base_cost, and cost_per_kg are required"
      });
    }

    const zone = await ShippingZone.create({
      zone_name,
      governorates,
      base_cost: Number(base_cost),
      cost_per_kg: Number(cost_per_kg),
      estimated_days_min: Number(estimated_days_min) || 1,
      estimated_days_max: Number(estimated_days_max) || 3
    });

    res.status(201).json({ success: true, data: zone });
  } catch (err) { next(err); }
}

export async function updateShippingZone(req: Request, res: Response, next: NextFunction) {
  try {
    const zone = await ShippingZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ success: false, error: "Shipping zone not found" });
    await zone.update(req.body);
    res.json({ success: true, data: zone });
  } catch (err) { next(err); }
}
