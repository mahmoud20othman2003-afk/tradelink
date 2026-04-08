import { Router } from "express";
import { getEgyptLocations, getGovernorates, getCitiesByGovernorate, searchLocations } from "../controllers/locationController";

export const locationRouter = Router();

locationRouter.get("/egypt", getEgyptLocations);
locationRouter.get("/governorates", getGovernorates);
locationRouter.get("/governorates/:id/cities", getCitiesByGovernorate);
locationRouter.get("/search", searchLocations);
