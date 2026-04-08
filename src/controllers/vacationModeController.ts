import { Request, Response } from "express";
import { VacationMode } from "../models/VacationMode";
import { User } from "../models/User";

export async function getVacationStatus(req: Request, res: Response) {
  try {
    const supplierId = parseInt(req.params.supplierId);
    const vacation = await VacationMode.findOne({
      where: { supplier_id: supplierId },
      include: [{ model: User, as: "supplier", attributes: ["id", "name", "company_name"] }]
    });
    if (!vacation) {
      return res.json({ success: true, data: { supplier_id: supplierId, is_active: false, message: "Store is open" } });
    }
    res.json({ success: true, data: vacation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleVacation(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { is_active, message, auto_reply, starts_at, ends_at } = req.body;

    const [vacation, created] = await VacationMode.findOrCreate({
      where: { supplier_id: userId },
      defaults: {
        supplier_id: userId,
        is_active: is_active ?? true,
        message: message || "المتجر في إجازة مؤقتة",
        auto_reply: auto_reply || "شكراً لتواصلك، المتجر حالياً في إجازة وسنعود قريباً",
        starts_at: starts_at ? new Date(starts_at) : new Date(),
        ends_at: ends_at ? new Date(ends_at) : null
      }
    });

    if (!created) {
      await vacation.update({
        is_active: is_active ?? !vacation.is_active,
        message: message !== undefined ? message : vacation.message,
        auto_reply: auto_reply !== undefined ? auto_reply : vacation.auto_reply,
        starts_at: starts_at ? new Date(starts_at) : vacation.starts_at,
        ends_at: ends_at ? new Date(ends_at) : vacation.ends_at
      });
    }

    res.json({ success: true, data: vacation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
