import { Request, Response, NextFunction } from "express";
import { sequelize } from "../models";
import { QueryTypes } from "sequelize";

export async function getLowStockAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const threshold = Number(req.query.threshold) || 10;

    let whereClause = "";
    const replacements: any = { threshold };

    if (userRole !== "Admin") {
      whereClause = "AND p.supplier_id = :userId";
      replacements.userId = userId;
    }

    const alerts = await sequelize.query(
      `SELECT p.id, p.name, p.sku, p.image, p.quantity as product_qty,
              i.quantity as warehouse_qty, i.id as inventory_id,
              w.id as warehouse_id, w.city as warehouse_city,
              u.name as supplier_name, u.company_name
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       JOIN warehouses w ON i.warehouse_id = w.id
       JOIN users u ON p.supplier_id = u.id
       WHERE i.quantity <= :threshold ${whereClause}
       ORDER BY i.quantity ASC`,
      { replacements, type: QueryTypes.SELECT }
    );

    // Also get products with no inventory records
    const noInventory = await sequelize.query(
      `SELECT p.id, p.name, p.sku, p.image, p.quantity,
              u.name as supplier_name, u.company_name
       FROM products p
       JOIN users u ON p.supplier_id = u.id
       WHERE p.id NOT IN (SELECT DISTINCT product_id FROM inventory)
       AND p.status = 'active'
       ${userRole !== "Admin" ? "AND p.supplier_id = :userId" : ""}
       ORDER BY p.name`,
      { replacements, type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: {
        low_stock: alerts,
        no_inventory: noInventory,
        threshold,
        total_alerts: (alerts as any[]).length + (noInventory as any[]).length
      }
    });
  } catch (err) { next(err); }
}
