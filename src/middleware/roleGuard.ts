import { Request, Response, NextFunction } from "express";
import { requireAuth } from "./auth";

/**
 * Generic role guard — accepts one or more role names.
 * Must be used after requireAuth so that req.userRole is set.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const userRole = (req as any).userRole;
      if (roles.includes(userRole)) {
        return next();
      }
      return res.status(403).json({
        success: false,
        error: `Access denied: requires ${roles.join(" or ")} role`
      });
    });
  };
}

export const requireSupplier = requireRole("Supplier", "Admin");
export const requireWholesaler = requireRole("Wholesaler", "Admin");
export const requireRetailer = requireRole("Retailer", "Admin");
export const requireSupplierOrWholesaler = requireRole("Supplier", "Wholesaler", "Admin");
