import { Request, Response } from "express";
import fs from "fs";
import path from "path";

interface LocationData {
  governorate: string;
  centers: string[];
}

let cachedLocations: LocationData[] | null = null;

function loadLocations(): LocationData[] {
  if (cachedLocations) return cachedLocations;
  const filePath = path.join(__dirname, "../resources/locations_eg.json");
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  cachedLocations = JSON.parse(data) as LocationData[];
  return cachedLocations;
}

export async function getEgyptLocations(_req: Request, res: Response) {
  try {
    const locations = loadLocations();
    if (locations.length === 0) {
      return res.status(404).json({ success: false, error: "Location data not found" });
    }
    res.json({ success: true, data: locations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getGovernorates(_req: Request, res: Response) {
  try {
    const locations = loadLocations();
    if (locations.length === 0) {
      return res.status(404).json({ success: false, error: "Location data not found" });
    }
    const governorates = locations.map((loc, index) => ({
      id: index + 1,
      name: loc.governorate,
      total_centers: loc.centers.length
    }));
    res.json({ success: true, data: governorates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCitiesByGovernorate(req: Request, res: Response) {
  try {
    const locations = loadLocations();
    const govId = Number(req.params.id);

    if (isNaN(govId) || govId < 1 || govId > locations.length) {
      return res.status(404).json({ success: false, error: "Governorate not found" });
    }

    const location = locations[govId - 1];
    res.json({
      success: true,
      data: {
        governorate: location.governorate,
        cities: location.centers.map((name, index) => ({
          id: index + 1,
          name
        }))
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function searchLocations(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ success: false, error: "Query parameter 'q' is required" });
    }

    const locations = loadLocations();
    const query = q.toLowerCase();
    const results: { governorate: string; center: string }[] = [];

    for (const loc of locations) {
      if (loc.governorate.toLowerCase().includes(query)) {
        results.push({ governorate: loc.governorate, center: loc.governorate });
      }
      for (const center of loc.centers) {
        if (center.toLowerCase().includes(query)) {
          results.push({ governorate: loc.governorate, center });
        }
      }
    }

    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
