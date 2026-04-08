import { Request, Response } from "express";
import { UnitConversion } from "../models/UnitConversion";

export async function listConversions(req: Request, res: Response) {
  try {
    const category = req.query.category as string | undefined;
    const where: any = {};
    if (category) where.category = category;

    const conversions = await UnitConversion.findAll({ where, order: [["category", "ASC"], ["from_unit", "ASC"]] });
    res.json({ success: true, data: conversions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function convert(req: Request, res: Response) {
  try {
    const { from_unit, to_unit, value } = req.body;
    if (!from_unit || !to_unit || value === undefined) {
      return res.status(400).json({ success: false, error: "from_unit, to_unit, and value are required" });
    }

    // Direct conversion
    let conversion = await UnitConversion.findOne({ where: { from_unit, to_unit } });
    if (conversion) {
      const result = value * Number(conversion.factor);
      return res.json({ success: true, data: { from_unit, to_unit, input_value: value, result: Math.round(result * 1000000) / 1000000, factor: conversion.factor } });
    }

    // Reverse conversion
    conversion = await UnitConversion.findOne({ where: { from_unit: to_unit, to_unit: from_unit } });
    if (conversion) {
      const result = value / Number(conversion.factor);
      return res.json({ success: true, data: { from_unit, to_unit, input_value: value, result: Math.round(result * 1000000) / 1000000, factor: 1 / Number(conversion.factor) } });
    }

    return res.status(404).json({ success: false, error: `No conversion found from ${from_unit} to ${to_unit}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addConversion(req: Request, res: Response) {
  try {
    const { from_unit, to_unit, factor, category } = req.body;
    if (!from_unit || !to_unit || !factor) {
      return res.status(400).json({ success: false, error: "from_unit, to_unit, and factor are required" });
    }

    const conversion = await UnitConversion.create({ from_unit, to_unit, factor, category });
    res.status(201).json({ success: true, data: conversion });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
