import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface SubscriptionPlanAttributes {
  id: number;
  name: string;
  tier: "basic" | "gold" | "premium";
  price_monthly: number;
  price_yearly: number;
  max_products: number;
  max_warehouses: number;
  commission_discount: number;
  features: string | null;
  status: "active" | "inactive";
  created_at: Date;
}

export type SubscriptionPlanCreationAttributes = Optional<
  SubscriptionPlanAttributes,
  "id" | "commission_discount" | "features" | "status" | "created_at"
>;

export class SubscriptionPlan
  extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes>
  implements SubscriptionPlanAttributes {
  public id!: number;
  public name!: string;
  public tier!: "basic" | "gold" | "premium";
  public price_monthly!: number;
  public price_yearly!: number;
  public max_products!: number;
  public max_warehouses!: number;
  public commission_discount!: number;
  public features!: string | null;
  public status!: "active" | "inactive";
  public created_at!: Date;
}

SubscriptionPlan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    tier: { type: DataTypes.STRING, allowNull: false },
    price_monthly: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    price_yearly: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    max_products: { type: DataTypes.INTEGER, allowNull: false },
    max_warehouses: { type: DataTypes.INTEGER, allowNull: false },
    commission_discount: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    features: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "subscription_plans", timestamps: false }
);
