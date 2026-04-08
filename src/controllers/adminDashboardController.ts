import { Request, Response, NextFunction } from "express";
import { sequelize } from "../models";
import { QueryTypes } from "sequelize";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Dispute } from "../models/Dispute";

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    // Revenue stats
    const revenueResult = await sequelize.query(
      `SELECT
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as avg_order_value
       FROM orders WHERE status != 'cancelled'`,
      { type: QueryTypes.SELECT }
    ) as any[];

    // User counts by role
    const userCounts = await sequelize.query(
      `SELECT r.name as role, COUNT(u.id) as count
       FROM users u JOIN roles r ON u.role_id = r.id
       GROUP BY r.name`,
      { type: QueryTypes.SELECT }
    ) as any[];

    // Active vs total users
    const activeUsers = await User.count({ where: { status: "active" } });
    const totalUsers = await User.count();

    // Product stats
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { status: "active" } });

    // Order status breakdown
    const ordersByStatus = await sequelize.query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`,
      { type: QueryTypes.SELECT }
    ) as any[];

    // Top selling products
    const topProducts = await sequelize.query(
      `SELECT p.id, p.name, p.sku, p.image, p.price,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.unit_price) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    ) as any[];

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "buyer", attributes: ["id", "name", "company_name"] },
        { model: User, as: "seller", attributes: ["id", "name", "company_name"] }
      ]
    });

    // Open disputes count
    const openDisputes = await Dispute.count({ where: { status: "open" } });

    res.json({
      success: true,
      data: {
        revenue: {
          total: parseFloat(revenueResult[0]?.total_revenue || "0"),
          total_orders: parseInt(revenueResult[0]?.total_orders || "0"),
          avg_order_value: parseFloat(parseFloat(revenueResult[0]?.avg_order_value || "0").toFixed(2))
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          by_role: userCounts
        },
        products: {
          total: totalProducts,
          active: activeProducts
        },
        orders_by_status: ordersByStatus,
        top_products: topProducts,
        recent_orders: recentOrders,
        open_disputes: openDisputes
      }
    });
  } catch (err) { next(err); }
}

export async function banUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).userId;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (user.id === adminId) {
      return res.status(400).json({ success: false, error: "لا يمكنك حظر نفسك" });
    }

    await user.update({ status: "banned" });

    // Log the ban via AuditLog
    const { AuditLog } = require("../models/AuditLog");
    await AuditLog.create({
      user_id: adminId,
      action: "ban_user",
      entity_type: "user",
      entity_id: user.id,
      details: reason || "No reason provided",
      ip_address: req.ip
    });

    res.json({ success: true, message: `تم حظر المستخدم ${user.name} بنجاح`, data: user });
  } catch (err) { next(err); }
}

export async function unbanUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const adminId = (req as any).userId;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    await user.update({ status: "active" });

    const { AuditLog } = require("../models/AuditLog");
    await AuditLog.create({
      user_id: adminId,
      action: "unban_user",
      entity_type: "user",
      entity_id: user.id,
      details: "User unbanned",
      ip_address: req.ip
    });

    res.json({ success: true, message: `تم إلغاء حظر المستخدم ${user.name} بنجاح`, data: user });
  } catch (err) { next(err); }
}

export async function getBannedUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.findAll({ where: { status: "banned" } });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}
